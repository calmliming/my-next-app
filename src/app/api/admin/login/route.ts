import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ msg: '请输入用户名和密码' }, { status: 400 });
    }

    const db = await getDb();
    const admin = await db.collection('admins').findOne({ username });

    if (!admin) {
      return NextResponse.json({ msg: '用户名或密码错误' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ msg: '用户名或密码错误' }, { status: 401 });
    }

    // 生成 Token
    const token = await signToken({ id: admin._id.toString(), username: admin.username });

    // 设置 Cookie
    const response = NextResponse.json({ msg: '登录成功' });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ msg: '登录失败' }, { status: 500 });
  }
}
