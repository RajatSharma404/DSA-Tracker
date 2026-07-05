"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows, OrthographicCamera } from "@react-three/drei";
import { Building, BuildingProps } from "./Building";

export interface LeaderboardUser {
  id: string;
  username: string;
  completedLevels: number;
  lastActivityDate?: string | null;
}

interface CitySceneProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  reducedEffects?: boolean;
}

export const CityScene: React.FC<CitySceneProps> = ({ users, currentUserId, reducedEffects = false }) => {
  const [focusedUserId, setFocusedUserId] = useState<string | null>(null);
  const cameraControlsRef = useRef<CameraControls>(null);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.completedLevels - a.completedLevels);
  }, [users]);

  const { buildings, userPositions, gridCols, gridRows } = useMemo(() => {
    const layout: BuildingProps[] = [];
    const posMap: Record<string, [number, number, number]> = {};
    
    // Strict 2D Grid spacing for isometric voxels
    const SPACING = 2.8; 
    
    // Determine grid size (closest to a square or a slight rectangle)
    const count = sortedUsers.length;
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
    const rows = Math.max(1, Math.ceil(count / cols));
    
    // Center the grid around origin
    const offsetX = ((cols - 1) * SPACING) / 2;
    const offsetZ = ((rows - 1) * SPACING) / 2;

    sortedUsers.forEach((user, index) => {
      const rank = index + 1;
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = col * SPACING - offsetX;
      const z = row * SPACING - offsetZ;
      
      posMap[user.id] = [x, 0, z];

      // Exact Git City contribution tiers
      let tier: BuildingProps["status"] = "locked"; // Level 0 (Grey/Empty)
      if (user.completedLevels > 0 && user.completedLevels <= 4) {
        tier = "progress"; // Level 1 (Light Green)
      } else if (user.completedLevels > 4 && user.completedLevels <= 14) {
        tier = "completed"; // Level 2 (Medium Green)
      } else if (user.completedLevels > 14) {
        tier = "master"; // Level 3+ (Dark Green)
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

  useEffect(() => {
    if (cameraControlsRef.current && focusedUserId && userPositions[focusedUserId]) {
      const [x, y, z] = userPositions[focusedUserId];
      // Isometric fly-to target (Offset back and up for iso view)
      cameraControlsRef.current.setLookAt(x + 10, y + 10, z + 10, x, y, z, true);
    } else if (cameraControlsRef.current && !focusedUserId) {
      // Default Isometric View covering the whole grid
      cameraControlsRef.current.setLookAt(15, 15, 15, 0, 0, 0, true);
    }
  }, [focusedUserId, userPositions]);

  return (
    <div className="w-full h-full bg-[#0d1117]"> {/* GitHub Dark Mode Background */}
      <Canvas gl={{ antialias: !reducedEffects, alpha: false }} dpr={reducedEffects ? 1 : [1, 2]}>
        <color attach="background" args={["#0d1117"]} />
        
        {/* Orthographic Camera for true Isometric Projection */}
        <OrthographicCamera 
          makeDefault 
          position={[20, 20, 20]} 
          zoom={35} 
          near={-100} 
          far={100}
        />

        {/* Git City Lighting Setup */}
        <ambientLight intensity={0.8} color="#ffffff" />
        <directionalLight
          position={[10, 20, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-10, -10, -10]} intensity={0.3} color="#c9d1d9" />

        <group onPointerMissed={() => setFocusedUserId(null)}>
          {buildings.map((b) => (
            <Building
              key={b.userId}
              {...b}
              reducedEffects={reducedEffects}
              isSelected={focusedUserId === b.userId}
              onSelect={setFocusedUserId}
            />
          ))}
        </group>

        {/* Base Grid Plane (the "Empty" contributions background) */}
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[(gridCols * 1.2) + 1, (gridRows * 1.2) + 1]} />
          <meshStandardMaterial color="#161b22" roughness={1} />
        </mesh>

        {!reducedEffects && (
          <ContactShadows
            position={[0, -0.04, 0]}
            opacity={0.8}
            scale={60}
            blur={0.2}
            far={10}
            resolution={2048}
            color="#000000"
          />
        )}

        {/* Isometric Camera Controls */}
        <CameraControls 
          ref={cameraControlsRef} 
          makeDefault 
          minZoom={10} 
          maxZoom={100} 
          maxPolarAngle={Math.PI / 2.1}
          mouseButtons={{
            left: 1, // ACTION.ROTATE
            middle: 8, // ACTION.DOLLY
            right: 2, // ACTION.TRUCK
            wheel: 8, // ACTION.DOLLY
          }}
          dollySpeed={0.5}
        />
      </Canvas>
      
      {/* HUD overlay */}
      {focusedUserId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#161b22]/90 backdrop-blur-md border border-[#30363d] p-4 rounded-xl shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom-4 z-10 pointer-events-none">
          <div className="text-sm font-medium text-[#8b949e] mb-1">
            Focusing on
          </div>
          <div className="text-xl font-bold text-[#c9d1d9]">
            {sortedUsers.find((u) => u.id === focusedUserId)?.username}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-2 py-1 bg-[#238636]/20 text-[#3fb950] border border-[#2ea043]/50 rounded-md text-sm font-semibold">
              Rank #{sortedUsers.find((u) => u.id === focusedUserId) ? sortedUsers.findIndex(u => u.id === focusedUserId) + 1 : '-'}
            </span>
            <span className="px-2 py-1 bg-[#1f6feb]/20 text-[#58a6ff] border border-[#388bfd]/50 rounded-md text-sm font-semibold">
              {sortedUsers.find((u) => u.id === focusedUserId)?.completedLevels} Levels
            </span>
          </div>
          <div className="mt-3 text-xs text-[#8b949e]">
            Click anywhere in the grid to dismiss
          </div>
        </div>
      )}
    </div>
  );
};
