/**
 * Infinite tool ticker between hero and about. Pure CSS transform animation
 * (GPU-composited, no JS); paused on hover, disabled in perf-lite and for
 * reduced motion.
 */

const ITEMS = [
  "KALI LINUX",
  "NMAP",
  "METASPLOIT",
  "WIRESHARK",
  "BETTERCAP",
  "PYTHON",
  "RED TEAM",
  "BLUE TEAM",
  "UNITY · C#",
  "NEXT.JS",
  "REACT",
  "SAP PI/PO",
  "RASPBERRY PI",
  "TRYHACKME",
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span
          key={item}
          className="flex items-center font-mono text-[0.65rem] tracking-[0.25em] text-muted 3xl:text-sm 4xl:text-base"
        >
          <span className="px-5 3xl:px-8 4xl:px-10">{item}</span>
          <span className="text-accent" style={{ fontSize: "0.5rem" }}>
            ◆
          </span>
        </span>
      ))}
    </div>
  );
}

export function TechMarquee() {
  return (
    <div className="marquee relative overflow-hidden border-y border-white/6 py-3.5 3xl:py-5 4xl:py-6">
      <div className="marquee-track flex w-max">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
