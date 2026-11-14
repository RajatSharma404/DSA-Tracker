import { describe, it, expect, vi } from "vitest";

const mocks = vi.hoisted(() => {
  let authConfig: any = null;
  let handler: any = null;
  return {
    getAuthConfig: () => authConfig,
    getHandler: () => handler,
    setAuthConfig: (cfg: any, fn?: any) => {
      authConfig = cfg;
      handler = fn ?? null;
    },
  };
});

vi.mock("next-auth/middleware", () => ({
  // withAuth(options) or withAuth(middleware, options)
  withAuth: vi.fn((a, b) => {
    if (typeof a === "function") mocks.setAuthConfig(b, a);
    else mocks.setAuthConfig(a);
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

  it("lets the root path through to the redirect handler", () => {
    const authConfig = mocks.getAuthConfig();
    expect(authConfig.callbacks.authorized({ token: null, req: { nextUrl: { pathname: "/" } } })).toBe(true);
  });

  it("redirects signed-out visitors on / to the landing page", () => {
    const res = mocks.getHandler()({
      url: "http://localhost:3005/",
      nextUrl: { pathname: "/" },
      nextauth: { token: null },
    });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3005/home");
  });

  it("does not redirect signed-in users on /", () => {
    const res = mocks.getHandler()({
      url: "http://localhost:3005/",
      nextUrl: { pathname: "/" },
      nextauth: { token: { role: "USER" } },
    });
    expect(res.headers.get("location")).toBeNull();
  });
});
