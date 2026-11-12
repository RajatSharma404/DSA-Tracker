import { encode } from "../frontend/node_modules/next-auth/jwt";
import fs from "fs";
import path from "path";

export interface TestUserSession {
  sub: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
}

export async function mintTestSessionCookie(user: TestUserSession): Promise<string> {
  if (process.env.NODE_ENV !== "test" || process.env.E2E !== "true") {
    throw new Error(
      "E2E auth helper cannot be invoked outside NODE_ENV=test and E2E=true! Refusing to mint session cookie in non-test mode.",
    );
  }

  let secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    const envPath = path.resolve(__dirname, "../frontend/.env");
    if (fs.existsSync(envPath)) {
      const match = fs.readFileSync(envPath, "utf-8").match(/NEXTAUTH_SECRET\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match) secret = match[1];
    }
  }
  if (!secret) {
    secret = "development-fallback-secret-at-least-32-bytes-long";
  }

  const token = await encode({
    token: {
      sub: user.sub,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    secret,
    maxAge: 30 * 24 * 60 * 60,
  });

  return token;
}

export async function createStorageState(
  user: TestUserSession,
  outputPath: string,
  baseURL: string = "http://localhost:3000",
) {
  const token = await mintTestSessionCookie(user);
  const urlObj = new URL(baseURL);
  const domain = urlObj.hostname;

  const storageState = {
    cookies: [
      {
        name: "next-auth.session-token",
        value: token,
        domain,
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
        expires: Math.floor(Date.now() / 1000) + 86400 * 30,
      },
    ],
    origins: [],
  };

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(storageState, null, 2), "utf8");
  return outputPath;
}
