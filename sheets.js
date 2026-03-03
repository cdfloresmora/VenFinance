// sheets.js — Operaciones contra Google Sheets API v4
window.VF = window.VF || {};
VF.Sheets = (() => {
  const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

  // Obtener spreadsheet ID desde Config local
  function getSpreadsheetId() {
    return VF.DB.getConfig('spreadsheet_id');
  }

  // --- LEER datos de una hoja ---
  async function read(sheetName, range) {
    const token = await VF.Auth.getValidToken();
    const ssId = await getSpreadsheetId();
    const fullRange = range ? `${sheetName}!${range}` : sheetName;

    const resp = await fetch(
      `${BASE}/${ssId}/values/${encodeURIComponent(fullRange)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await resp.json();
    return data.values || [];
    // Retorna array de arrays: [["g_123","2025-03-01","Almuerzo",...], ...]
  }

  // --- ESCRIBIR nueva fila (append) ---
  async function append(sheetName, rowArray) {
    const token = await VF.Auth.getValidToken();
    const ssId = await getSpreadsheetId();

    const resp = await fetch(
      `${BASE}/${ssId}/values/${sheetName}!A:A:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [rowArray]
        })
      }
    );
    return resp.json();
  }

  // --- ACTUALIZAR celda específica ---
  async function update(range, values) {
    const token = await VF.Auth.getValidToken();
    const ssId = await getSpreadsheetId();

    const resp = await fetch(
      `${BASE}/${ssId}/values/${encodeURIComponent(range)}` +
      `?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    );
    return resp.json();
  }

  // --- CREAR el Spreadsheet inicial (primera vez) ---
  async function createSpreadsheet() {
    const token = await VF.Auth.getValidToken();

    const resp = await fetch(BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title: 'VenFinance DB' },
        sheets: [
          { properties: { title: 'Gastos' } },
          { properties: { title: 'Ingresos' } },
          { properties: { title: 'Tasas' } },
          { properties: { title: 'Categorías' } },
          { properties: { title: 'Config' } }
        ]
      })
    });

    const sheet = await resp.json();
    const ssId = sheet.spreadsheetId;

    // Escribir headers en cada hoja
    await writeHeaders(ssId, token);
    // Guardar el ID localmente
    await VF.DB.setConfig('spreadsheet_id', ssId);
    return ssId;
  }

  return { read, append, update, createSpreadsheet };
})();