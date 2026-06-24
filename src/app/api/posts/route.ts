import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/auth';

// 文章数据类型
type Post = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

type PostFormData = {
  title: string;
  content: string;
};

function serializePost(post: Record<string, unknown>): Post {
  return {
    _id: String(post._id),
    title: String(post.title ?? ''),
    content: String(post.content ?? ''),
    createdAt: new Date(post.createdAt as string | Date).toISOString(),
  };
}

function normalizePostPayload(payload: unknown): PostFormData | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Partial<PostFormData>;
  const title = typeof p.title === 'string' ? p.title.trim() : '';
  const content = typeof p.content === 'string' ? p.content.trim() : '';
  if (!title || !content) return null;
  return { title, content };
}

export async function GET() {
  try {
    const db = await getDb();
    const postsCollection = db.collection('posts');
    const posts = await postsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    const formattedPosts: Post[] = posts.map(serializePost);
    return NextResponse.json({
      code: 200,
      data: formattedPosts,
      msg: '文章列表读取成功',
    });
  } catch (error) {
    console.error('读取失败：', error);
    return NextResponse.json(
      {
        code: 500,
        data: null,
        msg: '读取文章失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json(
        { code: 401, data: null, msg: '需要管理员登录' },
        { status: 401 }
      );
    }

    const formData = normalizePostPayload(await request.json());
    if (!formData) {
      return NextResponse.json(
        { code: 400, data: null, msg: '标题和内容不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const postsCollection = db.collection('posts');
    const now = new Date();
    const result = await postsCollection.insertOne({
      title: formData.title,
      content: formData.content,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        code: 201,
        data: {
          _id: result.insertedId.toString(),
          title: formData.title,
          content: formData.content,
          createdAt: now.toISOString(),
        },
        msg: '动态发布成功',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('保存失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '保存动态失败' },
      { status: 500 }
    );
  }
}
