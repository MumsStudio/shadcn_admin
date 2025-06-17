import { HocuspocusProvider } from '@hocuspocus/provider';

const providerCache = new Map<string, {
  provider: HocuspocusProvider;
  refCount: number;
  lastUsed: number;
}>();

const MAX_IDLE_TIME = 10 * 60 * 1000; // 10分钟

// 定期清理空闲连接
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of providerCache.entries()) {
    if (entry.refCount === 0 && now - entry.lastUsed > MAX_IDLE_TIME) {
      entry.provider.destroy();
      providerCache.delete(id);
    }
  }
}, 30 * 1000); // 每30秒检查一次

export function getOrCreateProvider(id: string, email: string): HocuspocusProvider {
  if (providerCache.has(id)) {
    const entry = providerCache.get(id)!;
    entry.refCount++;
    entry.lastUsed = Date.now();
    return entry.provider;
  }

  const provider = new HocuspocusProvider({
    url: import.meta.env.VITE_WEBSOCKET_URL,
    name: id,
  });

  providerCache.set(id, {
    provider,
    refCount: 1,
    lastUsed: Date.now()
  });

  return provider;
}

export function releaseProvider(id: string): void {
  if (providerCache.has(id)) {
    const entry = providerCache.get(id)!;
    entry.refCount--;
    entry.lastUsed = Date.now();

    if (entry.refCount <= 0) {
      // 不立即销毁，等待空闲超时
    }
  }
}