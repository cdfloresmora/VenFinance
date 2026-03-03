// sheets.js — Google Sheets API v4
window.VF = window.VF || {};
VF.Sheets = (() => {
  const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

  async function getSpreadsheetId() {
    return VF.DB.getConfig('spreadsheet_id');
  }

  // ── Read ───────────────────────────────────────────────────

  /**
   * Read a range from a sheet.
   * @param {string} sheetName - Sheet tab name (e.g. 'Gastos')
   * @param {string} [range]   - A1 notation (e.g. 'A2:K'). Omit for entire sheet.
   * @returns {Array[]} Array of row arrays
   */
  async function read(sheetName, range) {
    const token = await VF.Auth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    const ssId = await getSpreadsheetId();
    if (!ssId) throw new Error('No spreadsheet ID configured');

    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    const resp = await fetch(
      `${BASE}/${ssId}/values/${encodeURIComponent(fullRange)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`Sheets read failed (${resp.status}): ${err.error?.message || ''}`);
    }

    const data = await resp.json();
    return data.values || [];
  }

  // ── Append ─────────────────────────────────────────────────

  /**
   * Append a new row to a sheet.
   * @param {string}  sheetName - Sheet tab name
   * @param {Array}   rowArray  - Values for the row
   */
  async function append(sheetName, rowArray) {
    const token = await VF.Auth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    const ssId = await getSpreadsheetId();
    if (!ssId) throw new Error('No spreadsheet ID configured');

    // Correct URL format: .../values/{encodedRange}:append?...
    const range = encodeURIComponent(`${sheetName}!A:A`);
    const resp  = await fetch(
      `${BASE}/${ssId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [rowArray] }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`Sheets append failed (${resp.status}): ${err.error?.message || ''}`);
    }

    return resp.json();
  }

  // ── Update ─────────────────────────────────────────────────

  /**
   * Overwrite a specific range with new values.
   * @param {string}   range  - Full A1 range including sheet name (e.g. 'Gastos!B2')
   * @param {Array[][]} values - 2D array of values
   */
  async function update(range, values) {
    const token = await VF.Auth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    const ssId = await getSpreadsheetId();
    if (!ssId) throw new Error('No spreadsheet ID configured');

    const resp = await fetch(
      `${BASE}/${ssId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method:  'PUT',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`Sheets update failed (${resp.status}): ${err.error?.message || ''}`);
    }

    return resp.json();
  }

  // ── Write headers via batchUpdate ──────────────────────────

  async function writeHeaders(ssId, token) {
    const headerData = [
      {
        range:  'Gastos!A1',
        values: [['Fecha', 'Categoría', 'Descripción', 'Moneda',
                  'Monto Original', 'Monto Bs', 'USD Oficial', 'USD Real',
                  'Tasa Comercio', 'Mi Tasa', 'Timestamp']],
      },
      {
        range:  'Ingresos!A1',
        values: [['Fecha', 'Fuente', 'Descripción', 'Monto USD', 'Monto Bs', 'Tasa BCV']],
      },
      {
        range:  'Tasas!A1',
        values: [['Fecha', 'Tasa BCV', 'Mi Tasa Compra', 'Fuente']],
      },
      {
        range:  'Categorías!A1',
        values: [['ID', 'Nombre', 'Ícono', 'Color']],
      },
      {
        range:  'Config!A1',
        values: [['Clave', 'Valor']],
      },
    ];

    const resp = await fetch(`${BASE}/${ssId}/values:batchUpdate`, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ valueInputOption: 'RAW', data: headerData }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`writeHeaders failed (${resp.status}): ${err.error?.message || ''}`);
    }

    return resp.json();
  }

  // ── Create spreadsheet (first time) ───────────────────────

  async function createSpreadsheet() {
    const token = await VF.Auth.getValidToken();
    if (!token) throw new Error('Not authenticated');

    const resp = await fetch(BASE, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title: 'VenFinance DB' },
        sheets: [
          { properties: { title: 'Gastos'     } },
          { properties: { title: 'Ingresos'   } },
          { properties: { title: 'Tasas'      } },
          { properties: { title: 'Categorías' } },
          { properties: { title: 'Config'     } },
        ],
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`createSpreadsheet failed (${resp.status}): ${err.error?.message || ''}`);
    }

    const sheet = await resp.json();
    const ssId  = sheet.spreadsheetId;

    await writeHeaders(ssId, token);
    await VF.DB.setConfig('spreadsheet_id', ssId);
    return ssId;
  }

  // ── Setup: verify or create ────────────────────────────────

  /**
   * Ensures a VenFinance spreadsheet exists and is accessible.
   * - If a saved spreadsheet_id is found, verifies it's still reachable.
   * - If not found (or no longer accessible), creates a new one.
   * @returns {string|null} spreadsheetId, or null if not authenticated
   */
  async function setup() {
    const token = await VF.Auth.getValidToken();
    if (!token) return null;

    const savedId = await getSpreadsheetId();
    if (savedId) {
      // Quick accessibility check
      const check = await fetch(
        `${BASE}/${savedId}?fields=spreadsheetId`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => ({ ok: false }));

      if (check.ok) return savedId; // existing sheet is fine
    }

    // No valid sheet found — create one
    return createSpreadsheet();
  }

  return { read, append, update, createSpreadsheet, setup };
})();
