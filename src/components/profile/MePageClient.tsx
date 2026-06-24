'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  IconBook,
  IconBowl,
  IconChevronRight,
  IconReceipt,
  IconSparkle,
  IconWallet,
} from '@/components/ui/icons';

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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const startEdit = () => {
    setDraft(profile.nickname);
    setEditing(true);
  };

  const saveNickname = () => {
    const name = draft.trim() || DEFAULT_PROFILE.nickname;
    const next = { ...profile, nickname: name };
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 忽略写入失败
    }
    setEditing(false);
  };

  const progress = Math.min(100, profile.vipLevel * 20);

  return (
    <div className='min-h-screen bg-paper pb-28'>
      {/* 顶部会员卡 */}
      <header className='relative overflow-hidden bg-gradient-to-br from-ink to-[#3a2e26] px-5 pb-16 pt-10 text-paper'>
        <div className='pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl' />
        <div className='relative mx-auto flex max-w-lg items-center gap-4'>
          <div className='relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/60'>
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
            {editing ? (
              <div className='flex items-center gap-2'>
                <input
                  value={draft}
                  autoFocus
                  maxLength={16}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                  className='w-32 rounded-lg border border-gold/40 bg-white/10 px-2 py-1 text-lg font-bold text-paper outline-none placeholder:text-paper/50'
                  placeholder='输入昵称'
                />
                <button
                  type='button'
                  onClick={saveNickname}
                  className='rounded-full bg-gold px-3 py-1 text-xs font-bold text-ink'
                >
                  保存
                </button>
              </div>
            ) : (
              <button
                type='button'
                onClick={startEdit}
                className='flex items-center gap-1.5 text-left'
              >
                <span className='font-display truncate text-2xl font-bold'>
                  {profile.nickname}
                </span>
                <span className='rounded-md border border-paper/30 px-1.5 py-0.5 text-[10px] text-paper/70'>
                  编辑
                </span>
              </button>
            )}
            <div className='mt-2 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-semibold text-gold'>
              <IconSparkle className='h-3.5 w-3.5' />
              VIP {profile.vipLevel} · {profile.vipLabel}
            </div>
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-lg space-y-4 px-5'>
        {/* 余额卡（上浮覆盖头部） */}
        <section className='-mt-10 rounded-2xl border border-line bg-surface p-5 shadow-card'>
          <div className='flex items-center gap-2 text-xs font-medium text-ink-soft'>
            <IconWallet className='h-4 w-4 text-gold' />
            账户余额
          </div>
          <div className='mt-2 flex items-baseline gap-1'>
            <span className='text-sm font-bold text-ember'>¥</span>
            <span className='tnum text-3xl font-extrabold text-ink'>
              {profile.balance.toFixed(2)}
            </span>
          </div>
          <p className='mt-2 text-xs text-ink-faint'>
            余额可用于堂食抵扣（演示数据，接入后端后替换）
          </p>
        </section>

        {/* VIP 进度 */}
        <section className='rounded-2xl border border-gold/30 bg-gold-soft/60 p-5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-bold text-ink'>会员等级</span>
            <span className='font-display text-2xl font-black text-gold'>
              VIP {profile.vipLevel}
            </span>
          </div>
          <div className='mt-3 h-2 overflow-hidden rounded-full bg-surface'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-gold to-ember transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className='mt-2 text-xs text-ink-soft'>再消费可升级更高等级（演示进度）</p>
        </section>

        {/* 快捷入口 */}
        <section className='overflow-hidden rounded-2xl border border-line bg-surface shadow-card'>
          <Link
            href='/order'
            className='flex items-center gap-3 border-b border-line px-5 py-4 transition-colors hover:bg-paper'
          >
            <IconBowl className='h-5 w-5 text-ember' />
            <span className='flex-1 text-sm font-semibold text-ink'>去点菜</span>
            <IconChevronRight className='h-4 w-4 text-ink-faint' />
          </Link>
          <Link
            href='/order/history'
            className='flex items-center gap-3 px-5 py-4 transition-colors hover:bg-paper'
          >
            <IconReceipt className='h-5 w-5 text-gold' />
            <span className='flex-1 text-sm font-semibold text-ink'>我的点菜记录</span>
            <IconChevronRight className='h-4 w-4 text-ink-faint' />
          </Link>
          <Link
            href='/posts'
            className='flex items-center gap-3 border-t border-line px-5 py-4 transition-colors hover:bg-paper'
          >
            <IconBook className='h-5 w-5 text-gold' />
            <span className='flex-1 text-sm font-semibold text-ink'>店家动态</span>
            <IconChevronRight className='h-4 w-4 text-ink-faint' />
          </Link>
        </section>
      </div>
    </div>
  );
}
