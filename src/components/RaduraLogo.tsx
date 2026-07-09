type RaduraLogoProps = {
  className?: string;
  /** Kept for backward compatibility; the logo now adapts via a blend effect. */
  light?: boolean;
};

export function RaduraLogo({ className = "" }: RaduraLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo-corvo-white.png"
      alt="Radura"
      width={68}
      height={68}
      className={`radura-logo-img ${className}`}
      draggable={false}
    />
  );
}
