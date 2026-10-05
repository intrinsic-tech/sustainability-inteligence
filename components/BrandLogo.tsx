import Image from "next/image";

type BrandLogoProps = {
  // The logo has white letters, so on light backgrounds it sits on a dark plate.
  onLight?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ onLight = false, className, priority }: BrandLogoProps) {
  return (
    <span
      className={["brand-logo", onLight && "brand-logo-plate", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src="/login/logo.png"
        alt="Climes Intelligence"
        width={2121}
        height={739}
        priority={priority}
      />
    </span>
  );
}
