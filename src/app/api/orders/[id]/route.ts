import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
