'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePendingAppointmentsCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const fetch = async () => {
      try {
        const supabase = createClient();
        const { count: c } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        setCount(c ?? 0);
      } catch {
        // silently ignore
      }
    };

    fetch();
  }, [enabled]);

  return count;
}
