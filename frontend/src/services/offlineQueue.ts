export interface PendingAction {
  id: string;
  type: 'TRANSACTION' | 'DIARIO_PHOTO';
  payload: any;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = 'erp_obras_offline_queue';

export const offlineQueue = {
  getQueue(): PendingAction[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  add(type: 'TRANSACTION' | 'DIARIO_PHOTO', payload: any) {
    const queue = this.getQueue();
    const item: PendingAction = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      payload,
      createdAt: new Date().toISOString()
    };
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return item;
  },

  remove(id: string) {
    const queue = this.getQueue().filter((item) => item.id !== id);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  },

  clear() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  count(): number {
    return this.getQueue().length;
  }
};
