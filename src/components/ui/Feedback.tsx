'use client';

import { IconClose } from '@/components/ui/icons';

export type NoticeTone = 'success' | 'error' | 'info';

type InlineNoticeProps = {
  message: string;
  tone?: NoticeTone;
  onDismiss?: () => void;
};

export function InlineNotice({
  message,
  tone = 'info',
  onDismiss,
}: InlineNoticeProps) {
  if (!message) return null;

  const toneClass =
    tone === 'success'
      ? 'border-leaf/20 bg-leaf-soft text-leaf'
      : tone === 'error'
        ? 'border-ember/20 bg-ember-soft text-ember'
        : 'border-gold/25 bg-gold-soft text-gold';

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${toneClass}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <span>{message}</span>
      {onDismiss ? (
        <button
          type='button'
          onClick={onDismiss}
          className='-mr-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full opacity-70 transition hover:bg-black/5 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
          aria-label='关闭提示'
        >
          <IconClose className='h-3.5 w-3.5' />
        </button>
      ) : null}
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-ink/45 px-4 animate-fade-in'
      role='dialog'
      aria-modal='true'
      aria-labelledby='confirm-dialog-title'
      aria-describedby='confirm-dialog-description'
      onClick={loading ? undefined : onCancel}
    >
      <div
        className='w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-float animate-pop-in'
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id='confirm-dialog-title' className='font-display text-lg font-bold text-ink'>
          {title}
        </h2>
        <p id='confirm-dialog-description' className='mt-2 text-sm leading-relaxed text-ink-soft'>
          {description}
        </p>
        <div className='mt-5 flex justify-end gap-2'>
          <button
            type='button'
            onClick={onCancel}
            disabled={loading}
            className='rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-paper disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-full px-4 py-2 text-sm font-bold text-white shadow-card transition active:scale-[0.98] disabled:opacity-50 ${
              danger ? 'bg-ember' : 'bg-ink'
            }`}
          >
            {loading ? '处理中…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
