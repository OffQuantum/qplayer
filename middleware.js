export { auth as middleware } from "@/auth"

export const config = {
  // Protect all routes except next internals, statics, auth api, signin, and custom error page
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|auth/signin|auth/error).*)"],
}
