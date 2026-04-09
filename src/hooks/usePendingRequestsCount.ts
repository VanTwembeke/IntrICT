'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePendingRequestsCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const fetch = async () => {
      try {
        const supabase = createClient();
        const { count: c } = await supabase
          .from('package_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        setCount(c ?? 0);
      } catch {
        // table not yet created — silently ignore
      }
    };

    fetch();
  }, [enabled]);

  return count;
}
