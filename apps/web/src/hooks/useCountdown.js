import { useEffect, useMemo, useState } from "react";

export function useCountdown(targetIso) {
  const targetMs = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalMs = Math.max(0, targetMs - nowMs);
  const done = totalMs <= 0;

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { done, days, hours, minutes, seconds, totalMs };
}
