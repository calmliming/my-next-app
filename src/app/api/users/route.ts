// app/api/posts/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

// 文章数据类型
type Post = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

// 新增：定义接收的表单数据类型
type PostFormData = {
  title: string;
  content: string;
};

// 读取文章列表（之前的代码不变）
export async function GET() {
  try {
    const db = await getDb();
    const postsCollection = db.collection('posts');
    console.log('postsCollection:', postsCollection);
    const posts = await postsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
   console.log('posts:', posts);
    const formattedPosts: Post[] = posts.map((post) => ({
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      createdAt: new Date(post.createdAt).toLocaleString(),
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('读取失败：', error);
    return NextResponse.json({ message: '读取文章失败' }, { status: 500 });
  }
}

// 新增：处理POST请求（保存新文章）
export async function POST(request: Request) {
  try {
    // 1. 获取前端提交的表单数据
    const formData: PostFormData = await request.json();

    // 2. 简单验证（标题和内容不能为空）
    if (!formData.title || !formData.content) {
      return NextResponse.json(
        { message: '标题和内容不能为空' },
        { status: 400 } // 400表示请求错误
      );
    }

    // 3. 连接数据库，插入新文章
    const db = await getDb();
    const postsCollection = db.collection('posts');

    // 插入时自动添加创建时间
    const result = await postsCollection.insertOne({
      title: formData.title,
      content: formData.content,
      createdAt: new Date(), // 当前时间
    });

    // 4. 返回新创建的文章（包含_id）
    return NextResponse.json(
      {
        _id: result.insertedId.toString(),
        title: formData.title,
        content: formData.content,
        createdAt: new Date().toLocaleString(),
      },
      { status: 201 }
    ); // 201表示创建成功
  } catch (error) {
    console.error('保存失败：', error);
    return NextResponse.json({ message: '保存文章失败' }, { status: 500 });
  }
}
