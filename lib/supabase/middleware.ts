import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase auth session cookie and gates protected routes.
 * Designed to FAIL OPEN: any error (or missing config) returns a plain
 * pass-through response rather than 500-ing every route in the app.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // No config -> don't crash the site; just pass through.
  if (!url || !anon) return response

  try {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isPublic =
      pathname === '/login' || pathname.startsWith('/auth/callback')

    if (!user && !isPublic) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') redirectResponse.headers.append(key, value)
      })
      return redirectResponse
    }

    return response
  } catch {
    // Auth/network/runtime error in middleware must never take down the site.
    return response
  }
}
