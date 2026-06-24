'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type='button'
      onClick={handleLogout}
      disabled={loading}
      className='rounded-full border border-ember/30 bg-ember-soft px-4 py-2 text-sm font-semibold text-ember hover:bg-ember/10 disabled:opacity-50'
    >
      {loading ? '退出中…' : '退出登录'}
    </button>
  );
}
