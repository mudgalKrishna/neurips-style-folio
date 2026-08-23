import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Illustrated 2D room intro, staged to read as 3D:
 * - the whole scene tilts in perspective toward the cursor (rotateX/rotateY)
 * - a slow idle sway keeps it alive even with no pointer input
 * - drifting light-dust particles add motion on top of the flat art
 * - a precisely-mapped clickable hotspot sits over the open journal
 * - a looping training-viz video is corner-pinned onto the tilted laptop
 *   screen using a proper homography (perspective) transform, so it warps
 *   to fit the screen's actual trapezoid instead of looking pasted on
 */

const IMAGE_SRC = "/room-scene.png";
const IMAGE_NATURAL_WIDTH = 2752;
const IMAGE_NATURAL_HEIGHT = 1536;

// Bounding box of the open book, in the ORIGINAL image's pixel coordinates.
const BOOK_BOX = { left: 1050, top: 950, right: 1850, bottom: 1340 };

// Four corners of the laptop screen (top-left, top-right, bottom-right,
// bottom-left), in the ORIGINAL image's pixel coordinates. Measured against
// the inner bezel edge (not the outer plastic), with a small safety inset
// toward the quad's center so the video never spills onto the bezel even
// with a few px of measurement error.
const SCREEN_QUAD: [number, number][] = [
  [806, 767], // top-left
  [1158, 759], // top-right
  [1174, 985], // bottom-right
  [801, 1011], // bottom-left
];

const VIDEO_SRC = "/lab-training-loop.mp4";
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

// Gemini watermark sits bottom-right of the source clip, centered ~(1160,600)
// consistently across frames; masked with a generous blurred solid patch
// matching the clip's own background rather than a hard crop.
const LOGO_MASK = { left: 1055, top: 515, width: 220, height: 180 };

const DUST_MOTES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 4 + Math.random() * 34,
  top: 8 + Math.random() * 55,
  size: 2 + Math.random() * 4,
  duration: 9 + Math.random() * 10,
  delay: -Math.random() * 12,
}));

/** Solve the 8-unknown linear system for a 4-point projective homography. */
function solveHomography(src: [number, number][], dst: [number, number][]): number[] {
  const A: number[][] = [];
  const B: number[] = [];
  for (let i = 0; i < 4; i++) {
    const sp = src[i]!;
    const dp = dst[i]!;
    const [x, y] = sp;
    const [X, Y] = dp;
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
    B.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
    B.push(Y);
  }

  // Gaussian elimination with partial pivoting on the augmented 8x8 system.
  const n = 8;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row]![col]!) > Math.abs(A[pivot]![col]!)) pivot = row;
    }
    const tmpRow = A[col]!;
    A[col] = A[pivot]!;
    A[pivot] = tmpRow;
    const tmpB = B[col]!;
    B[col] = B[pivot]!;
    B[pivot] = tmpB;

    const diag = A[col]![col]! || 1e-9;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = A[row]![col]! / diag;
      for (let k = col; k < n; k++) A[row]![k] = A[row]![k]! - factor * A[col]![k]!;
      B[row] = B[row]! - factor * B[col]!;
    }
  }

  return B.map((b, i) => b / (A[i]![i]! || 1e-9));
}

function homographyToMatrix3d(h: number[]): string {
  const h11 = h[0]!;
  const h12 = h[1]!;
  const h13 = h[2]!;
  const h21 = h[3]!;
  const h22 = h[4]!;
  const h23 = h[5]!;
  const h31 = h[6]!;
  const h32 = h[7]!;
  const m = [h11, h21, 0, h31, h12, h22, 0, h32, 0, 0, 1, 0, h13, h23, 0, 1];
  return `matrix3d(${m.map((v) => v.toFixed(6)).join(",")})`;
}

type PointMapper = (sx: number, sy: number) => { x: number; y: number };

function useImageCoverMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  naturalWidth: number,
  naturalHeight: number,
) {
  const [mapFn, setMapFn] = useState<PointMapper | null>(null);

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

      const fn = (sx: number, sy: number) => ({
        x: (sx - cropX) * scale,
        y: (sy - cropY) * scale,
      });
      setMapFn(() => fn);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, naturalWidth, naturalHeight]);

  return mapFn;
}

export function RoomIntro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "leaving">("idle");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const rafRef = useRef<number>(undefined);
  const startTime = useRef(performance.now());

  const mapPoint = useImageCoverMap(containerRef, IMAGE_NATURAL_WIDTH, IMAGE_NATURAL_HEIGHT);
  const dustMotes = useMemo(() => DUST_MOTES, []);

  const bookRect = useMemo(() => {
    if (!mapPoint) return null;
    const p1 = mapPoint(BOOK_BOX.left, BOOK_BOX.top);
    const p2 = mapPoint(BOOK_BOX.right, BOOK_BOX.bottom);
    return { left: p1.x, top: p1.y, width: p2.x - p1.x, height: p2.y - p1.y };
  }, [mapPoint]);

  // Floating "ghost" preview of the portfolio's first page, projecting up
  // off the journal, and the combined clickable region spanning it + the book.
  const floatRect = useMemo(() => {
    if (!bookRect) return null;
    const width = bookRect.width * 0.6;
    const height = width * 1.32;
    return {
      left: bookRect.left + bookRect.width / 2 - width / 2,
      top: bookRect.top - height - bookRect.height * 0.16,
      width,
      height,
    };
  }, [bookRect]);

  const hotspotRect = useMemo(() => {
    if (!bookRect || !floatRect) return null;
    const left = Math.min(floatRect.left, bookRect.left);
    const top = floatRect.top;
    const right = Math.max(floatRect.left + floatRect.width, bookRect.left + bookRect.width);
    const bottom = bookRect.top + bookRect.height;
    return { left, top, width: right - left, height: bottom - top };
  }, [bookRect, floatRect]);

  const screenMatrix3d = useMemo(() => {
    if (!mapPoint) return null;
    const dst = SCREEN_QUAD.map(([sx, sy]) => {
      const p = mapPoint(sx, sy);
      return [p.x, p.y] as [number, number];
    });
    const src: [number, number][] = [
      [0, 0],
      [VIDEO_WIDTH, 0],
      [VIDEO_WIDTH, VIDEO_HEIGHT],
      [0, VIDEO_HEIGHT],
    ];
    const h = solveHomography(src, dst);
    return homographyToMatrix3d(h);
  }, [mapPoint]);

  useEffect(() => {
    const loop = (t: number) => {
      const elapsed = (t - startTime.current) / 1000;

      const idleRy = (Math.sin(elapsed * (2 * Math.PI)) / 7) * 1.4;
      const idleRx = (Math.sin(elapsed * (2 * Math.PI)) / 9 + 1) * 0.7;

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

        {/* looping training-viz video, corner-pinned onto the tilted laptop screen */}
        {imgLoaded && screenMatrix3d && (
          <div
            aria-hidden
            className="absolute overflow-hidden"
            style={{
              top: 0,
              left: 0,
              width: VIDEO_WIDTH,
              height: VIDEO_HEIGHT,
              transform: screenMatrix3d,
              transformOrigin: "0 0",
              pointerEvents: "none",
              boxShadow: "inset 0 0 18px 10px rgba(20,19,17,0.9)",
            }}
          >
            <video
              src={VIDEO_SRC}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover"
              style={{
                filter: "blur(0.3px) brightness(0.95) contrast(1.05)",
                imageRendering: "auto",
                willChange: "transform, filter",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                maskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, black 82%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 100% 100% at 50% 50%, black 82%, transparent 100%)",
              }}
            />
            {/* generous blurred patch masking the source clip's watermark */}
            <div
              style={{
                position: "absolute",
                left: LOGO_MASK.left,
                top: LOGO_MASK.top,
                width: LOGO_MASK.width,
                height: LOGO_MASK.height,
                background: "#1d1d1b",
                filter: "blur(22px)",
              }}
            />
          </div>
        )}

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

        {/* click hotspot spanning the floating preview + the journal, tilts with the image */}
        {bookRect && floatRect && hotspotRect && (
          <button
            type="button"
            onClick={handleOpen}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label="Open the portfolio"
            className="absolute cursor-pointer border-0 bg-transparent p-0"
            style={{
              left: hotspotRect.left,
              top: hotspotRect.top,
              width: hotspotRect.width,
              height: hotspotRect.height,
            }}
          >
            {/* glow over the journal itself */}
            <span
              aria-hidden
              className="absolute rounded-[40%] transition-opacity duration-300"
              style={{
                left: bookRect.left - hotspotRect.left - bookRect.width * 0.14,
                top: bookRect.top - hotspotRect.top - bookRect.height * 0.14,
                width: bookRect.width * 1.28,
                height: bookRect.height * 1.28,
                background:
                  "radial-gradient(closest-side, rgb(240 223 160 / 0.55), rgb(240 223 160 / 0.15) 60%, transparent 80%)",
                opacity: hovered && phase === "idle" ? 1 : 0,
              }}
            />

            {/* floating, blurred ghost of the portfolio's first page, projecting up off the journal */}
            <div
              aria-hidden
              className="absolute"
              style={{
                left: floatRect.left - hotspotRect.left,
                top: floatRect.top - hotspotRect.top,
                width: floatRect.width,
                height: floatRect.height,
                animation: "card-bob 4.5s ease-in-out infinite",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 3,
                  background: "#FAF6EC",
                  border: "1px solid rgba(17,17,17,0.28)",
                  boxShadow:
                    "0 14px 34px rgba(0,0,0,0.32), 0 0 26px rgba(240,223,160,0.28)",
                  filter: hovered ? "blur(1px)" : "blur(3px)",
                  opacity: hovered ? 0.82 : 0.55,
                  transform: hovered ? "scale(1.045)" : "scale(1)",
                  transition: "filter 300ms ease, opacity 300ms ease, transform 300ms ease",
                  padding: "13% 12%",
                }}
              >
                <div style={{ height: "7%", width: "68%", background: "rgba(17,17,17,0.62)", marginBottom: "9%" }} />
                <div style={{ height: "3.5%", width: "42%", background: "rgba(17,17,17,0.32)", marginBottom: "12%" }} />
                <div style={{ height: "2.6%", width: "92%", background: "rgba(17,17,17,0.22)", marginBottom: "6%" }} />
                <div style={{ height: "2.6%", width: "86%", background: "rgba(17,17,17,0.22)", marginBottom: "6%" }} />
                <div style={{ height: "2.6%", width: "90%", background: "rgba(17,17,17,0.22)", marginBottom: "6%" }} />
                <div style={{ height: "2.6%", width: "70%", background: "rgba(17,17,17,0.22)" }} />
              </div>

              {/* crisp, unblurred label — always legible regardless of the card's blur */}
              <div
                className="absolute left-1/2 rounded-full border px-3 py-1"
                style={{
                  bottom: -14,
                  transform: `translateX(-50%) scale(${hovered ? 1.06 : 1})`,
                  borderColor: "rgba(17,17,17,0.25)",
                  background: "rgba(250,246,236,0.94)",
                  backdropFilter: "blur(4px)",
                  transition: "transform 300ms ease",
                }}
              >
                <p className="whitespace-nowrap text-[0.66rem] uppercase tracking-[0.18em] text-[#111111]">
                  click to enter
                </p>
              </div>
            </div>
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

      <style>{`
        @keyframes dust-drift {
          0%   { transform: translate(0, 0); opacity: 0; }
          15%  { opacity: 0.8; }
          50%  { transform: translate(6px, -22px); opacity: 0.5; }
          85%  { opacity: 0.7; }
          100% { transform: translate(-4px, -40px); opacity: 0; }
        }
        @keyframes card-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-9px); }
        }
      `}</style>
    </div>
  );
}
