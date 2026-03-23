import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';

const ORDER_STATUSES = ['new', 'cooking', 'done'] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json(
        { code: 401, data: null, msg: '需要管理员登录' },
        { status: 401 }
      );
    }
    const orderId = (await params).id;
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '无效的订单ID' },
        { status: 400 }
      );
    }
    const body = (await request.json()) as { status?: string };
    const status = body?.status;
    if (!status || !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return NextResponse.json(
        { code: 400, data: null, msg: '状态不合法' },
        { status: 400 }
      );
    }
    const now = new Date();
    const db = await getDb();
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: now } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { code: 404, data: null, msg: '订单不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      code: 200,
      data: { status, updatedAt: now.toISOString() },
      msg: '更新成功',
    });
  } catch (error) {
    console.error('更新订单失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '更新订单失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json(
        { code: 401, data: null, msg: '需要管理员登录' },
        { status: 401 }
      );
    }
    const orderId = (await params).id;

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '无效的订单ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('orders').deleteOne({
      _id: new ObjectId(orderId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { code: 404, data: null, msg: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      data: null,
      msg: '订单删除成功',
    });
  } catch (error) {
    console.error('删除订单失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '删除订单失败' },
      { status: 500 }
    );
  }
}
