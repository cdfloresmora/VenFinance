// db.js — IndexedDB para datos offline
window.VF = window.VF || {};
VF.DB = (() => {
  const DB_NAME    = 'VenFinanceDB';
  const DB_VERSION = 1;
  let db = null;

  // ── Open / upgrade ─────────────────────────────────────────
  function open() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        const stores = {
          tokens:       { keyPath: 'id' },
          config:       { keyPath: 'clave' },
          gastos:       { keyPath: 'id' },
          ingresos:     { keyPath: 'id' },
          tasas:        { keyPath: 'fecha' },
          categorias:   { keyPath: 'id' },
          pendingQueue: { keyPath: 'queueId', autoIncrement: true },
        };
        for (const [name, opts] of Object.entries(stores)) {
          if (!database.objectStoreNames.contains(name)) {
            database.createObjectStore(name, opts);
          }
        }
      };

      req.onsuccess = (e) => { db = e.target.result; resolve(db); };
      req.onerror   = (e) => reject(e.target.error);
    });
  }

  async function ensureOpen() {
    if (!db) await open();
  }

  // ── Generic CRUD ───────────────────────────────────────────

  /** Upsert a single record */
  async function put(store, data) {
    await ensureOpen();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
      tx.onerror    = () => reject(tx.error);
    });
  }

  /** Get a single record by primary key */
  async function get(store, key) {
    await ensureOpen();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => reject(req.error);
    });
  }

  /** Get all records in a store */
  async function getAll(store) {
    await ensureOpen();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  // ── Token storage ──────────────────────────────────────────

  /** Save OAuth tokens to IndexedDB (standardized storage — no localStorage) */
  async function saveTokens(data) {
    if (!data) return;
    return put('tokens', { id: 'current', ...data });
  }

  /** Retrieve stored OAuth tokens, or null if none */
  async function getTokens() {
    return get('tokens', 'current');
  }

  // ── Config storage ─────────────────────────────────────────

  /** Persist a key→value config entry */
  async function setConfig(key, value) {
    return put('config', { clave: key, valor: value });
  }

  /** Retrieve a config value by key, or null */
  async function getConfig(key) {
    const record = await get('config', key);
    return record ? record.valor : null;
  }

  // ── Offline operation queue ────────────────────────────────

  /**
   * Queue an operation for deferred sync.
   * operation = { type: 'append'|'update', sheet, data, ... }
   */
  async function queueOperation(operation) {
    await put('pendingQueue', {
      ...operation,
      timestamp: Date.now(),
      status:    'pending',
    });
    // Ask the Service Worker to trigger a background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register('sync-pending');
      } catch (_) { /* Background Sync not supported — will retry on next online event */ }
    }
  }

  return { open, put, get, getAll, saveTokens, getTokens, setConfig, getConfig, queueOperation };
})();
