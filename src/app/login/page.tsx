'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconChili } from '@/components/ui/icons';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || '登录失败');
      }

      router.push('/admin/menu');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-paper px-4'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <span className='inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ember text-white shadow-card'>
            <IconChili className='h-7 w-7' />
          </span>
          <h1 className='font-display mt-4 text-2xl font-bold text-ink'>商家管理后台</h1>
          <p className='mt-1.5 text-sm text-ink-soft'>洁洁的美食小世界 · 请登录</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-5 rounded-3xl border border-line bg-surface p-7 shadow-card'
        >
          {error && (
            <div className='rounded-xl bg-ember-soft px-4 py-3 text-center text-sm text-ember'>
              {error}
            </div>
          )}

          <div>
            <label className='mb-1.5 block text-sm font-semibold text-ink'>用户名</label>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ember/50 focus:bg-surface'
              placeholder='请输入用户名'
              required
            />
          </div>

          <div>
            <label className='mb-1.5 block text-sm font-semibold text-ink'>密码</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ember/50 focus:bg-surface'
              placeholder='请输入密码'
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-full bg-ember py-3 font-bold text-white shadow-card transition-transform active:scale-[0.98] disabled:opacity-50'
          >
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
