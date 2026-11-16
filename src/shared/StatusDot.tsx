// จุดสถานะ: เขียว = ตัวเองต่อ server ได้และอีกฝั่งของ user เดียวกันเปิดอยู่, แดง = ไม่ครบ
export function StatusDot({ connected, peerName, className }: { connected: boolean; peerName: string; className: string }) {
  const label = connected ? `เชื่อมต่อกับ ${peerName} แล้ว` : `ไม่ได้เชื่อมต่อกับ ${peerName}`;
  return (
    <span
      role="status"
      aria-label={label}
      title={label}
      className={`absolute rounded-full transition-colors duration-300 ${connected ? 'bg-[#22c55e]' : 'bg-[#ef4444]'} ${className}`}
    />
  );
}
