export type SavedOrderItem = {
  name: string;
  quantity: number;
  subtotal: number;
};

export type SavedOrder = {
  id: string;
  createdAt: string;
  totalCount: number;
  totalPrice: number;
  note: string;
  items: SavedOrderItem[];
};

const ORDER_HISTORY_STORAGE_KEY = 'order_history_v1';
const MAX_SAVED_ORDERS = 20;

function isSavedOrder(value: unknown): value is SavedOrder {
  if (!value || typeof value !== 'object') return false;
  const order = value as Partial<SavedOrder>;
  return (
    typeof order.id === 'string' &&
    typeof order.createdAt === 'string' &&
    typeof order.totalCount === 'number' &&
    typeof order.totalPrice === 'number' &&
    Array.isArray(order.items)
  );
}

function normalizeSavedOrder(order: SavedOrder): SavedOrder {
  return {
    ...order,
    note: typeof order.note === 'string' ? order.note : '',
  };
}

export function loadOrderHistory(): SavedOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ORDER_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedOrder).map(normalizeSavedOrder);
  } catch {
    return [];
  }
}

export function saveOrderHistory(order: SavedOrder) {
  if (typeof window === 'undefined') return;
  const next = [order, ...loadOrderHistory().filter((item) => item.id !== order.id)].slice(
    0,
    MAX_SAVED_ORDERS
  );
  window.localStorage.setItem(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(next));
}

export function clearOrderHistory() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ORDER_HISTORY_STORAGE_KEY);
}
