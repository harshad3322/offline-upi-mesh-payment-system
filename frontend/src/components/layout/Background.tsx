export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0B1120]" />
      <div className="absolute -left-32 top-[-8rem] h-96 w-96 rounded-full bg-sky-500/20 blur-3xl animate-pulseGlow" />
      <div className="absolute right-[-8rem] top-28 h-[28rem] w-[28rem] rounded-full bg-indigo-500/15 blur-3xl animate-drift" />
      <div className="absolute bottom-[-10rem] left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-mesh-grid bg-[size:28px_28px] opacity-[0.16]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/20" />
    </div>
  );
}
