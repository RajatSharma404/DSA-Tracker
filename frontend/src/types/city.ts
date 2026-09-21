export interface LeaderboardUser {
  id: string;
  username: string;
  completedLevels: number;
  lastActivityDate?: string | null;
}

export type CityTheme = "cyberpunk" | "sunset" | "matrix";
export type CameraMode = "iso" | "cinematic" | "top" | "focus";
