'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import { categories, getCategoryName, type MenuItem } from '@/lib/menu';
import { IconClose, IconPlus, IconSearch } from '@/components/ui/icons';
import {
  ConfirmDialog,
  InlineNotice,
  type NoticeTone,
} from '@/components/ui/Feedback';

type FormState = {
  id?: string;
  name: string;
  price: string;
  categoryId: string;
  img: string;
  desc: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: '',
  price: '',
  categoryId: categories[0]?.id ?? 'stirfry',
  img: '',
  desc: '',
  isActive: true,
};

export default function AdminMenuPageClient() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [notice, setNotice] = useState<{ message: string; tone: NoticeTone }>({
    message: '',
    tone: 'info',
  });

  const showNotice = (message: string, tone: NoticeTone = 'info') => {
    setNotice({ message, tone });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '上传失败');
      const url = json?.data?.url;
      if (url) setForm((s) => ({ ...s, img: url }));
    } catch (e) {
      showNotice(e instanceof Error ? e.message : '上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.name} ${it.desc} ${getCategoryName(it.categoryId)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/menu?includeInactive=1', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '加载失败');
      setItems((json?.data ?? []) as MenuItem[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setNotice({ message: '', tone: 'info' });
    setIsOpen(true);
  };

  const openEdit = (it: MenuItem) => {
    setNotice({ message: '', tone: 'info' });
    setForm({
      id: it.id,
      name: it.name,
      price: String(it.price),
      categoryId: it.categoryId,
      img: it.img,
      desc: it.desc,
      isActive: it.isActive,
    });
    setIsOpen(true);
  };

  const submit = async () => {
    const name = form.name.trim();
    const price = Number(form.price);
    const categoryId = form.categoryId.trim();
    const img = form.img.trim();
    const desc = form.desc.trim();
    if (!name || !categoryId || !img || !desc) {
      showNotice('请填写完整：菜名、分类、图片、描述', 'error');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      showNotice('请填写合法价格', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { name, price, categoryId, img, desc, isActive: form.isActive };
      const res = form.id
        ? await fetch(`/api/menu/${encodeURIComponent(form.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '保存失败');
      setIsOpen(false);
      showNotice(form.id ? '菜品已保存' : '菜品已新增', 'success');
      await load();
    } catch (e) {
      showNotice(e instanceof Error ? e.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const requestRemove = (it: MenuItem) => {
    if (!it.id || it.id.trim() === '') {
      showNotice('菜品ID无效，无法删除', 'error');
      return;
    }
    setDeleteTarget(it);
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const url = `/api/menu/${encodeURIComponent(deleteTarget.id)}`;
      const res = await fetch(url, { method: 'DELETE' });
      let json: { msg?: string } = {};
      try {
        json = await res.json();
      } catch {
        // 响应不是 JSON 时
      }
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('菜品不存在或已被删除，请刷新列表后再试');
        }
        throw new Error(json?.msg || `删除失败 (${res.status})`);
      }
      await load();
      showNotice(`已删除「${deleteTarget.name}」`, 'success');
      setDeleteTarget(null);
    } catch (e) {
      showNotice(e instanceof Error ? e.message : '删除失败', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const fieldCls =
    'w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-ember/50 focus:bg-surface';

  return (
    <div className='min-h-screen bg-paper pb-24 text-ink'>
      <header className='sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4'>
          <div className='min-w-0'>
            <h1 className='font-display text-xl font-bold'>菜品管理</h1>
            <p className='text-xs text-ink-soft'>新增 / 编辑 / 上下架（数据来自 MongoDB）</p>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Link
              href='/admin/orders'
              className='rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-paper'
            >
              点菜记录
            </Link>
            <Link
              href='/admin/posts'
              className='rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-paper'
            >
              店家动态
            </Link>
            <Link
              href='/order'
              className='rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-paper'
            >
              去点菜
            </Link>
            <button
              type='button'
              onClick={openCreate}
              className='inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-sm font-bold text-white shadow-card transition-transform active:scale-95'
            >
              <IconPlus className='h-4 w-4' /> 新增
            </button>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className='mx-auto max-w-6xl px-4 py-6'>
        <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
          <div className='relative flex-1'>
            <IconSearch className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='搜索：菜名 / 描述 / 分类'
              className='w-full rounded-full border border-line bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-ember/50'
            />
          </div>
          <button
            type='button'
            onClick={load}
            className='rounded-full border border-line-strong bg-surface px-5 py-3 text-sm font-semibold hover:bg-paper'
          >
            刷新
          </button>
        </div>

        <div className='mt-5'>
          {notice.message ? (
            <div className='mb-4'>
              <InlineNotice
                message={notice.message}
                tone={notice.tone}
                onDismiss={() => setNotice({ message: '', tone: 'info' })}
              />
            </div>
          ) : null}

          {loading ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='overflow-hidden rounded-2xl bg-surface shadow-card'>
                  <div className='h-40 w-full animate-pulse bg-paper-deep' />
                  <div className='space-y-2 p-4'>
                    <div className='h-4 w-1/2 animate-pulse rounded bg-paper-deep' />
                    <div className='h-3 w-full animate-pulse rounded bg-paper-deep' />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className='rounded-2xl bg-surface p-5 shadow-card'>
              <div className='font-bold'>加载失败</div>
              <div className='mt-1 text-sm text-ink-soft'>{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className='rounded-2xl bg-surface p-8 text-center text-sm text-ink-faint shadow-card'>
              没有匹配的菜品
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filtered.map((it) => (
                <div
                  key={it.id}
                  className='overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-shadow hover:shadow-float'
                >
                  <div className='relative h-40 w-full bg-paper-deep'>
                    <Image
                      src={it.img}
                      alt={it.name}
                      fill
                      sizes='(max-width: 768px) 100vw, 33vw'
                      className='object-cover'
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${
                        it.isActive
                          ? 'bg-leaf-soft text-leaf'
                          : 'bg-paper-deep text-ink-soft'
                      }`}
                    >
                      {it.isActive ? '上架中' : '已下架'}
                    </span>
                  </div>

                  <div className='p-4'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0'>
                        <div className='truncate font-bold text-ink'>{it.name}</div>
                        <div className='mt-0.5 text-xs text-ink-soft'>
                          {getCategoryName(it.categoryId)}
                        </div>
                      </div>
                      <div className='tnum shrink-0 text-lg font-bold text-ember'>
                        ¥{it.price}
                      </div>
                    </div>
                    <div className='mt-2 line-clamp-2 text-sm text-ink-soft'>{it.desc}</div>

                    <div className='mt-4 flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => openEdit(it)}
                        className='flex-1 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-paper transition-opacity hover:opacity-90'
                      >
                        编辑
                      </button>
                      <button
                        type='button'
                        onClick={() => requestRemove(it)}
                        disabled={deletingId === it.id}
                        className='flex-1 rounded-xl bg-ember-soft px-3 py-2 text-sm font-semibold text-ember hover:bg-ember/10 disabled:opacity-50'
                      >
                        {deletingId === it.id ? '删除中…' : '删除'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 弹窗：新增/编辑 */}
      {isOpen ? (
        <div
          className='fixed inset-0 z-50 flex items-end justify-center bg-ink/40 animate-fade-in md:items-center'
          onClick={() => setIsOpen(false)}
        >
          <div
            className='max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 pb-24 shadow-float animate-slide-up md:max-w-xl md:rounded-3xl md:pb-6'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between'>
              <h2 className='font-display text-lg font-bold'>
                {form.id ? '编辑菜品' : '新增菜品'}
              </h2>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper'
                aria-label='关闭'
              >
                <IconClose className='h-5 w-5' />
              </button>
            </div>

            <div className='mt-5 space-y-3'>
              <div>
                <label className='mb-1 block text-sm font-semibold text-ink'>菜名</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className={fieldCls}
                  placeholder='如：辣椒炒肉'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-ink'>价格（元）</label>
                  <input
                    type='number'
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-semibold text-ink'>分类</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
                    className={fieldCls}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className='mb-1 block text-sm font-semibold text-ink'>图片</label>
                <input
                  value={form.img}
                  onChange={(e) => setForm((s) => ({ ...s, img: e.target.value }))}
                  className={fieldCls}
                  placeholder='https://… 或下方上传'
                />
                <div className='mt-2'>
                  <label className='inline-flex cursor-pointer items-center rounded-full border border-line-strong bg-paper px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-paper-deep'>
                    {uploading ? '上传中…' : '选择图片上传'}
                    <input
                      type='file'
                      accept='image/*'
                      className='hidden'
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadImage(f);
                      }}
                    />
                  </label>
                </div>
                {form.img ? (
                  <div className='relative mt-3 h-36 w-full overflow-hidden rounded-xl bg-paper-deep'>
                    <Image src={form.img} alt='预览' fill className='object-cover' />
                  </div>
                ) : null}
              </div>
              <div>
                <label className='mb-1 block text-sm font-semibold text-ink'>描述</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm((s) => ({ ...s, desc: e.target.value }))}
                  className={`${fieldCls} min-h-24 resize-y`}
                  placeholder='简短介绍'
                />
              </div>
              <label className='flex items-center gap-2.5 rounded-xl bg-paper px-4 py-3'>
                <input
                  type='checkbox'
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                  className='h-4 w-4 accent-ember'
                />
                <span className='text-sm font-semibold text-ink'>上架（在点菜页展示）</span>
              </label>
            </div>

            <div className='mt-6 flex gap-3'>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='flex-1 rounded-full border border-line-strong px-4 py-3 text-sm font-semibold text-ink-soft hover:bg-paper'
              >
                取消
              </button>
              <button
                type='button'
                onClick={submit}
                disabled={saving}
                className='flex-1 rounded-full bg-ember px-4 py-3 text-sm font-bold text-white shadow-card transition-transform active:scale-[0.98] disabled:opacity-50'
              >
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={deleteTarget != null}
        title='删除菜品'
        description={
          deleteTarget
            ? `确定删除「${deleteTarget.name}」吗？此操作不可恢复。`
            : ''
        }
        confirmText='删除'
        danger
        loading={deleteTarget != null && deletingId === deleteTarget.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
