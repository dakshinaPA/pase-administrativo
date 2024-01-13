import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const apiKey = Boolean(req.headers.get("api-key"))

  if (!apiKey) {
    return NextResponse.json({ mensaje: "no aurorizado" }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
