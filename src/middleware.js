import { NextResponse } from "next/server";

const publicPages = [
  "/",
  "/login",
  "/signup",
  "/forgotPassword",
  "/resetPassword",
];

const protectedPages = ["/categories"];

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  const authToken = req.cookies.get("sessionToken")?.value;

  const isPublicPage = publicPages.includes(pathname);
  const isProtectedPage = protectedPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );

  if (!authToken && isProtectedPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (authToken && isPublicPage) {
    return NextResponse.redirect(new URL("/categories", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
