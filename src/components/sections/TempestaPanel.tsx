import Image from "next/image";
import { TempestaPlayer } from "@/components/TempestaPlayer";
import { TEMPESTA_RELEASE } from "@/lib/releases";

const TEMPESTA_IMAGE_SCALE = 1.6;

type TempestaPanelProps = {
  streamUrl: string | null;
  className?: string;
  panPx?: number;
  imageScale?: number;
  showTitle?: boolean;
  titleOffsetY?: number;
  titleOpacity?: number;
  playerOpacity?: number;
};

export function TempestaPanel({
  streamUrl,
  className = "",
  panPx = 0,
  imageScale = TEMPESTA_IMAGE_SCALE,
  showTitle = true,
  titleOffsetY = 0,
  titleOpacity = 1,
  playerOpacity = 1,
}: TempestaPanelProps) {
  return (
    <div className={`relative h-dvh overflow-hidden bg-background ${className}`}>
      <div className="absolute inset-0 px-5 py-14 sm:px-8 sm:py-16 md:px-14 lg:py-20">
        <div
          className="relative h-full w-full overflow-hidden md:absolute md:left-0 md:top-0 md:h-[var(--tempesta-img-h)] md:w-full md:will-change-transform"
          style={{
            ["--tempesta-img-h" as string]: `${imageScale * 100}vh`,
            transform: `translateY(-${panPx}px)`,
          }}
        >
          <Image
            src="/releases/Tempesta.jpg"
            alt=""
            fill
            priority
            className="object-cover object-center md:object-top"
            sizes="100vw"
            aria-hidden
          />
        </div>
      </div>

      {showTitle ? (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ opacity: titleOpacity }}
        >
          <div
            className="absolute inset-x-0 top-1/2 flex justify-center px-5 will-change-[transform,opacity] sm:px-8"
            style={{
              transform: `translateY(calc(-50% + ${titleOffsetY}px))`,
            }}
          >
            <div className="flex w-full max-w-[min(100%,320px)] flex-col items-center text-center font-garamond text-site tracking-[0.06em] text-white sm:max-w-[400px]">
              <p className="m-0 italic">New Single from &ldquo;Acque&rdquo;</p>
              <h2 className="m-0 font-normal not-italic">TEMPESTA</h2>
            </div>
          </div>

          {streamUrl ? (
            <div
              className="absolute inset-x-0 top-1/2 flex justify-center px-5 sm:px-8"
              style={{
                transform: `translateY(calc(${titleOffsetY}px + 2.5rem))`,
                opacity: playerOpacity,
                pointerEvents: playerOpacity > 0.45 ? "auto" : "none",
              }}
            >
              <div className="w-full max-w-[min(100%,320px)] sm:max-w-[400px]">
                <TempestaPlayer
                  streamUrl={streamUrl}
                  title={TEMPESTA_RELEASE.title}
                  inline
                  showTitle={false}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
