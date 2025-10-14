// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { Code, ObjectId } from 'mongodb'; // 新增：用于处理MongoDB的ID

// 获取单篇文章详情（供编辑表单使用）
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // 从URL中获取文章ID
) {
  try {
    const postId = params.id;

    // 验证ID格式（MongoDB的ID是24位字符串）
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: '无效的文章ID' }, { status: 400 });
    }

    // 从数据库查询文章
    const db = await getDb();
    const post = await db.collection('posts').findOne({
      _id: new ObjectId(postId), // 转换为MongoDB的ObjectId类型
    });

    if (!post) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 });
    }

    // 格式化数据返回
    return NextResponse.json({
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      createdAt: new Date(post.createdAt).toLocaleString(),
    });
  } catch (error) {
    console.error('获取文章详情失败：', error);
    return NextResponse.json({ message: '获取文章详情失败' }, { status: 500 });
  }
}

// 修改文章（处理PUT请求）
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const updateData = await request.json(); // 获取修改后的内容

    // 验证ID和数据
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: '无效的文章ID' }, { status: 400 });
    }
    if (!updateData.title || !updateData.content) {
      return NextResponse.json(
        { message: '标题和内容不能为空', code: 400 },
        { status: 400 }
      );
    }

    // 更新数据库
    const db = await getDb();
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) }, // 条件：找到对应ID的文章
      { $set: { title: updateData.title, content: updateData.content } } // 更新内容
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: '文章不存在或未修改' },
        { status: 404 }
      );
    }

    // 返回更新后的文章（重新查询一次确保数据最新）
    const updatedPost = await db.collection('posts').findOne({
      _id: new ObjectId(postId),
    });

    return NextResponse.json({
      _id: updatedPost!._id.toString(),
      title: updatedPost!.title,
      content: updatedPost!.content,
      createdAt: new Date(updatedPost!.createdAt).toLocaleString(),
    });
  } catch (error) {
    console.error('修改文章失败：', error);
    return NextResponse.json({ message: '修改文章失败' }, { status: 500 });
  }
}

// 删除文章（处理DELETE请求）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // 验证ID
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: '无效的文章ID' }, { status: 400 });
    }

    // 从数据库删除
    const db = await getDb();
    const result = await db.collection('posts').deleteOne({
      _id: new ObjectId(postId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: '文章不存在' }, { status: 404 });
    }

    // 删除成功
    return NextResponse.json({ message: '文章已删除' });
  } catch (error) {
    console.error('删除文章失败：', error);
    return NextResponse.json({ message: '删除文章失败' }, { status: 500 });
  }
}
