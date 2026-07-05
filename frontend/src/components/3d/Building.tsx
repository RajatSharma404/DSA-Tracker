"use client";
/* eslint-disable react-hooks/immutability */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
  onSelect?: (userId: string) => void;
}

// Building dimensions
const BUILDING_WIDTH = 1.6;
const BUILDING_DEPTH = 1.6;
const FLOOR_HEIGHT = 0.8;
const LOBBY_HEIGHT = 1.0;

function clampCompletedLevels(completedLevels: number) {
  return Math.max(0, Math.round(completedLevels));
}

// Global cache for procedural textures so we don't crash the GPU
const textureCache: Record<string, THREE.CanvasTexture> = {};

const getWindowTexture = (glassColor: string, isActive: boolean) => {
  const key = `${glassColor}-${isActive}`;
  if (!textureCache[key]) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Concrete structural frame
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 128, 128);

      // Draw grid of windows
      const cols = 4;
      const rows = 4;
      const padding = 4;
      const w = (128 - padding * (cols + 1)) / cols;
      const h = (128 - padding * (rows + 1)) / rows;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = padding + c * (w + padding);
          const y = padding + r * (h + padding);
          
          // Randomly turn off some lights for realism
          const isLit = isActive && Math.random() > 0.3;
          ctx.fillStyle = isLit ? glassColor : "#020617";
          ctx.fillRect(x, y, w, h);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Keep it sharp/pixelated for that crisp look
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    textureCache[key] = texture;
  }
  return textureCache[key].clone(); // Clone so we can apply different repeats per building height
};

export const Building: React.FC<BuildingProps> = ({
  userId,
  username,
  completedLevels,
  status,
  position = [0, 0, 0],
  isSelected = false,
  isCurrentUser = false,
  onSelect,
}) => {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const safeCompletedLevels = clampCompletedLevels(completedLevels);
  const segmentCount = Math.max(1, safeCompletedLevels);
  const bodyHeight = segmentCount * FLOOR_HEIGHT;

  const palette = useMemo(() => {
    if (status === "locked") return { glass: "#334155", concrete: "#0f172a", active: false };
    if (status === "progress") return { glass: "#e0f2fe", concrete: "#475569", active: true }; // Cyan lights
    if (status === "completed") return { glass: "#fef08a", concrete: "#334155", active: true }; // Warm office lights
    if (status === "master") return { glass: "#fde047", concrete: "#020617", active: true }; // Bright gold on black
    return { glass: "#334155", concrete: "#0f172a", active: false };
  }, [status]);

  // Create materials
  const materials = useMemo(() => {
    const tex = getWindowTexture(palette.glass, palette.active);
    // Repeat texture vertically based on how many floors we have
    tex.repeat.set(1, segmentCount);

    return {
      body: new THREE.MeshStandardMaterial({
        map: tex,
        emissiveMap: tex,
        emissive: new THREE.Color("#ffffff"),
        emissiveIntensity: palette.active ? 0.6 : 0,
        roughness: 0.4,
      }),
      concrete: new THREE.MeshStandardMaterial({
        color: palette.concrete,
        roughness: 0.9,
      }),
      beacon: new THREE.MeshBasicMaterial({ color: "#38bdf8" }),
    };
  }, [palette, segmentCount]);

  useEffect(() => {
    return () => {
      materials.body.dispose();
      materials.concrete.dispose();
      materials.beacon.dispose();
    };
  }, [materials]);

  // Hover glow effect
  useFrame(() => {
    if (!group.current) return;
    const targetEmissive = (hovered || isSelected) ? 1.2 : (palette.active ? 0.6 : 0.0);
    materials.body.emissiveIntensity = THREE.MathUtils.lerp(
      materials.body.emissiveIntensity,
      targetEmissive,
      0.15
    );
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(userId);
      }}
    >
      {/* 1. Ground Lobby (Solid concrete base) */}
      <mesh position={[0, LOBBY_HEIGHT / 2, 0]} castShadow receiveShadow material={materials.concrete}>
        <boxGeometry args={[BUILDING_WIDTH, LOBBY_HEIGHT, BUILDING_DEPTH]} />
      </mesh>

      {/* 2. Main Skyscraper Body (Procedural Windows) */}
      <mesh position={[0, LOBBY_HEIGHT + (bodyHeight / 2), 0]} castShadow receiveShadow material={materials.body}>
        <boxGeometry args={[BUILDING_WIDTH, bodyHeight, BUILDING_DEPTH]} />
      </mesh>

      {/* 3. Roof Parapet and Details */}
      <mesh position={[0, LOBBY_HEIGHT + bodyHeight + 0.1, 0]} castShadow receiveShadow material={materials.concrete}>
        <boxGeometry args={[BUILDING_WIDTH * 1.05, 0.2, BUILDING_DEPTH * 1.05]} />
      </mesh>
      
      {/* 4. Roof AC Unit */}
      <mesh position={[0, LOBBY_HEIGHT + bodyHeight + 0.3, 0]} castShadow receiveShadow material={materials.concrete}>
        <boxGeometry args={[BUILDING_WIDTH * 0.4, 0.4, BUILDING_DEPTH * 0.4]} />
      </mesh>

      {/* MISSING USER (Glowing beacon above "You") */}
      {isCurrentUser && (
        <mesh
          position={[0, LOBBY_HEIGHT + bodyHeight + 1.2, 0]}
          rotation={[Math.PI / 4, Math.PI / 4, 0]}
          material={materials.beacon}
        >
          <octahedronGeometry args={[0.4, 0]} />
        </mesh>
      )}

      {/* LABELS */}
      <Html
        position={[0, LOBBY_HEIGHT + bodyHeight + (isCurrentUser ? 2.5 : 1.5), 0]}
        center
        distanceFactor={15}
        occlude={false}
        style={{ pointerEvents: "none" }}
      >
        <div className={`transition-opacity duration-200 ${hovered || isSelected ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center">
            <div className={`px-3 py-1 rounded-md bg-slate-900/95 border border-slate-700 shadow-lg whitespace-nowrap`}>
              <span className="font-bold text-white text-[13px]">
                {username} {isCurrentUser && <span className="text-sky-400 ml-1">(You)</span>}
              </span>
              <span className={`ml-2 font-semibold text-[11px] text-slate-400`}>
                {safeCompletedLevels} lvls
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};
