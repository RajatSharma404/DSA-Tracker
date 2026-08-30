import { describe, it, expect, vi } from "vitest";

const mocks = vi.hoisted(() => {
  let authConfig: any = null;
  return {
    getAuthConfig: () => authConfig,
    setAuthConfig: (cfg: any) => {
      authConfig = cfg;
    },
  };
});

vi.mock("next-auth/middleware", () => ({
  withAuth: vi.fn((config) => {
    mocks.setAuthConfig(config);
    return () => "mocked-middleware";
  }),
}));

import "../proxy";

describe("Proxy / Middleware Auth Config", () => {
  it("should have pages.signIn configured to /login", () => {
    const authConfig = mocks.getAuthConfig();
    expect(authConfig).toBeDefined();
    expect(authConfig.pages.signIn).toBe("/login");
  });

  it("should authorize ADMIN role on /admin path", () => {
    const authConfig = mocks.getAuthConfig();
    const isAuthorized = authConfig.callbacks.authorized({
      token: { role: "ADMIN" },
      req: { nextUrl: { pathname: "/admin/settings" } },
    });
    expect(isAuthorized).toBe(true);
  });

  it("should reject non-ADMIN role on /admin path", () => {
    const authConfig = mocks.getAuthConfig();
    const isAuthorized = authConfig.callbacks.authorized({
      token: { role: "USER" },
      req: { nextUrl: { pathname: "/admin" } },
    });
    expect(isAuthorized).toBe(false);
  });

  it("should reject null token on /admin path", () => {
    const authConfig = mocks.getAuthConfig();
    const isAuthorized = authConfig.callbacks.authorized({
      token: null,
      req: { nextUrl: { pathname: "/admin" } },
    });
    expect(isAuthorized).toBe(false);
  });

  it("should authorize logged in user on non-admin path", () => {
    const authConfig = mocks.getAuthConfig();
    const isAuthorized = authConfig.callbacks.authorized({
      token: { role: "USER" },
      req: { nextUrl: { pathname: "/dashboard" } },
    });
    expect(isAuthorized).toBe(true);
  });

  it("should reject unauthenticated user on protected non-admin path", () => {
    const authConfig = mocks.getAuthConfig();
    const isAuthorized = authConfig.callbacks.authorized({
      token: null,
      req: { nextUrl: { pathname: "/dashboard" } },
    });
    expect(isAuthorized).toBe(false);
  });
});
