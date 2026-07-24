"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, ContactShadows, OrthographicCamera, Grid } from "@react-three/drei";
import * as THREE from "three";
import { Building, BuildingProps } from "./Building";
import { CentralSpire } from "./CentralSpire";
import { cityAudio } from "@/lib/cityAudio";
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
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 35,
        y: Math.random() * 18 + 2,
        z: (Math.random() - 0.5) * 35,
        speed: Math.random() * 0.02 + 0.005,
        rotSpeed: Math.random() * 0.02,
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
      cameraControlsRef.current.azimuthAngle += delta * 0.15;
    }
  });
  return null;
};

// Neon Connecting Pathways Ground Net
const ConnectingPaths = ({
  userPositions,
  theme,
}: {
  userPositions: Record<string, [number, number, number]>;
  theme: CityTheme;
}) => {
  const pathColor = {
    cyberpunk: "#818cf8",
    sunset: "#f97316",
    matrix: "#10b981",
  }[theme];

  const lines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    Object.values(userPositions).forEach(([x, _, z]) => {
      points.push(new THREE.Vector3(0, 0.02, 0));
      points.push(new THREE.Vector3(x, 0.02, z));
    });
    return points;
  }, [userPositions]);

  const lineGeo = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(lines);
  }, [lines]);

  return (
    <lineSegments geometry={lineGeo}>
      <lineBasicMaterial color={pathColor} transparent opacity={0.3} linewidth={2} />
    </lineSegments>
  );
};

export const CityScene: React.FC<CitySceneProps> = ({
  users,
  currentUserId = "u1",
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
    return users.reduce((acc, u) => acc + u.completedLevels, 0);
  }, [users]);

  const { buildings, userPositions, gridCols, gridRows } = useMemo(() => {
    const layout: BuildingProps[] = [];
    const posMap: Record<string, [number, number, number]> = {};
    const SPACING = 3.2;
    const count = sortedUsers.length;
    const cols = Math.max(2, Math.ceil(Math.sqrt(count)));
    const rows = Math.max(2, Math.ceil(count / cols));

    const offsetX = ((cols - 1) * SPACING) / 2;
    const offsetZ = ((rows - 1) * SPACING) / 2;

    sortedUsers.forEach((user, index) => {
      const rank = index + 1;
      const col = index % cols;
      const row = Math.floor(index / cols);

      let x = col * SPACING - offsetX;
      let z = row * SPACING - offsetZ;

      // Keep origin center free for Central Spire
      if (Math.abs(x) < 1.5 && Math.abs(z) < 1.5) {
        x += SPACING;
      }

      posMap[user.id] = [x, 0, z];

      let tier: BuildingProps["status"] = "locked";
      if (user.completedLevels > 0 && user.completedLevels <= 4) {
        tier = "progress";
      } else if (user.completedLevels > 4 && user.completedLevels <= 14) {
        tier = "completed";
      } else if (user.completedLevels > 14) {
        tier = "master";
      }

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

    return { buildings: layout, userPositions: posMap, gridCols: cols, gridRows: rows };
  }, [sortedUsers, currentUserId]);

  // Handle Camera Mode Transitions
  useEffect(() => {
    if (!cameraControlsRef.current) return;
    cityAudio.playSweep();

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
    const muted = cityAudio.toggleMute();
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
    <div ref={containerRef} className="relative w-full h-full bg-[#090d16] select-none overflow-hidden">
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
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2 rounded-2xl shadow-2xl">
        {/* Camera Preset Selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setCameraMode("iso");
              onFocusUser(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cameraMode === "iso" && !focusedUserId
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Isometric View"
          >
            <Compass className="w-3.5 h-3.5" />
            Iso
          </button>

          <button
            onClick={() => {
              setCameraMode("cinematic");
              onFocusUser(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cameraMode === "cinematic"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Cinematic Orbit View"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            Orbit
          </button>

          <button
            onClick={() => {
              setCameraMode("top");
              onFocusUser(null);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cameraMode === "top"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Bird's Eye Top View"
          >
            <Eye className="w-3.5 h-3.5" />
            Top
          </button>

          <button
            onClick={() => {
              setCameraMode("focus");
              onFocusUser(currentUserId);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              focusedUserId === currentUserId
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title="Focus My Skyscraper"
          >
            <Zap className="w-3.5 h-3.5" />
            My Building
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-800" />

        {/* Theme Preset Selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onThemeChange("cyberpunk")}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === "cyberpunk"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
            title="Cyberpunk Theme"
          >
            <Moon className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={() => onThemeChange("sunset")}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === "sunset"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
            title="Golden Sunset Theme"
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={() => onThemeChange("matrix")}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              theme === "matrix"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
            title="Matrix Theme"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-800" />

        {/* SFX Mute & Fullscreen Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Focus Overlay Card */}
      {focusedUserId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 p-4 rounded-2xl shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom-4 z-20">
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Focused Building
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            {sortedUsers.find((u) => u.id === focusedUserId)?.username}
            {focusedUserId === currentUserId && <span className="text-xs text-sky-400 font-normal">(You)</span>}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
              Rank #{sortedUsers.findIndex((u) => u.id === focusedUserId) + 1}
            </span>
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold">
              {sortedUsers.find((u) => u.id === focusedUserId)?.completedLevels} Floors
            </span>
            <button
              onClick={() => {
                const u = users.find((item) => item.id === focusedUserId);
                if (u) onInspectUser(u);
              }}
              className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              Inspect Stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
