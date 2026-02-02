import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function getExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
  };
  return map[mime] ?? '.jpg';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '请选择图片文件' },
        { status: 400 }
      );
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { code: 400, data: null, msg: '仅支持 JPG/PNG/GIF/WebP' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { code: 400, data: null, msg: '图片大小不能超过 2MB' },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = getExt(file.type);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, name);
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const url = `/uploads/${name}`;
    return NextResponse.json({
      code: 200,
      data: { url },
      msg: '上传成功',
    });
  } catch (error) {
    console.error('上传失败：', error);
    return NextResponse.json(
      { code: 500, data: null, msg: '上传失败' },
      { status: 500 }
    );
  }
}
