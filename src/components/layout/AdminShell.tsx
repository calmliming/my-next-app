import type { ReactNode } from 'react';

/** 管理端仅做背景容器，不再显示全局顶部栏 */
export default function AdminShell({ children }: { children: ReactNode }) {
  return <div className='min-h-screen flex flex-col bg-gray-100'>{children}</div>;
}
