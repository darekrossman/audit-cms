import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? 'changeme'
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'audit-cms-auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    if (password !== AUTH_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)

  return NextResponse.json({ success: true })
}
