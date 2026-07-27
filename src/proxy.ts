import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

const protectedPrefixes = ["/dealroom", "/admin"];
const authPaths = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    if (protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("notice", "setup");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          response.headers.set("Cache-Control", "private, no-store");
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && protectedPrefixes.some((prefix) => path.startsWith(prefix))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && authPaths.includes(path)) {
    const dealroomUrl = request.nextUrl.clone();
    dealroomUrl.pathname = "/dealroom";
    dealroomUrl.search = "";
    return NextResponse.redirect(dealroomUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
