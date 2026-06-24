import { NextResponse, NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';
import { ObjectId } from 'mongodb';

function serializePost(post: Record<string, unknown>) {
  return {
    _id: String(post._id),
    title: String(post.title ?? ''),
    content: String(post.content ?? ''),
    createdAt: new Date(post.createdAt as string | Date).toISOString(),
  };
}

function normalizePostPayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Partial<{ title: string; content: string }>;
  const title = typeof p.title === 'string' ? p.title.trim() : '';
  const content = typeof p.content === 'string' ? p.content.trim() : '';
  if (!title || !content) return null;
  return { title, content };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const postId = (await params).id;

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '无效的动态ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const post = await db.collection('posts').findOne({
      _id: new ObjectId(postId),
    });

    if (!post) {
      return NextResponse.json(
        { code: 404, data: null, msg: '动态不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 200,
      data: serializePost(post),
      msg: '读取成功',
    });
  } catch (error) {
    console.error('获取动态详情失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '获取动态详情失败' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const postId = (await params).id;
    const updateData = normalizePostPayload(await request.json());

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '无效的动态ID' },
        { status: 400 }
      );
    }
    if (!updateData) {
      return NextResponse.json(
        { code: 400, data: null, msg: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const now = new Date();
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: { ...updateData, updatedAt: now } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { code: 404, data: null, msg: '动态不存在' },
        { status: 404 }
      );
    }

    const updatedPost = await db.collection('posts').findOne({
      _id: new ObjectId(postId),
    });

    return NextResponse.json({
      code: 200,
      data: serializePost(updatedPost!),
      msg: '动态已保存',
    });
  } catch (error) {
    console.error('修改动态失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '修改动态失败' },
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

    const postId = (await params).id;

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '无效的动态ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('posts').deleteOne({
      _id: new ObjectId(postId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { code: 404, data: null, msg: '动态不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ code: 200, data: null, msg: '动态已删除' });
  } catch (error) {
    console.error('删除动态失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '删除动态失败' },
      { status: 500 }
    );
  }
}
