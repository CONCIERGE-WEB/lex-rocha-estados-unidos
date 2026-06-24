import { createServerClient } from "@supabase/ssr";

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];
  return cookieHeader
    .split(";")
    .map((part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return null;
      return {
        name: part.slice(0, idx).trim(),
        value: decodeURIComponent(part.slice(idx + 1).trim()),
      };
    })
    .filter((c): c is { name: string; value: string } => c !== null && c.name.length > 0);
}

export async function utilizadorAdminDeRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("cookie") ?? "");
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
