import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { shouldUseClerk } from "./src/lib/auth/config";

function keylessProxy() {
  return NextResponse.next();
}

const proxy = shouldUseClerk() ? clerkMiddleware() : keylessProxy;

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
