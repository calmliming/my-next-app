import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db';
import { categories } from '@/lib/menu';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ code: 400, data: null, msg: '无效的菜品ID' }, { status: 400 });
    }

    const db = await getDb();
    const item = await db.collection('menuItems').findOne({ _id: new ObjectId(id) });
    if (!item) {
      return NextResponse.json({ code: 404, data: null, msg: '菜品不存在' }, { status: 404 });
    }

    return NextResponse.json({
      code: 200,
      data: {
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        categoryId: item.categoryId,
        img: item.img,
        desc: item.desc,
        isActive: Boolean(item.isActive),
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString(),
      },
      msg: '读取成功',
    });
  } catch (error) {
    console.error('读取菜品失败：', error);
    return NextResponse.json({ code: 500, data: null, msg: '读取菜品失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ code: 400, data: null, msg: '无效的菜品ID' }, { status: 400 });
    }

    const payload = await request.json();
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ code: 400, data: null, msg: '参数不合法' }, { status: 400 });
    }

    const p = payload as Partial<{
      name: string;
      price: number;
      categoryId: string;
      img: string;
      desc: string;
      isActive: boolean;
    }>;

    const update: Record<string, unknown> = {};
    if (typeof p.isActive === 'boolean') update.isActive = p.isActive;
    if (typeof p.name !== 'undefined') {
      if (!isNonEmptyString(p.name)) {
        return NextResponse.json({ code: 400, data: null, msg: '菜名不能为空' }, { status: 400 });
      }
      update.name = p.name.trim();
    }
    if (typeof p.price !== 'undefined') {
      if (!isFiniteNumber(p.price) || p.price < 0) {
        return NextResponse.json({ code: 400, data: null, msg: '价格不合法' }, { status: 400 });
      }
      update.price = p.price;
    }
    if (typeof p.categoryId !== 'undefined') {
      if (!isNonEmptyString(p.categoryId) || !categories.some((c) => c.id === p.categoryId)) {
        return NextResponse.json({ code: 400, data: null, msg: '分类不合法' }, { status: 400 });
      }
      update.categoryId = p.categoryId;
    }
    if (typeof p.img !== 'undefined') {
      if (!isNonEmptyString(p.img)) {
        return NextResponse.json({ code: 400, data: null, msg: '图片地址不能为空' }, { status: 400 });
      }
      update.img = p.img.trim();
    }
    if (typeof p.desc !== 'undefined') {
      if (!isNonEmptyString(p.desc)) {
        return NextResponse.json({ code: 400, data: null, msg: '描述不能为空' }, { status: 400 });
      }
      update.desc = p.desc.trim();
    }

    update.updatedAt = new Date();

    const db = await getDb();
    const col = db.collection('menuItems');
    const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
    if (result.matchedCount === 0) {
      return NextResponse.json({ code: 404, data: null, msg: '菜品不存在' }, { status: 404 });
    }

    const item = await col.findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      code: 200,
      data: {
        id: item!._id.toString(),
        name: item!.name,
        price: item!.price,
        categoryId: item!.categoryId,
        img: item!.img,
        desc: item!.desc,
        isActive: Boolean(item!.isActive),
        createdAt: new Date(item!.createdAt).toISOString(),
        updatedAt: new Date(item!.updatedAt).toISOString(),
      },
      msg: '更新成功',
    });
  } catch (error) {
    console.error('更新菜品失败：', error);
    return NextResponse.json({ code: 500, data: null, msg: '更新菜品失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id?.trim?.() ?? '';
    if (!id) {
      return NextResponse.json({ code: 400, data: null, msg: '无效的菜品ID' }, { status: 400 });
    }
    const db = await getDb();
    const col = db.collection('menuItems');

    let result = { deletedCount: 0 };
    if (ObjectId.isValid(id)) {
      result = await col.deleteOne({ _id: new ObjectId(id) });
    }
    if (result.deletedCount === 0) {
      // 兼容 _id 存为字符串的历史数据
      result = await col.deleteOne({ _id: id } as unknown as import('mongodb').Filter<import('mongodb').Document>);
    }
    if (result.deletedCount === 0) {
      return NextResponse.json({ code: 404, data: null, msg: '菜品不存在' }, { status: 404 });
    }
    return NextResponse.json({ code: 200, data: null, msg: '删除成功' });
  } catch (error) {
    console.error('删除菜品失败：', error);
    return NextResponse.json({ code: 500, data: null, msg: '删除菜品失败' }, { status: 500 });
  }
}
