'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'me_profile_v1';

type MeProfile = {
  nickname: string;
  avatar: string;
  balance: number;
  vipLevel: number;
  vipLabel: string;
};

const DEFAULT_PROFILE: MeProfile = {
  nickname: '食客',
  avatar:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&facepad=2',
  balance: 128.5,
  vipLevel: 3,
  vipLabel: '黄金会员',
};

function loadProfile(): MeProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<MeProfile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export default function MePageClient() {
  const [profile, setProfile] = useState<MeProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  return (
    <div className='min-h-screen bg-[#f5f5f5] pb-24'>
      <header className='bg-white border-b border-gray-100 px-4 py-4'>
        <h1 className='text-lg font-bold text-gray-900'>我的</h1>
        <p className='text-xs text-gray-500 mt-0.5'>个人信息与会员权益</p>
      </header>

      <div className='max-w-lg mx-auto px-4 py-5 space-y-4'>
        {/* 头像 + 名称 */}
        <section className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='p-5 flex items-center gap-4'>
            <div className='relative w-20 h-20 shrink-0 rounded-full overflow-hidden ring-4 ring-amber-100 bg-gray-100'>
              <Image
                src={profile.avatar}
                alt='头像'
                fill
                sizes='80px'
                className='object-cover'
                priority
              />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='text-lg font-bold text-gray-900 truncate'>
                {profile.nickname}
              </div>
              <div className='mt-1 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-2.5 py-0.5 text-xs font-bold text-white'>
                VIP {profile.vipLevel} · {profile.vipLabel}
              </div>
            </div>
          </div>
        </section>

        {/* 余额 */}
        <section className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
          <div className='text-xs text-gray-500 font-medium'>账户余额</div>
          <div className='mt-2 flex items-baseline gap-1'>
            <span className='text-sm text-amber-600 font-bold'>¥</span>
            <span className='text-3xl font-extrabold text-gray-900 tabular-nums'>
              {profile.balance.toFixed(2)}
            </span>
          </div>
          <p className='mt-2 text-xs text-gray-400'>余额可用于堂食抵扣（演示数据，可接后端后替换）</p>
        </section>

        {/* VIP 等级说明 */}
        <section className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-bold text-gray-900'>会员等级</span>
            <span className='text-2xl font-black text-amber-600'>VIP {profile.vipLevel}</span>
          </div>
          <p className='mt-2 text-sm text-gray-600'>{profile.vipLabel}</p>
          <div className='mt-3 h-2 rounded-full bg-white/80 overflow-hidden'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500'
              style={{ width: `${Math.min(100, profile.vipLevel * 20)}%` }}
            />
          </div>
          <p className='mt-2 text-xs text-gray-500'>再消费可升级更高等级（演示进度条）</p>
        </section>
      </div>
    </div>
  );
}
