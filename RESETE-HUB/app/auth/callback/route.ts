import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  const nextPath = url.searchParams.get("next") ?? "/hub";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!code || !supabaseUrl || !supabaseKey) {
    url.pathname = "/login";
    url.searchParams.delete("code");
    return NextResponse.redirect(url);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    url.pathname = "/login";
    url.searchParams.set("error", encodeURIComponent(error.message));
    url.searchParams.delete("code");
    return NextResponse.redirect(url);
  }

  url.pathname = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  url.searchParams.delete("code");
  url.searchParams.delete("next");
  return NextResponse.redirect(url);
}
