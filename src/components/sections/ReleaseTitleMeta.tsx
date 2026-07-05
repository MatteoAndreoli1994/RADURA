type ReleaseTitleMetaProps = {
  title: string;
  releaseDate?: string;
  onTitleClick?: () => void;
  titleDisabled?: boolean;
  className?: string;
  stacked?: boolean;
};

export function ReleaseTitleMeta({
  title,
  releaseDate,
  onTitleClick,
  titleDisabled = false,
  className = "",
  stacked = false,
}: ReleaseTitleMetaProps) {
  const titleClass = `min-w-0 text-site font-inherit ${
    onTitleClick && !titleDisabled ? "nav-link-hover cursor-pointer" : ""
  } ${titleDisabled ? "cursor-default" : ""}`;

  const layoutClass = stacked
    ? "flex flex-col items-start gap-0.5 md:flex-row md:items-baseline md:justify-between md:gap-3"
    : "flex min-w-0 items-baseline justify-between gap-3";

  return (
    <div className={`${layoutClass} ${className}`}>
      {onTitleClick ? (
        <button
          type="button"
          onClick={onTitleClick}
          disabled={titleDisabled}
          className={`${titleClass} w-fit max-w-full self-start border-0 bg-transparent p-0 text-left`}
        >
          {title}
        </button>
      ) : (
        <span className="min-w-0 flex-1 text-site">{title}</span>
      )}

      {releaseDate ? (
        <time
          dateTime={releaseDate}
          className={`shrink-0 text-[13px] leading-[15px] tracking-wide text-muted tabular-nums ${
            stacked ? "block" : "hidden md:block"
          }`}
        >
          {releaseDate}
        </time>
      ) : null}
    </div>
  );
}
