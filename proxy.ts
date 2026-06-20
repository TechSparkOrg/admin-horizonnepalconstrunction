import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard", "/categories", "/projects", "/faqs", "/blogs", "/pages",
  "/reviews", "/vastu", "/team", "/building-permit", "/media",
  "/material-list", "/documents", "/resource-allocation", "/emi",
];
const publicRoutes = ["/login", "/"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token");
  const isProtected = protectedRoutes.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isPublic = publicRoutes.includes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*$).*)"],
};
