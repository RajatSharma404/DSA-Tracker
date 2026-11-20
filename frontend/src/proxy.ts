import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    // Signed-out visitors to the root see the landing page instead of a login wall.
    if (req.nextUrl.pathname === "/" && !req.nextauth.token) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path === "/") return true; // handled above
        if (path.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        return !!token;
      },
    },
  },
);

export const config = {
  // Public: API, login, the landing page, static assets, and the extension
  // downloads (Tampermonkey fetches the userscript outside the user's session).
  // Static files (anything with an extension: manifest.webmanifest, sw.js,
  // icons, the extension zip and userscript) and the offline page must load
  // signed out, or the browser gets the login page's HTML instead.
  matcher: ["/((?!api|login|home|offline|_next/static|_next/image|.*\\..*).*)"],
};
