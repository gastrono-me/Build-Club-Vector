import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase auth session cookie and returns a NextResponse.
 * Call this from `middleware.ts` on every request that matches the config
 * matcher so the session never goes stale between page navigations.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Start with a plain pass-through response; the cookie helpers below will
  // mutate its headers if a session refresh is needed.
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          // Write cookies onto the outgoing request so downstream server code
          // can read the refreshed value within this same request cycle.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          // Re-create the response so it carries the updated request headers.
          response = NextResponse.next({ request })
          // Also set the cookies on the response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Calling getUser() triggers the token refresh if the current token is
  // about to expire. We ignore the returned user here — auth-gating is the
  // responsibility of individual route handlers and layouts.
  await supabase.auth.getUser()

  return response
}
