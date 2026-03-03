// db.js — IndexedDB para datos offline
window.VF = window.VF || {};
VF.DB = (() => {
  const DB_NAME = 'VenFinanceDB';
  const DB_VERSION = 1;
  let db = null;

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        // Almacenes
        db.createObjectStore('tokens', { keyPath: 'id' });
        db.createObjectStore('config', { keyPath: 'clave' });
        db.createObjectStore('gastos', { keyPath: 'id' });
        db.createObjectStore('ingresos', { keyPath: 'id' });
        db.createObjectStore('tasas', { keyPath: 'fecha' });
        db.createObjectStore('categorias', { keyPath: 'id' });
        // Cola de operaciones pendientes de sync
        db.createObjectStore('pendingQueue', {
          keyPath: 'queueId',
          autoIncrement: true
        });
      };

      req.onsuccess = (e) => { db = e.target.result; resolve(db); };
      req.onerror = (e) => reject(e);
    });
  }

  // Operaciones genéricas
  async function put(store, data) {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(data);
    return tx.complete;
  }

  async function getAll(store) {
    return new Promise((resolve) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
    });
  }

  // Cola offline: agregar operación pendiente
  async function queueOperation(operation) {
    // operation = { type: 'append', sheet: 'Gastos', data: [...] }
    await put('pendingQueue', {
      ...operation,
      timestamp: Date.now(),
      status: 'pending'
    });
    // Registrar sync en el Service Worker
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-pending');
    }
  }

  return { open, put, getAll, queueOperation, /* + saveTokens, getTokens, etc. */ };
})();