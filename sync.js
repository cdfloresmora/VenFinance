// sync.js — Reconcilia IndexedDB ↔ Google Sheets
window.VF = window.VF || {};
VF.Sync = (() => {

  // Ejecutar todas las operaciones pendientes
  async function processPending() {
    const queue = await VF.DB.getAll('pendingQueue');
    const pending = queue.filter(op => op.status === 'pending');

    for (const op of pending) {
      try {
        if (op.type === 'append') {
          await VF.Sheets.append(op.sheet, op.data);
        } else if (op.type === 'update') {
          await VF.Sheets.update(op.range, op.values);
        }
        // Marcar como completada
        op.status = 'done';
        await VF.DB.put('pendingQueue', op);
      } catch (err) {
        // Si falla (sin red), se reintentará en el próximo sync
        console.warn('Sync falló para op:', op.queueId, err);
        break; // Mantener orden
      }
    }
  }

  // Descargar datos frescos de Sheets → IndexedDB
  async function pullFromSheets() {
    const sheets = ['Gastos', 'Ingresos', 'Tasas', 'Categorías', 'Config'];
    for (const name of sheets) {
      const rows = await VF.Sheets.read(name);
      // Parsear headers + filas → objetos → guardar en IndexedDB
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });
      // Guardar cada registro
      for (const record of data) {
        await VF.DB.put(name.toLowerCase(), record);
      }
    }
  }

  // Escuchar mensaje del Service Worker
  navigator.serviceWorker?.addEventListener('message', (e) => {
    if (e.data.type === 'SYNC_NOW') processPending();
  });

  return { processPending, pullFromSheets };
})();