import { GRID_COLUMNS, GRID_GUTTER } from "@/lib/grid";

const GRID_COLOR = "rgba(255, 0, 0, 0.1)";
const CENTER_LINE_COLOR = "rgb(255, 0, 0)";

export function GridOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[150] h-full w-full">
      <div
        className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2"
        style={{ backgroundColor: CENTER_LINE_COLOR }}
      />
      <div
        className="h-full w-full"
        style={{
          paddingLeft: "var(--site-grid-margin-x, 50px)",
          paddingRight: "var(--site-grid-margin-x, 50px)",
        }}
      >
        <div
          className="h-full w-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
            columnGap: GRID_GUTTER,
            height: "100%",
          }}
        >
          {Array.from({ length: GRID_COLUMNS }, (_, index) => (
            <div
              key={index}
              className="h-full min-h-0"
              style={{ backgroundColor: GRID_COLOR }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
