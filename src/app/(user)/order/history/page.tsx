import { redirect } from 'next/navigation';

/** 点菜记录已迁至管理后台 */
export default function OrderHistoryRedirectPage() {
  redirect('/order');
}
