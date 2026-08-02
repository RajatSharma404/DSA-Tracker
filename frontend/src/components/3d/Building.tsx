"use client";
/* eslint-disable react-hooks/immutability */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cityAudio } from "@/lib/cityAudio";

export type BuildingStatus = "locked" | "progress" | "completed" | "master";

export interface BuildingProps {
  userId: string;
  username: string;
  completedLevels: number;
  rank: number;
  status: BuildingStatus;
  lastActivityDate?: string | null;
  position?: [number, number, number];
  reducedEffects?: boolean;
  isSelected?: boolean;
  isTopPerformer?: boolean;
  isCurrentUser?: boolean;
  theme?: "cyberpunk" | "sunset" | "matrix";
  onSelect?: (userId: string) => void;
}

const FLOOR_HEIGHT = 0.8;
const LOBBY_HEIGHT = 1.0;

// Shared Geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const planeGeo = new THREE.PlaneGeometry(1, 1);
const spireGeo = new THREE.CylinderGeometry(0.02, 0.1, 1.0, 4);
const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
const beaconGeo = new THREE.OctahedronGeometry(0.3, 0);
const trophyGeo = new THREE.IcosahedronGeometry(0.4, 0);
const laserBeamGeo = new THREE.CylinderGeometry(0.8, 1.2, 40, 16);
const ringGeo = new THREE.RingGeometry(0.9, 1.2, 32);
const dishGeo = new THREE.CylinderGeometry(0.3, 0.05, 0.1, 16);

// Shared Trim Materials
const sharedMaterials = {
  trim: new THREE.MeshStandardMaterial({ color: "#020617", roughness: 0.9, metalness: 0.8 }),
  spireLight: new THREE.MeshBasicMaterial({ color: "#ef4444" }),
  beacon: new THREE.MeshBasicMaterial({ color: "#38bdf8" }),
  trophy: new THREE.MeshStandardMaterial({
    color: "#f59e0b",
    emissive: "#fbbf24",
    emissiveIntensity: 2.0,
    metalness: 0.9,
    roughness: 0.1,
  }),
  helipad: new THREE.MeshBasicMaterial({ color: "#e2e8f0" }),
};

