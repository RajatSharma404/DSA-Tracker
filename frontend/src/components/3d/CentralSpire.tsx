"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { cityAudio } from "@/lib/cityAudio";

interface CentralSpireProps {
  totalFloors?: number;
  totalUsers?: number;
  theme?: "cyberpunk" | "sunset" | "matrix";
}

export const CentralSpire: React.FC<CentralSpireProps> = ({
  totalFloors = 100,
  totalUsers = 7,
  theme = "cyberpunk",
}) => {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const colors = {
    cyberpunk: { core: "#38bdf8", beam: "#818cf8", ring: "#c084fc", glow: "#0284c7" },
    sunset: { core: "#fbbf24", beam: "#f97316", ring: "#e11d48", glow: "#d97706" },
    matrix: { core: "#34d399", beam: "#10b981", ring: "#059669", glow: "#047857" },
  }[theme];

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.y += delta * 0.8;
      ring1Ref.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 1.2;
      ring2Ref.current.rotation.z = Math.cos(Date.now() * 0.001) * 0.15;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 1.5;
      coreRef.current.position.y = 7.5 + Math.sin(Date.now() * 0.002) * 0.3;
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.35 + Math.sin(Date.now() * 0.004) * 0.15;
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    cityAudio.playSpire();
    setShowInfo(!showInfo);
  };

  return (
    <group
      position={[0, 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        cityAudio.playHover();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      onClick={handleClick}
    >
      {/* Base Hexagonal Core Pedestal */}
      <mesh position={[0, 0.4, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.8, 2.2, 0.8, 6]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Spire Tower Body */}
      <mesh position={[0, 3.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.6, 1.4, 5.4, 8]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.95}
          emissive={colors.glow}
          emissiveIntensity={hovered ? 0.6 : 0.2}
        />
      </mesh>

      {/* Structural Neon Stripes */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.62, 1.42, 5.4, 8]} />
        <meshStandardMaterial
          color={colors.core}
          wireframe
          emissive={colors.core}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Floating Energy Core */}
      <mesh ref={coreRef} position={[0, 7.5, 0]}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.core}
          emissiveIntensity={hovered ? 2.5 : 1.8}
          roughness={0.1}
        />
      </mesh>

      {/* Inner Rotating Ring 1 */}
      <group ref={ring1Ref} position={[0, 7.5, 0]}>
        <mesh>
          <torusGeometry args={[1.2, 0.04, 16, 32]} />
          <meshBasicMaterial color={colors.ring} wireframe={false} />
        </mesh>
      </group>

      {/* Outer Rotating Ring 2 */}
      <group ref={ring2Ref} position={[0, 7.5, 0]}>
        <mesh>
          <torusGeometry args={[1.7, 0.03, 16, 32]} />
          <meshBasicMaterial color={colors.beam} wireframe={false} />
        </mesh>
      </group>

      {/* Upward Energy Laser Beam */}
      <mesh ref={beamRef} position={[0, 25, 0]}>
        <cylinderGeometry args={[0.3, 0.9, 35, 16]} />
        <meshBasicMaterial
          color={colors.beam}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Label / Info Modal */}
      <Html position={[0, 9.5, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
        <div className={`transition-all duration-300 ${hovered || showInfo ? "scale-100 opacity-100" : "scale-95 opacity-80"}`}>
          <div className="flex flex-col items-center">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.3)] text-center whitespace-nowrap">
              <div className="text-[11px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                DSA Core Spire
              </div>
            </div>

            {showInfo && (
              <div className="mt-2 p-3 bg-slate-900/95 border border-cyan-500/40 rounded-xl shadow-2xl backdrop-blur-md text-slate-200 text-xs w-48 animate-in zoom-in-95 pointer-events-auto">
                <div className="font-bold text-white mb-1.5 text-center text-sm border-b border-slate-800 pb-1">
                  City Central Hub
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Total City Floors:</span>
                  <span className="font-mono font-bold text-cyan-400">{totalFloors}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Active Builders:</span>
                  <span className="font-mono font-bold text-indigo-400">{totalUsers}</span>
                </div>
                <div className="mt-2 text-[10px] text-cyan-300/70 text-center italic">
                  Powering city progress
                </div>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
};
