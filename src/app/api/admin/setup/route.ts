import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
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
  } catch (error) {
    return NextResponse.json({ msg: '初始化失败' }, { status: 500 });
  }
}
