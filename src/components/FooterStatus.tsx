import { useEffect, useState } from 'react';
import { Clock, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Show the visitor's own local time so the footer reads correctly worldwide,
// labelled with their UTC offset (e.g. "UTC+7", "UTC-5:30").
const localFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function utcOffsetLabel() {
  // getTimezoneOffset(): minutes the local zone is BEHIND UTC (so it's negated).
  const minutes = -new Date().getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

function useLocalClock() {
  const [time, setTime] = useState(() => localFormatter.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(localFormatter.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useSiteViews() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      // Count one visit per browser session, then just read the running total
      // on subsequent navigations / re-mounts (also dodges StrictMode double
      // invoke and inflated reload counts).
      const alreadyCounted = sessionStorage.getItem('sv_counted') === '1';
      try {
        if (!alreadyCounted) {
          const { data, error } = await supabase.rpc('increment_site_views');
          if (error) throw error;
          sessionStorage.setItem('sv_counted', '1');
          if (active && typeof data === 'number') setViews(data);
        } else {
          const { data, error } = await supabase
            .from('site_views')
            .select('total')
            .eq('id', 1)
            .single();
          if (error) throw error;
          if (active && data) setViews(data.total);
        }
      } catch (e) {
        // Counter is non-critical decoration — fail silently if the migration
        // hasn't been run yet or Supabase is unreachable.
        console.warn('[site_views] unavailable:', e);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return views;
}

export default function FooterStatus() {
  const time = useLocalClock();
  const views = useSiteViews();
  const offset = utcOffsetLabel();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted">
      <span className="flex items-center gap-2" title={`Your local time (${offset})`}>
        <Clock className="w-4 h-4 shrink-0" />
        <span className="tabular-nums tracking-wide">{time}</span>
        <span className="text-muted/60">{offset}</span>
      </span>

      <span className="flex items-center gap-2" title="Total website views">
        <Eye className="w-4 h-4 shrink-0" />
        <span className="tabular-nums tracking-wide text-text-primary/80">
          {views === null ? '—' : views.toLocaleString('en-US')}
        </span>
        <span className="text-muted/60">views</span>
      </span>
    </div>
  );
}