const WindowPlanes = ({
  width,
  depth,
  height,
  material,
}: {
  width: number;
  depth: number;
  height: number;
  material: THREE.Material;
}) => {
  const windowW = width * 0.65;
  const windowH = height * 0.65;
  const windowD = depth * 0.65;

  return (
    <group>
      {/* Front */}
      <mesh geometry={planeGeo} material={material} position={[0, 0, depth / 2 + 0.01]} scale={[windowW, windowH, 1]} />
      {/* Back */}
      <mesh geometry={planeGeo} material={material} position={[0, 0, -depth / 2 - 0.01]} scale={[windowW, windowH, 1]} rotation={[0, Math.PI, 0]} />
      {/* Left */}
      <mesh geometry={planeGeo} material={material} position={[-width / 2 - 0.01, 0, 0]} scale={[windowD, windowH, 1]} rotation={[0, -Math.PI / 2, 0]} />
      {/* Right */}
      <mesh geometry={planeGeo} material={material} position={[width / 2 + 0.01, 0, 0]} scale={[windowD, windowH, 1]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

const Floor = ({
  yOffset,
  width,
  depth,
  concreteMat,
  windowMat,
  trimMat,
}: {
  yOffset: number;
  width: number;
  depth: number;
  concreteMat: THREE.Material;
  windowMat: THREE.Material;
  trimMat: THREE.Material;
}) => {
  return (
    <group position={[0, yOffset, 0]}>
      <mesh geometry={boxGeo} material={concreteMat} scale={[width, FLOOR_HEIGHT, depth]} castShadow receiveShadow />
      <mesh geometry={boxGeo} material={trimMat} scale={[width + 0.04, 0.08, depth + 0.04]} position={[0, -FLOOR_HEIGHT / 2 + 0.04, 0]} />
      <WindowPlanes width={width} depth={depth} height={FLOOR_HEIGHT} material={windowMat} />
    </group>
  );
};

export const Building: React.FC<BuildingProps> = ({
  userId,
  username,
  completedLevels,
  rank,
  status,
  position = [0, 0, 0],
  isSelected = false,
  isTopPerformer = false,
  isCurrentUser = false,
  theme = "cyberpunk",
  onSelect,
}) => {
  const group = useRef<THREE.Group>(null);
  const trophyRef = useRef<THREE.Mesh>(null);
  const dishRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const [visualFloors, setVisualFloors] = useState(Math.max(0, Math.round(completedLevels)));
  const [isAnimating, setIsAnimating] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (!isAnimating) {
      setVisualFloors(Math.max(0, Math.round(completedLevels)));
    }
  }, [completedLevels, isAnimating]);

  useEffect(() => {
    const handleLevelCleared = () => {
      if (!isCurrentUser) return;
      setIsAnimating(true);
      setAnimProgress(0);
    };
    window.addEventListener("levelCleared", handleLevelCleared);
    return () => window.removeEventListener("levelCleared", handleLevelCleared);
  }, [isCurrentUser]);

  useFrame((_, delta) => {
    if (isAnimating) {
      setAnimProgress((prev) => {
        const next = prev + delta / 0.8;
        if (next >= 1) {
          setIsAnimating(false);
          setVisualFloors((f) => f + 1);
          return 0;
        }
        return next;
      });
    }

    if (trophyRef.current) {
      trophyRef.current.rotation.y += delta * 1.5;
      trophyRef.current.position.y = (trophyRef.current.userData.baseY || 0) + Math.sin(Date.now() * 0.003) * 0.15;
    }

    if (dishRef.current) {
      dishRef.current.rotation.y += delta * 0.5;
    }
  });

  const totalFloorsTarget = visualFloors + 1;
  const isSkyscraper = totalFloorsTarget > 15;
  const isMidRise = totalFloorsTarget > 5 && totalFloorsTarget <= 15;

  const width = isSkyscraper ? 1.0 : isMidRise ? 1.2 : 1.5;
  const depth = width;

  const palette = useMemo(() => {
    if (status === "locked") {
      return { glass: "#334155", concrete: "#0f172a", beam: "#64748b", active: false };
    }
    if (theme === "sunset") {
      if (status === "progress") return { glass: "#f97316", concrete: "#1c1917", beam: "#fdba74", active: true };
      if (status === "completed") return { glass: "#fbbf24", concrete: "#0c0a09", beam: "#fde047", active: true };
      return { glass: "#f43f5e", concrete: "#09090b", beam: "#fda4af", active: true };
    }
    if (theme === "matrix") {
      if (status === "progress") return { glass: "#10b981", concrete: "#022c22", beam: "#6ee7b7", active: true };
      if (status === "completed") return { glass: "#34d399", concrete: "#064e3b", beam: "#a7f3d0", active: true };
      return { glass: "#6ee7b7", concrete: "#022c22", beam: "#a7f3d0", active: true };
    }
    // Default Cyberpunk
    if (status === "progress") return { glass: "#38bdf8", concrete: "#0f172a", beam: "#7dd3fc", active: true };
    if (status === "completed") return { glass: "#a855f7", concrete: "#090d16", beam: "#c084fc", active: true };
    return { glass: "#e879f9", concrete: "#030712", beam: "#f0abfc", active: true };
  }, [status, theme]);

  const materials = useMemo(() => {
    const targetEmissive = hovered || isSelected ? 2.0 : palette.active ? 1.1 : 0.0;
    return {
      concrete: new THREE.MeshStandardMaterial({
        color: palette.concrete,
        roughness: 0.7,
        metalness: 0.6,
      }),
      window: new THREE.MeshStandardMaterial({
        color: palette.active ? "#ffffff" : "#111111",
        emissive: palette.glass,
        emissiveIntensity: targetEmissive,
        roughness: 0.1,
        metalness: 0.9,
      }),
      pad: new THREE.MeshStandardMaterial({
        color: isSelected ? palette.glass : "#090d16",
        roughness: 0.8,
        metalness: 0.5,
      }),
      laserBeam: new THREE.MeshBasicMaterial({
        color: palette.beam,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
      glowRing: new THREE.MeshBasicMaterial({
        color: palette.beam,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      }),
    };
  }, [palette, hovered, isSelected]);

  const ghostOpacity = 0.3 + 0.7 * animProgress;
  const ghostIsActive = animProgress > 0.5;
  const ghostMat = useMemo(() => {
    return {
      concrete: new THREE.MeshStandardMaterial({
        color: palette.concrete,
        roughness: 0.7,
        transparent: true,
        opacity: ghostOpacity,
        wireframe: animProgress < 0.2 && isAnimating,
      }),
      window: new THREE.MeshStandardMaterial({
        color: ghostIsActive ? "#ffffff" : "#111111",
        emissive: palette.glass,
        emissiveIntensity: ghostIsActive ? 1.0 * ghostOpacity : 0.0,
        transparent: true,
        opacity: ghostOpacity,
        roughness: 0.1,
        metalness: 0.9,
      }),
      trim: new THREE.MeshStandardMaterial({
        color: "#020617",
        roughness: 0.9,
        transparent: true,
        opacity: ghostOpacity,
      }),
    };
  }, [palette, ghostOpacity, ghostIsActive, animProgress, isAnimating]);

  const floors = [];
  for (let i = 0; i < visualFloors; i++) {
    floors.push(
      <Floor
        key={`solid-${i}`}
        yOffset={LOBBY_HEIGHT + FLOOR_HEIGHT / 2 + i * FLOOR_HEIGHT}
        width={width}
        depth={depth}
        concreteMat={materials.concrete}
        windowMat={materials.window}
        trimMat={sharedMaterials.trim}
      />
    );
  }

  // Next Floor (Ghost)
  floors.push(
    <Floor
      key={`ghost-${visualFloors}`}
      yOffset={LOBBY_HEIGHT + FLOOR_HEIGHT / 2 + visualFloors * FLOOR_HEIGHT}
      width={width}
      depth={depth}
      concreteMat={ghostMat.concrete}
      windowMat={ghostMat.window}
      trimMat={ghostMat.trim}
    />
  );

  const totalHeight = LOBBY_HEIGHT + (visualFloors + 1) * FLOOR_HEIGHT;

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    cityAudio.playHover();
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    cityAudio.playSelect();
    onSelect?.(userId);
  };

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={handleClick}
    >
      {/* Selection Highlight Ring */}
      {isSelected && (
        <group position={[0, totalHeight + 0.6, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={ringGeo} material={materials.glowRing} />
        </group>
      )}

      {/* Base Plaza Pad */}
      <mesh geometry={boxGeo} material={materials.pad} scale={[width + 0.6, 0.1, depth + 0.6]} position={[0, 0.05, 0]} receiveShadow />

      {/* Lobby Level */}
      <mesh geometry={boxGeo} material={materials.concrete} scale={[width, LOBBY_HEIGHT, depth]} position={[0, LOBBY_HEIGHT / 2 + 0.1, 0]} castShadow receiveShadow />

      {/* Floors Stack */}
      <group position={[0, 0.1, 0]}>{floors}</group>

      {/* Roof Deck */}
      <mesh geometry={boxGeo} material={materials.concrete} scale={[width + 0.1, 0.2, depth + 0.1]} position={[0, totalHeight + 0.2, 0]} castShadow receiveShadow />

      {/* Roof Helipad / Details for Master Skyscraper */}
      {status === "master" && (
        <group position={[0, totalHeight + 0.31, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <circleGeometry args={[width * 0.35, 16]} />
            <primitive object={sharedMaterials.helipad} attach="material" />
          </mesh>
          <group ref={dishRef} position={[width * 0.3, 0.2, depth * 0.3]}>
            <mesh geometry={dishGeo} material={materials.concrete} rotation={[Math.PI / 4, 0, 0]} />
          </group>
        </group>
      )}

      {/* Skyscraper Roof Spire */}
      {isSkyscraper && (
        <group position={[0, totalHeight + 0.3, 0]}>
          <mesh material={materials.concrete} geometry={spireGeo} position={[0, 0.5, 0]} castShadow />
          <mesh material={sharedMaterials.spireLight} geometry={lightGeo} position={[0, 1.05, 0]} />
        </group>
      )}

      {/* Rank #1 Holographic Trophy Crystal */}
      {isTopPerformer && (
        <mesh
          ref={trophyRef}
          userData={{ baseY: totalHeight + (isSkyscraper ? 2.2 : 1.5) }}
          position={[0, totalHeight + (isSkyscraper ? 2.2 : 1.5), 0]}
          geometry={trophyGeo}
          material={sharedMaterials.trophy}
        />
      )}

      {/* Current User Beacon */}
      {isCurrentUser && !isTopPerformer && (
        <mesh
          position={[0, totalHeight + (isSkyscraper ? 2.0 : 1.2), 0]}
          rotation={[Math.PI / 4, Math.PI / 4, 0]}
          geometry={beaconGeo}
          material={sharedMaterials.beacon}
        />
      )}

      {/* Label Tooltip */}
      <Html position={[0, totalHeight + (isTopPerformer || isCurrentUser ? 3.2 : 2.2), 0]} center distanceFactor={15} style={{ pointerEvents: "none" }}>
        <div className={`transition-all duration-200 ${hovered || isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <div className="flex flex-col items-center">
            <div className={`px-3 py-1 rounded-lg bg-slate-950/90 border border-slate-700 shadow-2xl backdrop-blur-md whitespace-nowrap flex items-center gap-2`}>
              {isTopPerformer && <span className="text-amber-400 text-xs">👑</span>}
              <span className="font-bold text-white text-xs">
                {username} {isCurrentUser && <span className="text-sky-400 ml-0.5">(You)</span>}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 font-bold">
                Rank #{rank}
              </span>
              <span className="font-semibold text-[11px] text-emerald-400">{visualFloors} lvls</span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};
