'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import { IconBook, IconClose, IconPlus } from '@/components/ui/icons';
import {
  ConfirmDialog,
  InlineNotice,
  type NoticeTone,
} from '@/components/ui/Feedback';

// 动态类型定义
type Post = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

type PostsProps = {
  mode?: 'public' | 'admin';
};

function getResponseMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback;
  const data = payload as { msg?: unknown; message?: unknown };
  if (typeof data.msg === 'string') return data.msg;
  if (typeof data.message === 'string') return data.message;
  return fallback;
}

function getResponseData<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as { data?: unknown };
  return (data.data ?? payload) as T;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Posts({ mode = 'public' }: PostsProps) {
  const isAdmin = mode === 'admin';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 表单状态（新增/编辑共用）
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: NoticeTone }>({
    message: '',
    tone: 'info',
  });

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const res = await response.json();
      if (!response.ok) throw new Error(getResponseMessage(res, '获取动态列表失败'));
      setPosts(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载动态失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetComposer = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setSubmitMessage('');
  };

  const handleEdit = async (id: string) => {
    if (!isAdmin) return;
    setLoadingEdit(true);
    setSubmitMessage('');
    setComposerOpen(true);
    try {
      const response = await fetch(`/api/posts/${id}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(getResponseMessage(payload, '加载动态失败'));
      }
      const post = getResponseData<Post>(payload);
      if (!post) throw new Error('动态数据为空');
      setTitle(post.title);
      setContent(post.content);
      setEditingId(id);
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : '编辑失败');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    resetComposer();
    setComposerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!title.trim() || !content.trim()) {
      setSubmitMessage('请填写标题与内容');
      return;
    }
    setSubmitting(true);
    setSubmitMessage('');

    try {
      const response = editingId
        ? await fetch(`/api/posts/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content }),
          })
        : await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content }),
          });

      const result = await response.json();
      if (!response.ok) throw new Error(getResponseMessage(result, '操作失败'));

      setNotice({
        message: editingId ? '动态已保存' : '动态已发布',
        tone: 'success',
      });
      resetComposer();
      setComposerOpen(false);
      fetchPosts();
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : '操作失败');
      setNotice({
        message: err instanceof Error ? err.message : '操作失败',
        tone: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin || !deleteTarget) return;

    setDeletingId(deleteTarget._id);
    try {
      const response = await fetch(`/api/posts/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(getResponseMessage(result, '删除失败'));
      setNotice({ message: '动态已删除', tone: 'success' });
      setDeleteTarget(null);
      fetchPosts();
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : '删除失败',
        tone: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='min-h-screen bg-paper pb-28'>
      <header className='border-b border-line bg-surface/90 px-5 py-4 backdrop-blur'>
        <div className='mx-auto flex max-w-2xl items-center justify-between gap-3'>
          <div>
            <h1 className='font-display text-xl font-bold text-ink'>店家动态</h1>
            <p className='mt-0.5 text-xs text-ink-soft'>
              {isAdmin ? '发布新菜、活动与厨房日常' : '新菜、活动与厨房日常'}
            </p>
          </div>
          {isAdmin ? (
            <div className='flex shrink-0 items-center gap-2'>
              <Link
                href='/admin/orders'
                className='hidden rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper lg:inline-flex'
              >
                点菜记录
              </Link>
              <Link
                href='/admin/menu'
                className='hidden rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper sm:inline-flex'
              >
                菜品管理
              </Link>
              <button
                type='button'
                onClick={() => {
                  if (composerOpen) handleCancelEdit();
                  else setComposerOpen(true);
                }}
                className='inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white shadow-card transition-transform active:scale-95'
              >
                {composerOpen ? (
                  <>
                    <IconClose className='h-4 w-4' /> 收起
                  </>
                ) : (
                  <>
                    <IconPlus className='h-4 w-4' /> 发动态
                  </>
                )}
              </button>
              <div className='hidden sm:block'>
                <AdminLogoutButton />
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className='mx-auto max-w-2xl px-5 py-5'>
        {notice.message ? (
          <div className='mb-4'>
            <InlineNotice
              message={notice.message}
              tone={notice.tone}
              onDismiss={() => setNotice({ message: '', tone: 'info' })}
            />
          </div>
        ) : null}

        {/* 发布/编辑表单 */}
        {isAdmin && composerOpen && (
          <div className='mb-6 rounded-2xl border border-line bg-surface p-5 shadow-card animate-slide-up'>
            <h2 className='font-display text-base font-bold text-ink'>
              {editingId ? '编辑动态' : '发布新动态'}
            </h2>
            {loadingEdit ? (
              <p className='mt-3 text-sm text-ink-soft'>加载中…</p>
            ) : (
              <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ember/50 focus:bg-surface'
                  placeholder='标题'
                  disabled={submitting}
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className='w-full resize-y rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ember/50 focus:bg-surface'
                  placeholder='想说点什么…'
                  rows={4}
                  disabled={submitting}
                />
                <div className='flex items-center gap-3'>
                  <button
                    type='submit'
                    disabled={submitting}
                    className='rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white shadow-card transition-transform active:scale-95 disabled:opacity-50'
                  >
                    {submitting
                      ? editingId
                        ? '保存中…'
                        : '发布中…'
                      : editingId
                        ? '保存修改'
                        : '发布'}
                  </button>
                  {editingId && (
                    <button
                      type='button'
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className='rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper'
                    >
                      取消
                    </button>
                  )}
                  {submitMessage && (
                    <span className='text-xs text-ink-soft'>{submitMessage}</span>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* 动态列表 */}
        {loading ? (
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='rounded-2xl bg-surface p-5 shadow-card'>
                <div className='h-4 w-1/3 animate-pulse rounded bg-paper-deep' />
                <div className='mt-3 h-3 w-full animate-pulse rounded bg-paper-deep' />
                <div className='mt-2 h-3 w-4/5 animate-pulse rounded bg-paper-deep' />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='rounded-2xl bg-surface p-5 text-sm text-ember shadow-card'>
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/50 py-16 text-center'>
            <IconBook className='h-8 w-8 text-ink-faint' />
            <p className='text-sm text-ink-soft'>
              {isAdmin ? '还没有动态，发布第一条吧' : '店家还没有发布动态'}
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {posts.map((post) => (
              <article
                key={post._id}
                className='rounded-2xl border border-line bg-surface p-5 shadow-card'
              >
                <h3 className='font-display text-lg font-bold text-ink'>{post.title}</h3>
                <p className='mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft'>
                  {post.content}
                </p>
                <div className='mt-4 flex items-center justify-between'>
                  <time className='text-xs text-ink-faint'>{formatDate(post.createdAt)}</time>
                  {isAdmin ? (
                    <div className='flex items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => handleEdit(post._id)}
                        disabled={deletingId === post._id || submitting}
                        className='rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper hover:text-ink disabled:opacity-50'
                      >
                        编辑
                      </button>
                      <button
                        type='button'
                        onClick={() => setDeleteTarget(post)}
                        disabled={deletingId === post._id || submitting || editingId === post._id}
                        className='rounded-full px-3 py-1.5 text-xs font-semibold text-ember transition-colors hover:bg-ember-soft disabled:opacity-50'
                      >
                        {deletingId === post._id ? '删除中…' : '删除'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={deleteTarget != null}
        title='删除动态'
        description={deleteTarget ? `确定删除「${deleteTarget.title}」吗？` : ''}
        confirmText='删除'
        danger
        loading={deleteTarget != null && deletingId === deleteTarget._id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
