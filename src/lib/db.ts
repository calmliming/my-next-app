// lib/db.ts
import { MongoClient } from 'mongodb';

// 从环境变量获取连接地址（后面教你填）
const MONGODB_URI = process.env.MONGODB_URI || '';
// 数据库名称（随便起，比如"myBlog"）
const DB_NAME = 'myBlog';

// 缓存连接，避免重复创建连接
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) {
  throw new Error('请先在 .env.local 文件里填好 MONGODB_URI！');
}

if (process.env.NODE_ENV === 'development') {
  // 开发环境：缓存连接（全局变量）
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 生产环境：直接连接（不缓存全局变量）
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// 导出获取数据库的函数（供其他地方调用）
export async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// 给 TypeScript 加类型（不用管，不影响运行）
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}