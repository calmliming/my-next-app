'use client';
import Posts from '@/components/posts/posts';
import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div className='max-w-6xl mx-auto px-4 py-4 pb-24 space-y-4'>
      <div className='flex flex-wrap gap-2 items-center'>
        <Link
          href='/order'
          className='inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-red-700'
        >
          🌶️ 去点菜
        </Link>
        <Link
          href='/posts'
          className='inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white shadow hover:bg-gray-800'
        >
          📚 看文章
        </Link>
        <Link
          href='/login'
          className='inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50'
        >
          管理员登录
        </Link>
      </div>
      <Posts />
    </div>
  );
};

export default Home;
