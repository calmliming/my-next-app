'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { categories, getCategoryName, type MenuItem } from '@/lib/menu';

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
  const [form, setForm] = useState<FormState>(emptyForm);

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
      alert(e instanceof Error ? e.message : '上传失败');
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
    setIsOpen(true);
  };

  const openEdit = (it: MenuItem) => {
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

  const save = async () => {
    if (saving) return;
    const name = form.name.trim();
    const img = form.img.trim();
    const desc = form.desc.trim();
    const price = Number(form.price);
    if (!name) return alert('请输入菜名');
    if (!Number.isFinite(price) || price < 0) return alert('请输入正确的价格');
    if (!form.categoryId) return alert('请选择分类');
    if (!img) return alert('请输入图片地址');
    if (!desc) return alert('请输入描述');

    setSaving(true);
    try {
      const payload = {
        name,
        price,
        categoryId: form.categoryId,
        img,
        desc,
        isActive: form.isActive,
      };
      const res = await fetch(form.id ? `/api/menu/${form.id}` : '/api/menu', {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '保存失败');
      setIsOpen(false);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: MenuItem) => {
    if (!confirm(`确定删除「${it.name}」吗？此操作不可恢复。`)) return;
    try {
      const res = await fetch(`/api/menu/${it.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.msg || '删除失败');
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 pb-24'>
      <header className='bg-white border-b border-gray-200 sticky top-0 z-20'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <div className='text-lg font-extrabold'>菜品管理</div>
            <div className='text-xs text-gray-500'>新增 / 编辑 / 删除菜品（数据来自 MongoDB）</div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <Link
              href='/local/order'
              className='rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white'
            >
              去点菜
            </Link>
            <button
              type='button'
              onClick={openCreate}
              className='rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700'
            >
              新增菜品
            </button>
          </div>
        </div>
      </header>

      <div className='max-w-6xl mx-auto px-4 py-6'>
        <div className='flex flex-col md:flex-row md:items-center gap-3 justify-between'>
          <div className='flex-1'>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='搜索：菜名 / 描述 / 分类'
              className='w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200'
            />
          </div>
          <button
            type='button'
            onClick={load}
            className='rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold hover:bg-gray-50'
          >
            刷新
          </button>
        </div>

        <div className='mt-5'>
          {loading ? (
            <div className='text-sm text-gray-500'>加载中…</div>
          ) : error ? (
            <div className='rounded-2xl bg-white p-4 shadow-sm'>
              <div className='font-bold'>加载失败</div>
              <div className='mt-1 text-sm text-gray-500'>{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className='rounded-2xl bg-white p-6 text-sm text-gray-500 shadow-sm'>
              没有匹配的菜品
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filtered.map((it) => (
                <div
                  key={it.id}
                  className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
                >
                  <div className='relative w-full h-40 bg-gray-200'>
                    <Image
                      src={it.img}
                      alt={it.name}
                      fill
                      sizes='(max-width: 768px) 100vw, 33vw'
                      className='object-cover'
                    />
                    <div className='absolute top-3 left-3'>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-extrabold ${
                          it.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {it.isActive ? '上架' : '下架'}
                      </span>
                    </div>
                  </div>

                  <div className='p-4'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='min-w-0'>
                        <div className='font-extrabold truncate'>{it.name}</div>
                        <div className='mt-0.5 text-xs text-gray-500'>
                          {getCategoryName(it.categoryId)}
                        </div>
                      </div>
                      <div className='shrink-0 font-extrabold text-red-600'>¥{it.price}</div>
                    </div>
                    <div className='mt-2 text-sm text-gray-600 line-clamp-2'>{it.desc}</div>

                    <div className='mt-4 flex items-center justify-between gap-2'>
                      <button
                        type='button'
                        onClick={() => openEdit(it)}
                        className='flex-1 rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white'
                      >
                        编辑
                      </button>
                      <button
                        type='button'
                        onClick={() => remove(it)}
                        className='flex-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100'
                      >
                        删除
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
          className='fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center'
          onClick={() => setIsOpen(false)}
        >
          <div
            className='w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl p-5 pb-24 max-h-[85vh] overflow-y-auto'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between'>
              <div className='text-lg font-extrabold'>{form.id ? '编辑菜品' : '新增菜品'}</div>
              <button
                type='button'
                className='rounded-full bg-gray-100 px-3 py-1.5 text-sm font-bold'
                onClick={() => setIsOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className='mt-4 grid grid-cols-1 gap-3'>
              <label className='text-sm font-bold'>
                菜名
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className='mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200'
                  placeholder='例如：辣椒炒肉'
                />
              </label>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <label className='text-sm font-bold'>
                  价格
                  <input
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                    className='mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200'
                    placeholder='例如：38'
                    inputMode='decimal'
                  />
                </label>

                <label className='text-sm font-bold'>
                  分类
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
                    className='mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 bg-white'
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className='text-sm font-bold'>
                图片
                <div className='mt-1 flex gap-2'>
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/gif,image/webp'
                    className='flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 file:mr-2 file:rounded-full file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-red-600'
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f);
                    }}
                    disabled={uploading}
                  />
                </div>
                <input
                  value={form.img}
                  onChange={(e) => setForm((s) => ({ ...s, img: e.target.value }))}
                  className='mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200'
                  placeholder='或粘贴图片地址'
                />
                {uploading && <span className='text-xs text-gray-500 mt-1 block'>上传中…</span>}
              </label>

              {form.img.trim() ? (
                <div className='relative w-full h-44 rounded-2xl overflow-hidden bg-gray-200 border border-gray-100'>
                  <Image
                    src={form.img.trim()}
                    alt='预览'
                    fill
                    sizes='(max-width: 768px) 100vw, 600px'
                    className='object-cover'
                  />
                </div>
              ) : null}

              <label className='text-sm font-bold'>
                描述
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm((s) => ({ ...s, desc: e.target.value }))}
                  className='mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-200 min-h-24'
                  placeholder='例如：湘菜灵魂，螺丝椒炒土猪肉'
                />
              </label>

              <label className='flex items-center gap-2 text-sm font-bold'>
                <input
                  type='checkbox'
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                上架（可在点菜页展示）
              </label>

              <div className='mt-2 flex gap-2'>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='flex-1 rounded-2xl bg-gray-100 px-4 py-3 text-sm font-extrabold'
                >
                  取消
                </button>
                <button
                  type='button'
                  onClick={save}
                  disabled={saving}
                  className='flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50'
                >
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
