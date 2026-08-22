import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Illustrated 2D room intro. A single background illustration (the desk
 * scene) fills the viewport with a subtle mouse-parallax drift. The open
 * book on the desk is a precisely-mapped clickable hotspot — precise
 * because the image is shown with object-fit: cover, which crops
 * differently depending on viewport aspect ratio, so the hotspot's pixel
 * position is recomputed from the actual rendered crop on every resize
 * rather than hard-coded as a fixed percentage.
 */

const IMAGE_SRC = "/room-scene.png";
const IMAGE_NATURAL_WIDTH = 2752;
const IMAGE_NATURAL_HEIGHT = 1536;

// Bounding box of the open book in the ORIGINAL image's pixel coordinates.
// Re-measure and adjust these four numbers if you swap in a different
// illustration or the book moves.
const BOOK_BOX = { left: 1050, top: 950, right: 1850, bottom: 1340 };

function useCoverMapping(
  containerRef: React.RefObject<HTMLDivElement | null>,
  naturalWidth: number,
  naturalHeight: number,
) {
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      if (!cw || !ch) return;

      const containerAspect = cw / ch;
      const imageAspect = naturalWidth / naturalHeight;

      let scale: number;
      let cropX = 0;
      let cropY = 0;

      if (containerAspect > imageAspect) {
        // Container relatively wider -> image scaled to container width,
        // top/bottom get cropped.
        scale = cw / naturalWidth;
        const visibleHeightSrc = ch / scale;
        cropY = (naturalHeight - visibleHeightSrc) / 2;
      } else {
        // Container relatively taller/narrower -> image scaled to
        // container height, left/right get cropped.
        scale = ch / naturalHeight;
        const visibleWidthSrc = cw / scale;
        cropX = (naturalWidth - visibleWidthSrc) / 2;
      }

      const toContainer = (sx: number, sy: number) => ({
        x: (sx - cropX) * scale,
        y: (sy - cropY) * scale,
      });

      const p1 = toContainer(BOOK_BOX.left, BOOK_BOX.top);
      const p2 = toContainer(BOOK_BOX.right, BOOK_BOX.bottom);

      setRect({ left: p1.x, top: p1.y, width: p2.x - p1.x, height: p2.y - p1.y });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, naturalWidth, naturalHeight]);

  return rect;
}

export function RoomIntro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "leaving">("idle");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(undefined);

  const bookRect = useCoverMapping(containerRef, IMAGE_NATURAL_WIDTH, IMAGE_NATURAL_HEIGHT);

  useEffect(() => {
    const loop = () => {
      if (parallaxRef.current) {
        const targetX = pointer.current.x * 14;
        const targetY = pointer.current.y * 8;
        const current = parallaxRef.current.style.transform;
        const match = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(current);
        const cx = match ? parseFloat(match[1] ?? "0") : 0;
        const cy = match ? parseFloat(match[2] ?? "0") : 0;
        const nx = cx + (targetX - cx) * 0.06;
        const ny = cy + (targetY - cy) * 0.06;
        parallaxRef.current.style.transform = `translate3d(${nx}px, ${ny}px, 0) scale(1.03)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointer.current = { x: nx, y: ny };
  }, []);

  const handleOpen = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("opening");
    window.setTimeout(() => {
      onEnter();
      setPhase("leaving");
    }, 750);
  }, [phase, onEnter]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className="fixed inset-0 z-[60] overflow-hidden bg-[#FAF6EC]"
      style={{
        opacity: phase === "leaving" ? 0 : 1,
        transition: "opacity 650ms ease",
        pointerEvents: phase === "leaving" ? "none" : "auto",
      }}
    >
      <div
        ref={parallaxRef}
        className="absolute inset-[-3%]"
        style={{
          transform: "translate3d(0px, 0px, 0) scale(1.03)",
          transition: "filter 700ms ease, opacity 500ms ease",
          filter: phase === "opening" ? "blur(2px) brightness(1.1)" : "none",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative scene, described via aria-hidden */}
        <img
          src={IMAGE_SRC}
          aria-hidden
          onLoad={() => setImgLoaded(true)}
          className="h-full w-full object-cover"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 900ms ease",
          }}
        />
      </div>

      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6EC]">
          <p className="text-sm uppercase tracking-[0.25em] text-[#8a8272]">Krishna Mudgal</p>
        </div>
      )}

      {/* click hotspot over the open book, precisely mapped to the rendered crop */}
      {bookRect && (
        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Open the portfolio"
          className="absolute cursor-pointer border-0 bg-transparent p-0"
          style={{
            left: bookRect.left,
            top: bookRect.top,
            width: bookRect.width,
            height: bookRect.height,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-[-14%] rounded-[40%] transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(closest-side, rgb(240 223 160 / 0.55), rgb(240 223 160 / 0.15) 60%, transparent 80%)",
              opacity: hovered && phase === "idle" ? 1 : 0,
            }}
          />
        </button>
      )}

      {/* cream cross-fade overlay for the click transition */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#FAF6EC]"
        style={{
          opacity: phase === "idle" ? 0 : 1,
          transition: "opacity 650ms ease",
        }}
      />

      <p
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.72rem] uppercase tracking-[0.2em] text-[#3A342C]"
        style={{
          opacity: phase === "idle" && imgLoaded ? (hovered ? 1 : 0.75) : 0,
          transition: "opacity 400ms ease",
        }}
      >
        click the journal to enter
      </p>
    </div>
  );
}
