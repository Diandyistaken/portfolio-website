import Image from "next/image";

export function AmbientGlow({
  src,
  glow,
  className,
  eager = false,
}: {
  src: string;
  glow: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -z-10 select-none ${className ?? ""}`}
    >
      <div
        className="absolute -inset-10 rounded-full opacity-60 blur-3xl"
        style={{ backgroundColor: glow }}
      />
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] opacity-85">
        <Image
          src={src}
          alt=""
          fill
          loading={eager ? "eager" : "lazy"}
          quality={75}
          sizes="320px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
