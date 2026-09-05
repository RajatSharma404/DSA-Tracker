"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, ContactShadows, OrthographicCamera, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Building, BuildingProps } from "./Building";
import { CentralSpire } from "./CentralSpire";
import { cityAudio } from "@/lib/cityAudio";
import { soundEffects } from "@/lib/soundEffects";
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Moon,
  RotateCw,
  Sun,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

export interface LeaderboardUser {
  id: string;
  username: string;
  completedLevels: number;
  lastActivityDate?: string | null;
}

export type CityTheme = "cyberpunk" | "sunset" | "matrix";
export type CameraMode = "iso" | "cinematic" | "top" | "focus";

interface CitySceneProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  reducedEffects?: boolean;
  focusedUserId?: string | null;
  onFocusUser?: (id: string | null) => void;
  theme?: CityTheme;
  onThemeChange?: (theme: CityTheme) => void;
  onInspectUser?: (user: LeaderboardUser) => void;
}

// Floating Sci-Fi Particles Component
const FloatingParticles = ({ theme }: { theme: CityTheme }) => {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particleColor = {
    cyberpunk: "#38bdf8",
    sunset: "#fbbf24",
    matrix: "#34d399",
  }[theme];

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    const pseudo = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (pseudo(i * 5 + 1) - 0.5) * 35,
        y: pseudo(i * 5 + 2) * 18 + 2,
        z: (pseudo(i * 5 + 3) - 0.5) * 35,
        speed: pseudo(i * 5 + 4) * 0.02 + 0.005,
        rotSpeed: pseudo(i * 5 + 5) * 0.02,
      });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.y += p.speed;
      if (p.y > 22) p.y = 2;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.x += p.rotSpeed;
      dummy.rotation.y += p.rotSpeed;
      dummy.scale.setScalar(0.12);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshBasicMaterial color={particleColor} transparent opacity={0.6} />
    </instancedMesh>
  );
};

// Animated Camera Orbit for Cinematic Mode
const CinematicOrbit = ({
  cameraControlsRef,
  enabled,
}: {
  cameraControlsRef: React.RefObject<CameraControls | null>;
  enabled: boolean;
}) => {
  useFrame((_, delta) => {
    if (enabled && cameraControlsRef.current) {
      cameraControlsRef.current.azimuthAngle += delta * 0.12;
    }
  });
  return null;
};

