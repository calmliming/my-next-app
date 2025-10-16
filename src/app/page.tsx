import Link from 'next/link';

// import Posts from '@/components/posts/posts';

export default function Home() {
  return (
    <main>
      <Link href='/posts'>查看文章列表</Link>
    </main>
  );
}
