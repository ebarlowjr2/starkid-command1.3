import React, { useEffect, useMemo, useState } from 'react'

function useCountdown(targetIso){
  const target = useMemo(()=> new Date(targetIso).getTime(), [targetIso])
  const [now, setNow] = useState(Date.now())
  useEffect(()=>{
    const id = setInterval(()=> setNow(Date.now()), 1000)
    return ()=> clearInterval(id)
  },[])
  const diff = Math.max(0, target - now)
  const s = Math.floor(diff / 1000)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400)/3600)
  const mins = Math.floor((s % 3600)/60)
  const secs = s % 60
  return { days, hours, mins, secs }
}

export default function CountdownCard({ launch }){
  const { days, hours, mins, secs } = useCountdown(launch.date_utc)
  return (
    <section className="lcars p-4 rounded bg-gradient-to-br from-black to-zinc-900">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl">Next Launch Countdown</h2>
        <span className="text-cyan-400 text-xs">SpaceX</span>
      </div>
      <div className="text-cyan-100">
        <p className="text-sm">{launch.name}</p>
        <p className="text-xs opacity-80">{new Date(launch.date_utc).toLocaleString()}</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[['DAYS',days],['HRS',hours],['MIN',mins],['SEC',secs]].map(([label,val])=>(
            <div key={label} className="p-2 rounded border border-cyan-500/40">
              <div className="text-2xl">{String(val).padStart(2,'0')}</div>
              <div className="text-[10px] opacity-70">{label}</div>
            </div>
          ))}
        </div>
        {launch.links?.patch?.small && (
          <img className="mt-3 w-24" src={launch.links.patch.small} alt="patch" />
        )}
      </div>
    </section>
  )
}