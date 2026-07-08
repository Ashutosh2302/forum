import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: Request) {
  return intlMiddleware(request as Parameters<typeof intlMiddleware>[0]);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
