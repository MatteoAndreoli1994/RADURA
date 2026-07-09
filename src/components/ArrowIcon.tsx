"use client";

const RIGHT_UP_ICON = "/images/right-up.png";

type ArrowIconProps = {
  className?: string;
  size?: number;
  direction?: "left" | "right";
};

export function ArrowIcon({
  className,
  size = 18,
  direction = "right",
}: ArrowIconProps) {
  const path =
    direction === "right"
      ? "M3 9h10M10 5l4 4-4 4"
      : "M15 9H5M8 5l-4 4 4 4";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ExternalLinkIconProps = {
  className?: string;
  size?: number;
};

export function ExternalLinkIcon({
  className,
  size = 14,
}: ExternalLinkIconProps) {
  return (
    <img
      src={RIGHT_UP_ICON}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      className={className}
    />
  );
}
