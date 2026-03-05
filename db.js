// db.js — Firestore wrapper for VenFinance (cloud-synced, offline-capable)
window.VF = window.VF || {};
VF.DB = (() => {

  /** Reference to current user's Firestore document */
  function userRef() {
    const user = firebaseAuth.currentUser;
    if (!user) throw new Error('No authenticated user');
    return firestore.collection('users').doc(user.uid);
  }

  // ── Config ──────────────────────────────────────────────────

  async function setConfig(key, value) {
    await userRef().collection('config').doc(key).set({ valor: value });
  }

  async function getConfig(key) {
    const doc = await userRef().collection('config').doc(key).get();
    return doc.exists ? doc.data().valor : null;
  }

  // ── Expenses (gastos) ───────────────────────────────────────

  async function putExpense(expense) {
    await userRef().collection('gastos').doc(String(expense.id)).set(expense);
  }

  async function getExpenses() {
    const snap = await userRef().collection('gastos')
      .orderBy('id', 'desc').get();
    return snap.docs.map(d => d.data());
  }

  async function deleteExpense(id) {
    await userRef().collection('gastos').doc(String(id)).delete();
  }

  // ── Income (ingresos) ──────────────────────────────────────

  async function putIncome(income) {
    await userRef().collection('ingresos').doc(String(income.id)).set(income);
  }

  async function getIncomes() {
    const snap = await userRef().collection('ingresos')
      .orderBy('id', 'desc').get();
    return snap.docs.map(d => d.data());
  }

  async function deleteIncome(id) {
    await userRef().collection('ingresos').doc(String(id)).delete();
  }

  // ── Budgets (presupuestos mensuales) ───────────────────────

  async function setBudget(yearMonth, budgetUSD) {
    await userRef().collection('presupuestos').doc(yearMonth).set({
      month:     yearMonth,
      budgetUSD: budgetUSD,
      updatedAt: Date.now()
    }, { merge: true });
  }

  async function getBudget(yearMonth) {
    const doc = await userRef().collection('presupuestos').doc(yearMonth).get();
    return doc.exists ? doc.data() : null;
  }

  async function getAllBudgets() {
    const snap = await userRef().collection('presupuestos')
      .orderBy('month', 'desc').get();
    return snap.docs.map(d => d.data());
  }

  // ── Cambios (currency exchanges) ───────────────────────────

  async function putCambio(cambio) {
    await userRef().collection('cambios').doc(String(cambio.id)).set(cambio);
  }

  async function getCambios() {
    const snap = await userRef().collection('cambios')
      .orderBy('id', 'desc').get();
    return snap.docs.map(d => d.data());
  }

  async function deleteCambio(id) {
    await userRef().collection('cambios').doc(String(id)).delete();
  }

  // ── Rates (tasas) ──────────────────────────────────────────

  async function putRate(rate) {
    await userRef().collection('tasas').doc(rate.fecha).set(rate, { merge: true });
  }

  async function getRates() {
    const snap = await userRef().collection('tasas')
      .orderBy('fecha', 'asc').get();
    return snap.docs.map(d => d.data());
  }

  // ── User Profile ───────────────────────────────────────────

  async function saveProfile(data) {
    await userRef().set(data, { merge: true });
  }

  async function getProfile() {
    const doc = await userRef().get();
    return doc.exists ? doc.data() : null;
  }

  // ── Recurring expenses (subscriptions) ─────────────────────

  async function putRecurring(item) {
    await userRef().collection('recurring').doc(String(item.id)).set(item);
  }

  async function getRecurring() {
    const snap = await userRef().collection('recurring')
      .orderBy('id', 'desc').get();
    return snap.docs.map(d => d.data());
  }

  async function deleteRecurring(id) {
    await userRef().collection('recurring').doc(String(id)).delete();
  }

  // ── Legacy compat (no-op for old code) ─────────────────────

  function open()       { return Promise.resolve(); }
  function saveTokens() { return Promise.resolve(); }
  function getTokens()  { return Promise.resolve(null); }

  return {
    setConfig, getConfig,
    putExpense, getExpenses, deleteExpense,
    putIncome, getIncomes, deleteIncome,
    putCambio, getCambios, deleteCambio,
    setBudget, getBudget, getAllBudgets,
    putRecurring, getRecurring, deleteRecurring,
    putRate, getRates,
    saveProfile, getProfile,
    open, saveTokens, getTokens,
  };
})();
