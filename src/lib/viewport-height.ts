export function isIOSMobile(): boolean {
  if (typeof navigator === "undefined") return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function measureViewportUnit(unit: "lvh" | "svh" | "dvh"): number {
  if (typeof document === "undefined") return 0;

  const root = document.documentElement;
  const probe = document.createElement("div");
  probe.style.cssText = `position:fixed;top:0;left:0;width:0;height:100${unit};visibility:hidden;pointer-events:none;`;
  root.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

export function resolveAppHeight(): { height: number; safariOffset: number } {
  const dvh = measureViewportUnit("dvh");
  const lvh = measureViewportUnit("lvh");
  const svh = measureViewportUnit("svh");
  const inner = typeof window !== "undefined" ? window.innerHeight : 0;
  const visual =
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? inner)
      : 0;

  let safariOffset = 0;
  let height = Math.max(dvh, lvh, svh, inner);

  if (
    typeof window !== "undefined" &&
    isIOSMobile() &&
    window.matchMedia("(max-width: 767px)").matches
  ) {
    const visibleHeight = Math.max(dvh, svh, visual || 0);
    height = visibleHeight > 0 ? visibleHeight : inner;
    safariOffset = Math.max(0, lvh - height);
  }

  if (height <= 0 && typeof window !== "undefined") {
    height = inner || 800;
  }

  return { height, safariOffset };
}

export function applyAppHeight(): void {
  const { height, safariOffset } = resolveAppHeight();
  const root = document.documentElement;

  root.style.setProperty("--app-height", `${height}px`);
  root.style.setProperty("--app-height-half", `${height / 2}px`);
  root.style.setProperty("--safari-ui-offset", `${safariOffset}px`);
}

export function viewportHeightInitScript(): string {
  return `(function(){try{var inner=window.innerHeight,vv=window.visualViewport,visual=vv?vv.height:inner;function m(u){var p=document.createElement("div");p.style.cssText="position:fixed;top:0;left:0;width:0;height:100"+u+";visibility:hidden;pointer-events:none";document.documentElement.appendChild(p);var x=p.getBoundingClientRect().height;p.remove();return x||0}var dvh=m("dvh"),lvh=m("lvh"),svh=m("svh"),h=Math.max(dvh,lvh,svh,inner),offset=0,ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1;if(ios&&window.innerWidth<768){var visible=Math.max(dvh,svh,visual||0);h=visible>0?visible:inner;offset=Math.max(0,lvh-h)}if(window.innerWidth<=767){document.documentElement.classList.add("mobile-native-scroll")}document.documentElement.style.setProperty("--safari-ui-offset",offset+"px");document.documentElement.style.setProperty("--app-height",h+"px");document.documentElement.style.setProperty("--app-height-half",(h/2)+"px")}catch(e){}})();`;
}
