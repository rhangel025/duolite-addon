// Cache simples em memória com expiração (TTL em segundos)

const store = new Map();

function set(key, value, ttlSeconds) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  store.set(key, { value, expiresAt });
}

function get(key) {
  const item = store.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    store.delete(key);
    return null;
  }

  return item.value;
}

function del(key) {
  store.delete(key);
}

function clear() {
  store.clear();
}

module.exports = { set, get, del, clear };
