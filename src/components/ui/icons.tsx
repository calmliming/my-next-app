/** 轻量线性图标集 —— 替代 emoji，统一描边风格 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconBowl(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M3 11h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z' />
      <path d='M12 11V8.5a2.5 2.5 0 0 1 2.5-2.5' />
      <path d='M9 11V9a2 2 0 0 1 2-2' />
      <path d='M6 19l1 2h10l1-2' />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M4 5.5A1.5 1.5 0 0 1 5.5 4H18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2V5.5Z' />
      <path d='M4 18.5A1.5 1.5 0 0 1 5.5 17H19' />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx='12' cy='8' r='3.5' />
      <path d='M5 20a7 7 0 0 1 14 0' />
    </svg>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M5 3v18l2-1.2L9 21l2-1.2L13 21l2-1.2L17 21l2-1.2V3l-2 1.2L15 3l-2 1.2L11 3 9 4.2 7 3 5 4.2Z' />
      <path d='M8 8h8M8 12h8M8 16h5' />
    </svg>
  );
}

export function IconNote(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M6 3.5h9.5L19 7v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z' />
      <path d='M15 3.5V7h4' />
      <path d='M8 11h8M8 15h8M8 18h5' />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M12 5v14M5 12h14' />
    </svg>
  );
}

export function IconMinus(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M5 12h14' />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M6 6l12 12M18 6 6 18' />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx='11' cy='11' r='7' />
      <path d='m20 20-3.2-3.2' />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='m9 6 6 6-6 6' />
    </svg>
  );
}

export function IconChili(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M6 14c0 3 2.5 5 5.5 5 4 0 6.5-3 6.5-7 0-3-2-5-4-5-1.6 0-2.5 1-2.5 2.2 0 1.5 1.5 2 1.5 3.3' />
      <path d='M12 7c.5-1.6 1.8-2.8 3.4-3' />
    </svg>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M12 3c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z' />
    </svg>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d='M3 7.5A1.5 1.5 0 0 1 4.5 6H18a1 1 0 0 1 1 1v1H5.5A1.5 1.5 0 0 0 4 9.5' />
      <path d='M3 8v9a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3' />
      <path d='M21 11v4h-4a2 2 0 0 1 0-4h4Z' />
    </svg>
  );
}
