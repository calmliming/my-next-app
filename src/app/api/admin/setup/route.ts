import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const setupSecret = process.env.ADMIN_SETUP_SECRET;
    if (process.env.NODE_ENV === 'production' && !setupSecret) {
      return NextResponse.json(
        { msg: '生产环境需要配置 ADMIN_SETUP_SECRET 后才能初始化管理员' },
        { status: 403 }
      );
    }
    if (setupSecret && request.nextUrl.searchParams.get('secret') !== setupSecret) {
      return NextResponse.json({ msg: '初始化密钥不正确' }, { status: 401 });
    }

    const db = await getDb();
    const adminCollection = db.collection('admins');

    // 检查是否已存在管理员
    const count = await adminCollection.countDocuments();
    if (count > 0) {
      return NextResponse.json({ msg: '管理员已存在，无需初始化' });
    }

    // 创建默认管理员
    const passwordHash = await hashPassword('admin123');
    await adminCollection.insertOne({
      username: 'admin',
      password: passwordHash,
      createdAt: new Date(),
    });

    return NextResponse.json({ msg: '初始化成功，默认账号: admin / admin123' });
  } catch {
    return NextResponse.json({ msg: '初始化失败' }, { status: 500 });
  }
}