// Glowing Neon Grid Ground Pathways connecting buildings to the Central Spire
const ConnectingPaths = ({
  userPositions,
  theme,
}: {
  userPositions: Record<string, [number, number, number]>;
  theme: CityTheme;
}) => {
  const pathColor = {
    cyberpunk: "#06b6d4",
    sunset: "#f59e0b",
    matrix: "#10b981",
  }[theme];

  const lines = useMemo(() => {
    return Object.values(userPositions).map(([x, , z]) => {
      const points = [
        new THREE.Vector3(x, 0.02, z),
        new THREE.Vector3(x, 0.02, 0),
        new THREE.Vector3(0, 0.02, 0),
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 16, 0.04, 6, false);
      return geometry;
    });
  }, [userPositions]);

  return (
    <group>
      {lines.map((geom, i) => (
        <mesh key={i} geometry={geom}>
          <meshBasicMaterial color={pathColor} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

export const CityScene: React.FC<CitySceneProps> = ({
  users,
  currentUserId,
  reducedEffects = false,
  focusedUserId = null,
  onFocusUser = () => {},
  theme = "cyberpunk",
  onThemeChange = () => {},
  onInspectUser = () => {},
}) => {
  const cameraControlsRef = useRef<CameraControls>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>("iso");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.completedLevels - a.completedLevels);
  }, [users]);

  const totalFloors = useMemo(() => {
    return users.reduce((sum, u) => sum + u.completedLevels, 0);
  }, [users]);

  // Spatial Grid Layout algorithm
  const { buildings, userPositions } = useMemo(() => {
    const layout: (BuildingProps & { isTopPerformer: boolean; isCurrentUser: boolean })[] = [];
    const posMap: Record<string, [number, number, number]> = {};

    const count = sortedUsers.length;
    const cols = Math.ceil(Math.sqrt(count)) || 1;
    const rows = Math.ceil(count / cols) || 1;
    const SPACING = 4.2;

    sortedUsers.forEach((user, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      let x = (col - (cols - 1) / 2) * SPACING;
      let z = (row - (rows - 1) / 2) * SPACING;

      // Leave center clearing for Central Spire
      if (Math.abs(x) < SPACING && Math.abs(z) < SPACING) {
        x += Math.sign(x || 1) * SPACING * 0.8;
        z += Math.sign(z || 1) * SPACING * 0.8;
      }

      posMap[user.id] = [x, 0, z];

      const rank = index + 1;
      let tier: BuildingProps["status"] = "progress";
      if (user.completedLevels >= 15 || rank <= 3) tier = "master";
      else if (user.completedLevels >= 5) tier = "completed";
      else if (user.completedLevels > 0) tier = "progress";
      else tier = "locked";

      layout.push({
        userId: user.id,
        username: user.username,
        completedLevels: user.completedLevels,
        rank,
        status: tier,
        lastActivityDate: user.lastActivityDate,
        position: [x, 0, z],
        isTopPerformer: index === 0,
        isCurrentUser: user.id === currentUserId,
      });
    });

    return { buildings: layout, userPositions: posMap };
  }, [sortedUsers, currentUserId]);

  // Handle Camera Mode Transitions
  useEffect(() => {
    if (!cameraControlsRef.current) return;
    soundEffects.playOpen();

    if (focusedUserId && userPositions[focusedUserId]) {
      const [x, y, z] = userPositions[focusedUserId];
      cameraControlsRef.current.setLookAt(x + 12, y + 12, z + 12, x, y, z, true);
    } else if (cameraMode === "top") {
      cameraControlsRef.current.setLookAt(0, 35, 0.001, 0, 0, 0, true);
    } else if (cameraMode === "cinematic") {
      cameraControlsRef.current.setLookAt(22, 16, 22, 0, 2, 0, true);
    } else {
      // Default Isometric
      cameraControlsRef.current.setLookAt(18, 18, 18, 0, 0, 0, true);
    }
  }, [focusedUserId, cameraMode, userPositions]);

  const handleToggleMute = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const themeColors = {
    cyberpunk: { bg: "#090d16", gridLine: "#1e293b", gridSection: "#38bdf8" },
    sunset: { bg: "#0c0a09", gridLine: "#292524", gridSection: "#f97316" },
    matrix: { bg: "#022c22", gridLine: "#064e3b", gridSection: "#10b981" },
  }[theme];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[440px] bg-[var(--bg-primary)] select-none overflow-hidden rounded-[2.5rem] border border-[var(--border-subtle)] shadow-2xl"
    >
      <Canvas gl={{ antialias: !reducedEffects, alpha: false }} dpr={reducedEffects ? 1 : [1, 2]}>
        <color attach="background" args={[themeColors.bg]} />

        <OrthographicCamera makeDefault position={[22, 22, 22]} zoom={32} near={-100} far={100} />

        {/* Dynamic Lighting */}
        <ambientLight intensity={theme === "sunset" ? 1.0 : 0.7} />
        <directionalLight
          position={[15, 25, 10]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-15, -10, -15]} intensity={0.4} color="#38bdf8" />
        <pointLight position={[0, 8, 0]} intensity={3.0} color="#818cf8" distance={25} />

        {/* Central Spire */}
        <CentralSpire totalFloors={totalFloors} totalUsers={users.length} theme={theme} />

        {/* User Buildings Grid */}
        <group onPointerMissed={() => onFocusUser(null)}>
          {buildings.map((b) => (
            <Building
              key={b.userId}
              {...b}
              theme={theme}
              reducedEffects={reducedEffects}
              isSelected={focusedUserId === b.userId}
              onSelect={(id) => {
                soundEffects.playClick();
                onFocusUser(id);
                const u = users.find((item) => item.id === id);
                if (u) onInspectUser(u);
              }}
            />
          ))}
        </group>

        {/* Neon Connecting Paths */}
        <ConnectingPaths userPositions={userPositions} theme={theme} />

        {/* Floating Data Particles */}
        {!reducedEffects && <FloatingParticles theme={theme} />}

        {/* Cyber Hologram Ground Grid */}
        <Grid
          position={[0, -0.01, 0]}
          args={[60, 60]}
          cellSize={1}
          cellThickness={1}
          cellColor={themeColors.gridLine}
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor={themeColors.gridSection}
          fadeDistance={45}
          fadeStrength={1.5}
        />

        {!reducedEffects && (
          <ContactShadows
            position={[0, -0.02, 0]}
            opacity={0.8}
            scale={60}
            blur={0.3}
            far={12}
            resolution={1024}
            color="#000000"
          />
        )}

        <CinematicOrbit cameraControlsRef={cameraControlsRef} enabled={cameraMode === "cinematic"} />

        <CameraControls
          ref={cameraControlsRef}
          makeDefault
          minZoom={12}
          maxZoom={90}
          maxPolarAngle={Math.PI / 2.05}
          dollySpeed={0.6}
        />
      </Canvas>

      {/* Floating Canvas HUD Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] p-2 rounded-2xl shadow-2xl">
        {/* Camera Preset Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-subtle)]">
          <button
            onClick={() => {
              soundEffects.playClick();
              setCameraMode("iso");
              onFocusUser(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === "iso" && !focusedUserId
                ? "bg-[var(--accent-primary)] text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            title="Isometric View"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Iso</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setCameraMode("cinematic");
              onFocusUser(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === "cinematic"
                ? "bg-[var(--accent-primary)] text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            title="Cinematic Orbit View"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Orbit</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setCameraMode("top");
              onFocusUser(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraMode === "top"
                ? "bg-[var(--accent-primary)] text-black shadow-md"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
            title="Bird's Eye Top View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>

          {currentUserId && (
            <button
              onClick={() => {
                soundEffects.playClick();
                setCameraMode("focus");
                onFocusUser(currentUserId);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                focusedUserId === currentUserId
                  ? "bg-cyan-500 text-black shadow-md"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              title="Focus My Skyscraper"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>My Building</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border-subtle)]" />

        {/* Theme Preset Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-subtle)]">
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onThemeChange("cyberpunk");
            }}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              theme === "cyberpunk"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Cyberpunk Theme"
          >
            <Moon className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onThemeChange("sunset");
            }}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              theme === "sunset"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Golden Sunset Theme"
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onThemeChange("matrix");
            }}
            className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
              theme === "matrix"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Matrix Theme"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border-subtle)]" />

        {/* SFX Mute & Fullscreen Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
            )}
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Focus Overlay Card */}
      {focusedUserId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-medium)] p-4 rounded-2xl shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom-4 z-20">
          <div className="text-xs font-semibold text-[var(--text-muted)] mb-1 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            Focused Building
          </div>
          <div className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2 font-display">
            {sortedUsers.find((u) => u.id === focusedUserId)?.username}
            {focusedUserId === currentUserId && (
              <span className="text-xs text-sky-400 font-normal">(You)</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono">
              Rank #{sortedUsers.findIndex((u) => u.id === focusedUserId) + 1}
            </span>
            <span className="px-2.5 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 rounded-lg text-xs font-bold font-mono">
              {sortedUsers.find((u) => u.id === focusedUserId)?.completedLevels} Floors
            </span>
            <button
              onClick={() => {
                soundEffects.playOpen();
                const u = users.find((item) => item.id === focusedUserId);
                if (u) onInspectUser(u);
              }}
              className="px-3 py-1 bg-[var(--accent-primary)] text-black rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Inspect Stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
