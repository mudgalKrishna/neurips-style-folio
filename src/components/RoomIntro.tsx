import { Suspense, useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A minimal, hand-built 3D room: a desk, a window with directional light,
 * and a "book" (the portfolio) resting on the desk. Clicking the book
 * dollies the camera in and cross-fades to the real paper-styled site.
 *
 * Kept deliberately primitive-only (no external models/textures) so it
 * stays small and has nothing that can fail to load.
 */

const PAPER = "#FAF6EC";
const DESK = "#3A342C";
const DESK_LIGHT = "#4A4230";
const INK = "#111111";
const MARKER = "#F0DFA0";
const MARKER_STRONG = "#E8CE7A";

function makeCoverTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.font = "italic 22px Georgia, 'EB Garamond', serif";
  ctx.fillText("A Portfolio of", canvas.width / 2, 260);

  ctx.font = "bold 34px Georgia, 'EB Garamond', serif";
  ctx.fillText("Krishna Mudgal", canvas.width / 2, 310);

  ctx.font = "16px Georgia, 'EB Garamond', serif";
  ctx.fillStyle = "#555";
  ctx.fillText("A Research Perspective", canvas.width / 2, 345);

  ctx.font = "13px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#8a8272";
  ctx.fillText("click to open", canvas.width / 2, canvas.height - 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(240, 223, 160, 0.85)");
  grad.addColorStop(0.5, "rgba(240, 223, 160, 0.25)");
  grad.addColorStop(1, "rgba(240, 223, 160, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function Book({
  onOpen,
  disabled,
}: {
  onOpen: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const coverTexture = useMemo(() => makeCoverTexture(), []);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetLift = hovered && !disabled ? 0.06 : 0;
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetLift,
      6,
      delta,
    );
  });

  const materials = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.9 }), // +x pages edge
      new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.9 }), // -x
      new THREE.MeshStandardMaterial({ map: coverTexture, roughness: 0.7 }), // +y cover (visible face)
      new THREE.MeshStandardMaterial({ color: INK, roughness: 0.8 }), // -y (against desk)
      new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.9 }), // +z
      new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.9 }), // -z
    ],
    [coverTexture],
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (disabled) return;
      onOpen();
    },
    [disabled, onOpen],
  );

  return (
    <group
      ref={groupRef}
      position={[0, 0.36, 0.15]}
      rotation={[0, -0.06, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!disabled) setHovered(true);
        document.body.style.cursor = disabled ? "default" : "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow material={materials}>
        <boxGeometry args={[1.35, 0.16, 1.85]} />
      </mesh>
    </group>
  );
}

function Scene({
  onOpenBook,
  opening,
  pointer,
}: {
  onOpenBook: () => void;
  opening: boolean;
  pointer: { current: { x: number; y: number } };
}) {
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const groupRef = useRef<THREE.Group>(null);
  const cameraTargetRef = useRef(new THREE.Vector3(0, 1.55, 4.6));

  useFrame(({ camera }, delta) => {
    if (groupRef.current && !opening) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        pointer.current.x * 0.12,
        3,
        delta,
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        pointer.current.y * 0.05,
        3,
        delta,
      );
    }

    const target = opening
      ? new THREE.Vector3(0, 1.05, 1.6)
      : cameraTargetRef.current;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, opening ? 2.2 : 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, opening ? 2.2 : 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, opening ? 2.2 : 4, delta);
    camera.lookAt(0, 0.4, 0);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.55} color={"#5c5346"} />
      <directionalLight
        position={[-3.2, 2.6, 1.4]}
        intensity={1.6}
        color={MARKER}
        castShadow
      />
      <pointLight position={[0.6, 1.4, 1.8]} intensity={0.25} color={MARKER_STRONG} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={DESK} roughness={1} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, 3, -2.4]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={"#332E26"} roughness={1} />
      </mesh>

      {/* window frame + glow */}
      <group position={[-2.6, 3.1, -2.38]}>
        <mesh>
          <planeGeometry args={[2.1, 2.7]} />
          <meshStandardMaterial color={MARKER} emissive={MARKER} emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[2.3, 2.9]} />
          <meshBasicMaterial map={glowTexture} transparent depthWrite={false} />
        </mesh>
      </group>

      {/* desk */}
      <mesh position={[0, -0.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.4, 0.66, 2.6]} />
        <meshStandardMaterial color={DESK_LIGHT} roughness={0.7} />
      </mesh>

      <Book onOpen={onOpenBook} disabled={opening} />
    </group>
  );
}

export function RoomIntro({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"idle" | "opening" | "leaving">("idle");
  const overlayOpacity = phase === "idle" ? 0 : 1;
  const pointer = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback((e: ReactPointerEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.current = { x: nx, y: ny };
  }, []);

  const handleOpen = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("opening");
    window.setTimeout(() => {
      onEnter();
      setPhase("leaving");
    }, 900);
  }, [phase, onEnter]);

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{
        opacity: phase === "leaving" ? 0 : 1,
        transition: "opacity 700ms ease",
        pointerEvents: phase === "leaving" ? "none" : "auto",
      }}
      onPointerMove={handlePointerMove}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.55, 4.6], fov: 42 }}
        gl={{ antialias: true }}
        style={{ background: DESK }}
      >
        <Suspense fallback={null}>
          <Scene onOpenBook={handleOpen} opening={phase !== "idle"} pointer={pointer} />
        </Suspense>
      </Canvas>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: PAPER,
          opacity: overlayOpacity,
          transition: "opacity 700ms ease",
        }}
      />

      <p
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[0.72rem] uppercase tracking-[0.2em]"
        style={{ color: MARKER, opacity: phase === "idle" ? 0.85 : 0, transition: "opacity 400ms ease" }}
      >
        click the book to enter
      </p>
    </div>
  );
}
