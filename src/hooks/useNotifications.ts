'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  type: 'info' | 'invoice' | 'file' | 'message' | 'alert';
  read: boolean;
  link?: string;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setNotifications((data as Notification[]) ?? []);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    let userId: string | null = null;

    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            );
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    const cleanup = subscribe();
    return () => { cleanup.then((fn) => fn?.()); };
  }, []);

  // ── Mark one as read ───────────────────────────────────────────────────────
  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    const supabase = createClient();
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }, []);

  // ── Mark all as read ───────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);
  }, [notifications]);

  return { notifications, loading, unreadCount, markRead, markAllRead };
}