import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    const { password } = await req.json()
    if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 })
    }
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_auth', process.env.ADMIN_PASSWORD!, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
        path: '/',
    })
    return response
}

export async function DELETE() {
    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin_auth')
    return response
}
