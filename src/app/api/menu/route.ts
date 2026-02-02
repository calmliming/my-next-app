import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { categories, seedMenuItems, type MenuItemInput } from '@/lib/menu';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function normalizeMenuItemInput(payload: unknown): MenuItemInput | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Partial<MenuItemInput>;
  if (!isNonEmptyString(p.name)) return null;
  if (!isFiniteNumber(p.price) || p.price < 0) return null;
  if (!isNonEmptyString(p.categoryId)) return null;
  if (!categories.some((c) => c.id === p.categoryId)) return null;
  if (!isNonEmptyString(p.img)) return null;
  if (!isNonEmptyString(p.desc)) return null;
  return {
    name: p.name.trim(),
    price: p.price,
    categoryId: p.categoryId,
    img: p.img.trim(),
    desc: p.desc.trim(),
    isActive: p.isActive ?? true,
  };
}

async function ensureSeeded() {
  const db = await getDb();
  const col = db.collection('menuItems');
  const count = await col.countDocuments();
  if (count > 0) return;
  const now = new Date();
  await col.insertMany(
    seedMenuItems.map((item) => ({
      ...item,
      isActive: item.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    }))
  );
}

export async function GET(request: NextRequest) {
  try {
    const includeInactive =
      request.nextUrl.searchParams.get('includeInactive') === '1';

    await ensureSeeded();
    const db = await getDb();
    const col = db.collection('menuItems');

    const query = includeInactive ? {} : { isActive: true };
    const items = await col
      .find(query)
      .sort({ categoryId: 1, createdAt: 1 })
      .toArray();

    return NextResponse.json({
      code: 200,
      data: items.map((it) => ({
        id: it._id.toString(),
        name: it.name,
        price: it.price,
        categoryId: it.categoryId,
        img: it.img,
        desc: it.desc,
        isActive: Boolean(it.isActive),
        createdAt: new Date(it.createdAt).toISOString(),
        updatedAt: new Date(it.updatedAt).toISOString(),
      })),
      msg: '菜品列表读取成功',
    });
  } catch (error) {
    console.error('读取菜品失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '读取菜品失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const input = normalizeMenuItemInput(payload);
    if (!input) {
      return NextResponse.json(
        { code: 400, data: null, msg: '参数不合法' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection('menuItems');
    const now = new Date();
    const result = await col.insertOne({
      ...input,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        code: 201,
        data: {
          id: result.insertedId.toString(),
          ...input,
          isActive: input.isActive ?? true,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        msg: '菜品创建成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建菜品失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '创建菜品失败' },
      { status: 500 }
    );
  }
}

