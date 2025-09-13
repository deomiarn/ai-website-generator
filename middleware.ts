export { auth as middleware } from "./src/lib/auth-edge";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|static|images).*)",
  ],
};
