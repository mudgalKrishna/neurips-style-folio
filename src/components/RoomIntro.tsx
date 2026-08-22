import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Illustrated 2D room intro, staged to read as 3D:
 * - the whole scene tilts in perspective toward the cursor (rotateX/rotateY),
 *   which sells depth far better than flat translation alone
 * - a slow idle sway keeps it alive even with no pointer input
 * - drifting light-dust particles add a layer of motion on top of the flat art
 * - a precisely-mapped clickable hotspot sits over the open journal, recomputed
 *   on resize since object-fit: cover crops differently per aspect ratio
 */

const IMAGE_SRC = "/room-scene.png";
const IMAGE_NATURAL_WIDTH = 2752;
const IMAGE_NATURAL_HEIGHT = 1536;

// Bounding box of the open book in the ORIGINAL image's pixel coordinates.
const BOOK_BOX = { left: 1050, top: 950, right: 1850, bottom: 1340 };

const DUST_MOTES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 4 + Math.random() * 34, // cluster loosely near the window, left third
  top: 8 + Math.random() * 55,
  size: 2 + Math.random() * 4,
  duration: 9 + Math.random() * 10,
  delay: -Math.random() * 12,
}));

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
        scale = cw / naturalWidth;
        const visibleHeightSrc = ch / scale;
        cropY = (naturalHeight - visibleHeightSrc) / 2;
      } else {
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
  const tiltRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 }); // normalized -1..1, smoothed target
  const current = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const rafRef = useRef<number>(undefined);
  const startTime = useRef(performance.now());

  const bookRect = useCoverMapping(containerRef, IMAGE_NATURAL_WIDTH, IMAGE_NATURAL_HEIGHT);
  const dustMotes = useMemo(() => DUST_MOTES, []);

  useEffect(() => {
    const loop = (t: number) => {
      const elapsed = (t - startTime.current) / 1000;

      // gentle idle sway, always running
      const idleRy = Math.sin(elapsed * (2 * Math.PI) / 7) * 1.4;
      const idleRx = Math.sin(elapsed * (2 * Math.PI) / 9 + 1) * 0.7;

      const targetRy = idleRy + pointer.current.x * 4.5;
      const targetRx = idleRx - pointer.current.y * 2.6;
      const targetTx = pointer.current.x * 10;
      const targetTy = pointer.current.y * 6;

      const c = current.current;
      c.ry += (targetRy - c.ry) * 0.045;
      c.rx += (targetRx - c.rx) * 0.045;
      c.tx += (targetTx - c.tx) * 0.06;
      c.ty += (targetTy - c.ty) * 0.06;

      if (tiltRef.current) {
        tiltRef.current.style.transform =
          `perspective(1400px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) ` +
          `translate3d(${c.tx}px, ${c.ty}px, 0) scale(1.08)`;
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
        ref={tiltRef}
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transition: "filter 700ms ease",
          filter: phase === "opening" ? "blur(2px) brightness(1.1)" : "none",
          willChange: "transform",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative scene */}
        <img
          src={IMAGE_SRC}
          aria-hidden
          onLoad={() => setImgLoaded(true)}
          className="h-full w-full object-cover"
          style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 900ms ease" }}
        />

        {/* drifting light dust, on top of the image, inside the same tilted layer */}
        {imgLoaded &&
          dustMotes.map((d) => (
            <span
              key={d.id}
              aria-hidden
              className="absolute rounded-full"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: d.size,
                height: d.size,
                background: "radial-gradient(circle, rgba(240,223,160,0.9), rgba(240,223,160,0) 70%)",
                animation: `dust-drift ${d.duration}s ease-in-out ${d.delay}s infinite`,
              }}
            />
          ))}

        {/* click hotspot over the open book, tilts together with the image */}
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
      </div>

      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6EC]">
          <p className="text-sm uppercase tracking-[0.25em] text-[#8a8272]">Krishna Mudgal</p>
        </div>
      )}

      {/* cream cross-fade overlay for the click transition */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#FAF6EC]"
        style={{ opacity: phase === "idle" ? 0 : 1, transition: "opacity 650ms ease" }}
      />

      <div
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full border px-4 py-1.5"
        style={{
          borderColor: "rgba(17,17,17,0.25)",
          background: "rgba(250,246,236,0.88)",
          backdropFilter: "blur(4px)",
          opacity: phase === "idle" && imgLoaded ? 1 : 0,
          transform: `translateX(-50%) translateY(${phase === "idle" && imgLoaded ? 0 : 6}px) scale(${hovered ? 1.04 : 1})`,
          transition: "opacity 500ms ease, transform 300ms ease",
        }}
      >
        <p className="text-[0.72rem] uppercase tracking-[0.2em] text-[#111111]">
          click the journal to enter
        </p>
      </div>

      <style>{`
        @keyframes dust-drift {
          0%   { transform: translate(0, 0); opacity: 0; }
          15%  { opacity: 0.8; }
          50%  { transform: translate(6px, -22px); opacity: 0.5; }
          85%  { opacity: 0.7; }
          100% { transform: translate(-4px, -40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
