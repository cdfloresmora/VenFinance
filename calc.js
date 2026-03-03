// calc.js — Las tres dimensiones de cada gasto
window.VF = window.VF || {};
VF.Calc = (() => {

  /**
   * Calcula las 3 dimensiones de un gasto
   * @param {number} montoOriginal - Lo que pagué (en Bs o USD)
   * @param {string} moneda        - 'Bs' o 'USD'
   * @param {number} tasaComercio  - Tasa BCV/comercio del día (ej: 410)
   * @param {number} tasaMiCompra  - Mi tasa al comprar dólares (ej: 600)
   * @returns {Object} Las 7 métricas calculadas
   */
  function calcularGasto(montoOriginal, moneda, tasaComercio, tasaMiCompra) {
    // Dimensión 1: ¿Cuántos Bs salieron realmente?
    const montoBs = moneda === 'Bs'
      ? montoOriginal
      : montoOriginal * tasaComercio;

    // Dimensión 2: ¿Cuántos USD equivale a tasa oficial?
    const montoUsdOficial = moneda === 'USD'
      ? montoOriginal
      : montoOriginal / tasaComercio;

    // Dimensión 3: ¿Cuántos USD me costó REALMENTE?
    // (considerando que mis Bs los compré a tasaMiCompra)
    const montoUsdReal = montoBs / tasaMiCompra;

    // Ventaja: la diferencia entre lo que "vale" y lo que me costó
    const ventajaBs = (montoUsdOficial * tasaMiCompra) - montoBs;
    const ventajaUsd = montoUsdOficial - montoUsdReal;
    const ventajaPct = montoUsdOficial > 0
      ? (ventajaUsd / montoUsdOficial) * 100
      : 0;

    return {
      monto_bs: Math.round(montoBs * 100) / 100,
      monto_usd_oficial: Math.round(montoUsdOficial * 100) / 100,
      monto_usd_real: Math.round(montoUsdReal * 100) / 100,
      ventaja_bs: Math.round(ventajaBs * 100) / 100,
      ventaja_usd: Math.round(ventajaUsd * 100) / 100,
      ventaja_pct: Math.round(ventajaPct * 10) / 10
    };
  }

  /**
   * Totaliza un array de gastos para el mes
   */
  function totalesMes(gastos) {
    return gastos.reduce((acc, g) => ({
      total_bs: acc.total_bs + g.monto_bs,
      total_usd_oficial: acc.total_usd_oficial + g.monto_usd_oficial,
      total_usd_real: acc.total_usd_real + g.monto_usd_real,
      ventaja_total_usd: acc.ventaja_total_usd + g.ventaja_usd,
    }), { total_bs: 0, total_usd_oficial: 0, total_usd_real: 0, ventaja_total_usd: 0 });
  }

  /**
   * % del presupuesto usado
   */
  function presupuestoUsado(totalUsdOficial, presupuestoMensual) {
    return presupuestoMensual > 0
      ? Math.round((totalUsdOficial / presupuestoMensual) * 1000) / 10
      : 0;
  }

  /**
   * Agrupa gastos por categoría y calcula subtotales
   */
  function porCategoria(gastos) {
    const grupos = {};
    for (const g of gastos) {
      if (!grupos[g.categoria]) {
        grupos[g.categoria] = { gastos: [], total_usd: 0, total_bs: 0 };
      }
      grupos[g.categoria].gastos.push(g);
      grupos[g.categoria].total_usd += g.monto_usd_oficial;
      grupos[g.categoria].total_bs += g.monto_bs;
    }
    return grupos;
  }

  return { calcularGasto, totalesMes, presupuestoUsado, porCategoria };
})();