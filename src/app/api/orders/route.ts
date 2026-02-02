import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';

type CreateOrderPayload = {
  items: Array<{ menuItemId: string; quantity: number }>;
  note?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPositiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

export async function GET() {
  try {
    const db = await getDb();
    const orders = await db
      .collection('orders')
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      code: 200,
      data: orders.map((o) => ({
        id: o._id.toString(),
        items: o.items,
        totalPrice: o.totalPrice,
        note: o.note ?? '',
        status: o.status ?? 'new',
        createdAt: new Date(o.createdAt).toISOString(),
      })),
      msg: '订单列表读取成功',
    });
  } catch (error) {
    console.error('读取订单失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '读取订单失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreateOrderPayload;
    if (!payload?.items || !Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json(
        { code: 400, data: null, msg: '请至少选择一个菜品' },
        { status: 400 }
      );
    }

    const normalized = payload.items
      .map((it) => ({
        menuItemId: String(it.menuItemId),
        quantity: it.quantity,
      }))
      .filter((it) => ObjectId.isValid(it.menuItemId) && isPositiveInt(it.quantity));

    if (normalized.length === 0) {
      return NextResponse.json(
        { code: 400, data: null, msg: '菜品参数不合法' },
        { status: 400 }
      );
    }

    // 合并重复菜品
    const qtyMap = new Map<string, number>();
    for (const it of normalized) {
      qtyMap.set(it.menuItemId, (qtyMap.get(it.menuItemId) ?? 0) + it.quantity);
    }
    const ids = Array.from(qtyMap.keys()).map((id) => new ObjectId(id));

    const db = await getDb();
    const menuItems = await db
      .collection('menuItems')
      .find({ _id: { $in: ids }, isActive: true })
      .toArray();

    if (menuItems.length !== ids.length) {
      return NextResponse.json(
        { code: 400, data: null, msg: '包含不存在或已下架的菜品' },
        { status: 400 }
      );
    }

    let totalPrice = 0;
    const orderItems = menuItems.map((mi) => {
      const menuItemId = mi._id.toString();
      const quantity = qtyMap.get(menuItemId) ?? 0;
      const price = Number(mi.price) || 0;
      const subtotal = price * quantity;
      totalPrice += subtotal;
      return {
        menuItemId,
        name: mi.name,
        price,
        quantity,
        subtotal,
        categoryId: mi.categoryId,
      };
    });

    const now = new Date();
    const note = isNonEmptyString(payload.note) ? payload.note.trim() : '';
    const result = await db.collection('orders').insertOne({
      items: orderItems,
      totalPrice,
      note,
      status: 'new',
      createdAt: now,
    });

    return NextResponse.json(
      {
        code: 201,
        data: {
          id: result.insertedId.toString(),
          totalPrice,
          createdAt: now.toISOString(),
        },
        msg: '点菜成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('点菜失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '点菜失败' },
      { status: 500 }
    );
  }
}

