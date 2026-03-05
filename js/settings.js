/* ═══════════════════════════════════════════════════════════════
   VenFinance — Settings & Preferences Manager
   Handles font, theme (dark/light), and language persistence
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEYS = {
    font: 'vf_font',
    theme: 'vf_theme',
    lang: 'vf_lang'
  };

  var DEFAULTS = {
    font: 'sans',
    theme: 'dark',
    lang: 'es'
  };

  /* ── Helpers ────────────────────────────────────────────────── */
  function get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function set(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* noop */ }
  }

  /* ── Apply font class ──────────────────────────────────────── */
  function applyFont(font) {
    var html = document.documentElement;
    html.classList.remove('font-sans', 'font-serif', 'font-mono');
    html.classList.add('font-' + font);
    set(KEYS.font, font);

    var sel = document.getElementById('vf-font-select');
    if (sel) sel.value = font;
  }

  /* ── Apply theme ───────────────────────────────────────────── */
  function applyTheme(theme) {
    var html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('theme-light');
    } else {
      html.classList.remove('theme-light');
    }
    set(KEYS.theme, theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#F5F5F7' : '#080810');
    }

    var toggle = document.getElementById('vf-theme-toggle');
    if (toggle) {
      toggle.classList.toggle('active', theme === 'light');
    }
  }

  /* ── Translations ──────────────────────────────────────────── */
  var T = {
    es: {
      /* ── Navigation ── */
      'nav.home': 'Inicio',
      'nav.expenses': 'Gastos',
      'nav.income': 'Ingresos',
      'nav.dashboard': 'Resumen',
      'nav.rates': 'Tasas',

      /* ── User Menu ── */
      'menu.preferences': 'Preferencias',
      'menu.account': 'Configuración de cuenta',
      'menu.logout': 'Cerrar sesión',

      /* ── Settings ── */
      'settings.title': 'Configuración',
      'settings.font': 'Fuente',
      'settings.language': 'Idioma',
      'settings.darkmode': 'Modo Claro',

      /* ── Font options ── */
      'font.sans': 'Sans',
      'font.serif': 'Serif',
      'font.mono': 'Mono',

      /* ── Language options ── */
      'lang.es': 'Español',
      'lang.en': 'English',

      /* ── Greetings ── */
      'greeting.welcome': 'Bienvenido de vuelta',
      'greeting.morning': 'Buenos días',
      'greeting.afternoon': 'Buenas tardes',
      'greeting.evening': 'Buenas noches',
      'greeting.hello': 'Hola',

      /* ── Preferences Modal ── */
      'prefs.title': 'Preferencias',
      'prefs.save': 'Guardar Preferencias',
      'prefs.budget': 'Presupuesto',
      'prefs.budgetLabel': 'Presupuesto mensual',
      'prefs.budgetDesc': 'Tu límite de gastos en USD por mes',
      'prefs.currencySection': 'Moneda por defecto',
      'prefs.currency': 'Moneda por defecto',
      'prefs.primaryCurrency': 'Moneda principal',
      'prefs.currencyDesc': 'Para registrar gastos e inversiones',
      'prefs.notifications': 'Notificaciones',
      'prefs.notifDesc': 'Alertas de gastos y recordatorios',
      'prefs.numberFormat': 'Formato numérico',
      'prefs.numberFormatDesc': 'Como se muestran los montos',

      /* ── Account Modal ── */
      'account.title': 'Configuración de cuenta',
      'account.profile': 'Perfil',
      'account.name': 'Nombre',
      'account.email': 'Correo electrónico',
      'account.type': 'Tipo de cuenta',
      'account.typeGoogle': 'Google Sign-In',
      'account.typeEmail': 'Correo y contraseña',
      'account.notifications': 'Notificaciones',
      'account.rateAlert': 'Alerta de tasas',
      'account.rateAlertDesc': 'Recuerda actualizar tasas diariamente',
      'account.save': 'Guardar',
      'account.updated': 'Cuenta actualizada',

      /* ── Budget Card ── */
      'budget.available': 'Disponible este mes',
      'budget.spent': 'Gastado',
      'budget.total': 'Total',
      'budget.setGoal': 'Establecer meta',
      'budget.goal': 'Meta mensual',
      'budget.goalDesc': 'Límite de gastos en USD por mes',
      'budget.title': 'Presupuesto mensual',
      'budget.desc': 'Tu límite de gastos en USD por mes',
      'budget.advantage': 'Poder adquisitivo real',
      'budget.aboveBcv': 'superior al BCV',

      /* ── Rate Chips ── */
      'chip.parallel': 'Paralelo',
      'chip.bcv': 'BCV',
      'chip.saldoBs': 'Saldo Bs',

      /* ── Expense Form ── */
      'form.registerExpense': 'Registrar gasto',
      'form.registerInvestment': 'Registrar inversión',
      'form.expense': 'Gasto',
      'form.investment': 'Inversión',
      'form.category': 'Categoría',
      'form.investType': 'Tipo de inversión',
      'form.description': 'Descripción',
      'form.date': 'Fecha',
      'form.optional': 'Opcional...',
      'form.submitExpense': 'Registrar Gasto',
      'form.submitInvestment': 'Registrar Inversión',
      'form.rateLabel': 'Tasa al comprar',
      'form.rateCustom': 'Otra',
      'form.ratePlaceholder': 'Tasa personalizada (Bs/$)',
      'form.rateCustomLabel': 'Personalizada',

      /* ── Conversion Strip ── */
      'conv.bcvRate': 'A tasa BCV',
      'conv.yourRate': 'A tu tasa',
      'conv.diff': 'Diferencia',

      /* ── Saldo Comparison ── */
      'saldo.balance': 'Saldo',
      'saldo.remaining': 'Quedan',
      'saldo.ofBalance': 'del saldo',

      /* ── Transactions ── */
      'recent.title': 'Recientes',
      'recent.seeAll': 'Ver todos',
      'recent.empty': 'Aún no hay movimientos registrados.',
      'recent.emptyHint': '¡Añade el primero arriba!',

      /* ── All Expenses ── */
      'allExpenses.title': 'Todos los gastos',
      'allExpenses.noExpenses': 'No hay gastos en este periodo',

      /* ── Recurring Expenses ── */
      'recurring.title': 'Gastos recurrentes',
      'recurring.add': 'Agregar',
      'recurring.monthly': 'Mensual',
      'recurring.name': 'Nombre',
      'recurring.amount': 'Monto USD',
      'recurring.category': 'Categoría',
      'recurring.noItems': 'No hay gastos recurrentes',
      'recurring.total': 'Total mensual',
      'recurring.formTitle': 'Gasto recurrente',
      'recurring.cancel': 'Cancelar',
      'recurring.save': 'Guardar',

      /* ── Categories ── */
      'cat.food': 'Comida',
      'cat.transport': 'Transporte',
      'cat.market': 'Mercado',
      'cat.health': 'Salud',
      'cat.home': 'Hogar',
      'cat.personal': 'Personal',
      'cat.tech': 'Tech',
      'cat.entertain': 'Ocio',
      'cat.clothes': 'Ropa',
      'cat.other': 'Otro',

      /* ── Investment Types ── */
      'inv.crypto': 'Crypto',
      'inv.stocks': 'Acciones',
      'inv.savings': 'Ahorro',
      'inv.business': 'Negocio',
      'inv.realestate': 'Inmueble',
      'inv.education': 'Educación',
      'inv.forex': 'Divisas',
      'inv.other_inv': 'Otro',

      /* ── Income Sources ── */
      'src.salary': 'Salario',
      'src.freelance': 'Freelance',
      'src.sale': 'Venta',
      'src.transfer': 'Transferencia',
      'src.investment': 'Inversión',
      'src.gift': 'Regalo',
      'src.refund': 'Reembolso',
      'src.other': 'Otro',

      /* ── Recurring Category Options ── */
      'rcat.entertain': 'Ocio',
      'rcat.tech': 'Tech',
      'rcat.health': 'Salud',
      'rcat.home': 'Hogar',
      'rcat.personal': 'Personal',
      'rcat.food': 'Comida',
      'rcat.transport': 'Transporte',
      'rcat.other': 'Otro',

      /* ── Toast Messages ── */
      'toast.expenseSaved': 'Gasto guardado',
      'toast.investmentSaved': 'Inversión registrada',
      'toast.saveError': 'Error al guardar',
      'toast.invalidAmount': 'Ingresa un monto válido',
      'toast.selectDate': 'Selecciona una fecha',
      'toast.selectCategory': 'Selecciona una categoría',
      'toast.selectInvType': 'Selecciona un tipo de inversión',
      'toast.configRates': 'Configura las tasas primero',
      'toast.invalidRate': 'Ingresa una tasa válida',
      'toast.prefsSaved': 'Preferencias guardadas',
      'toast.incomeSaved': 'Ingreso registrado',
      'toast.selectSource': 'Selecciona una fuente',
      'toast.deleted': 'Eliminado',
      'toast.goalUpdated': 'Meta actualizada',
      'toast.recurringSaved': 'Gasto recurrente guardado',

      /* ── Income Page ── */
      'income.title': 'Ingresos',
      'income.thisMonth': 'Ingresos este mes',
      'income.register': 'Registrar ingreso',
      'income.source': 'Fuente',
      'income.submit': 'Registrar Ingreso',
      'income.recent': 'Ingresos recientes',
      'income.empty': 'Aún no hay ingresos registrados.',

      /* ── Dashboard ── */
      'dash.welcome': 'Bienvenido de vuelta',
      'dash.hello': 'Hola',
      'dash.monthBalance': 'Balance del mes',
      'dash.daysLeft': 'días restantes',
      'dash.incomeMinusExp': 'Ingresos menos gastos este mes',
      'dash.income': 'Ingresos',
      'dash.expenses': 'Gastos',
      'dash.net': 'Neto',
      'dash.monthBudget': 'Presupuesto del mes',
      'dash.saldoBs': 'Saldo en Bolívares',
      'dash.balanceAvailable': 'Balance disponible',
      'dash.registerCambio': 'Registra una compra de dólares en la sección Tasas para ver tu balance',
      'dash.fromUsd': 'De ${amount} USD comprados · saldo neto',
      'dash.avgRate': 'Tasa prom.',
      'dash.noData': 'Sin datos',
      'dash.atYourAvgRate': 'A tu tasa promedio',
      'dash.atBcvRate': 'A tasa BCV',
      'dash.diffBcvVsYours': 'Diferencia BCV vs tu tasa',
      'dash.noDiff': 'Sin diferencia',
      'dash.rateOfDay': 'Tasa del día',
      'dash.exchangeRates': 'Tasas de cambio',
      'dash.noRateData': 'sin datos',
      'dash.bcvRate': 'Tasa BCV',
      'dash.myRate': 'Mi tasa real',
      'dash.exchangeAdvantage': 'Ventaja cambiaria',
      'dash.configRates': 'Configura tus tasas para ver la ventaja',
      'dash.your1usd': 'Tu $1 vale',
      'dash.atBcv': 'a tasa BCV',
      'dash.diffPerDollar': 'por dólar',
      'dash.monthlySummary': 'Resumen mensual',
      'dash.financialFlow': 'Flujo financiero',
      'dash.movements': 'movimientos',
      'dash.totalIncome': 'Total Ingresos',
      'dash.monthEntries': 'Entradas del mes',
      'dash.totalExpenses': 'Total Gastos',
      'dash.monthExits': 'Salidas del mes',
      'dash.investments': 'Inversiones',
      'dash.capitalInvested': 'Capital invertido',
      'dash.netBalance': 'Balance neto',
      'dash.incomeMinusExpShort': 'Ingresos - Gastos',
      'dash.thisMonth': 'este mes',
      'dash.expByCategory': 'Gastos por categoría',
      'dash.dailyVsBudget': 'Gasto diario vs presupuesto',
      'dash.spent': 'Gastado',
      'dash.ideal': 'Ideal',

      /* ── Rates Page ── */
      'rates.title': 'Tasas',
      'rates.noRatesAlert': 'Aún no has registrado las tasas de hoy. Usa el formulario de abajo para actualizar.',
      'rates.yourBalance': 'Tu balance actual',
      'rates.bolivares': 'Bolívares',
      'rates.realValueBcv': 'Valor real (BCV)',
      'rates.noCambios': 'Sin cambios registrados',
      'rates.equivBcv': 'Equivalente a tasa BCV',
      'rates.todayRates': 'Tasas del día',
      'rates.bcvOfficial': 'BCV Oficial',
      'rates.yourRate': 'Tu tasa',
      'rates.eurOfficial': 'EUR Oficial',
      'rates.noData': 'sin datos',
      'rates.loading': 'Cargando...',
      'rates.unavailable': 'No disponible',
      'rates.registerPurchase': 'Registrar compra de dólares',
      'rates.purchaseDesc': 'Registra cuántos dólares compraste, a qué tasa, y el sistema calculará tu saldo en bolívares automáticamente.',
      'rates.bcvAuto': 'Tasa BCV (automática)',
      'rates.querying': 'Consultando...',
      'rates.dollarsBought': 'Dólares que compraste',
      'rates.yourBuyRate': 'Tu tasa de compra (Bs/$)',
      'rates.youReceive': 'Recibes',
      'rates.realValueBcvLabel': 'Valor real (BCV)',
      'rates.registerBtn': 'Registrar Compra',
      'rates.purchaseHistory': 'Historial de compras',
      'rates.noPurchases': 'Aún no has registrado compras de dólares.',
      'rates.rateEvolution': 'Evolución de tasas',
      'rates.bcvVsYours': 'BCV vs Tu tasa',
      'rates.rateHistory': 'Historial de tasas',
      'rates.record': 'Registro',
      'rates.records': 'registros',
      'rates.noRecords': 'Sin registros',
      'rates.all': 'Todo',
      'rates.moreBsThanBcv': 'más que a tasa BCV',
      'rates.lessBsThanBcv': 'menos que a tasa BCV',
      'rates.enterDollars': 'Ingresa los dólares que compraste',
      'rates.enterRate': 'Ingresa tu tasa de compra',
      'rates.purchaseRegistered': 'Compra registrada',
      'rates.at': 'a',
      'rates.cambioTitle': 'Compra',
      'rates.cambioRate': 'Tasa',

      /* ── Login Page ── */
      'login.subtitle': 'Controla tus finanzas con tasas de cambio en tiempo real',
      'login.subtitleRegister': 'Crea tu cuenta para comenzar a controlar tus finanzas',
      'login.google': 'Continuar con Google',
      'login.or': 'o',
      'login.name': 'Nombre',
      'login.namePlaceholder': 'Tu nombre',
      'login.email': 'Correo electrónico',
      'login.emailPlaceholder': 'tu@correo.com',
      'login.password': 'Contraseña',
      'login.passwordPlaceholder': 'Tu contraseña',
      'login.confirmPassword': 'Confirmar contraseña',
      'login.confirmPlaceholder': 'Repite tu contraseña',
      'login.submit': 'Iniciar Sesión',
      'login.submitRegister': 'Crear Cuenta',
      'login.noAccount': '¿No tienes cuenta?',
      'login.createAccount': 'Crear cuenta',
      'login.hasAccount': '¿Ya tienes cuenta?',
      'login.signIn': 'Iniciar sesión',
      'login.footer': 'Tus datos se sincronizan de forma segura en la nube',
      'login.verifying': 'Verificando sesión...',
      'login.googleSuccess': 'Conectado con Google. Redirigiendo...',
      'login.accountCreated': 'Cuenta creada. Redirigiendo...',
      'login.welcomeBack': 'Bienvenido de vuelta. Redirigiendo...',
      'login.fillFields': 'Completa todos los campos',
      'login.enterName': 'Ingresa tu nombre',
      'login.weakPassword': 'La contraseña debe tener al menos 6 caracteres',
      'login.passwordMismatch': 'Las contraseñas no coinciden',

      /* ── Firebase Errors ── */
      'err.userNotFound': 'No existe una cuenta con este correo',
      'err.wrongPassword': 'Contraseña incorrecta',
      'err.invalidCredential': 'Credenciales incorrectas',
      'err.emailInUse': 'Ya existe una cuenta con este correo',
      'err.weakPassword': 'La contraseña debe tener al menos 6 caracteres',
      'err.invalidEmail': 'Correo electrónico inválido',
      'err.tooManyRequests': 'Demasiados intentos. Intenta más tarde',
      'err.popupClosed': 'Ventana de Google cerrada',
      'err.cancelled': 'Solicitud cancelada',
      'err.network': 'Error de conexión. Verifica tu internet',
      'err.default': 'Error inesperado. Intenta de nuevo.',

      /* ── Months ── */
      'month.short.0': 'Ene', 'month.short.1': 'Feb', 'month.short.2': 'Mar',
      'month.short.3': 'Abr', 'month.short.4': 'May', 'month.short.5': 'Jun',
      'month.short.6': 'Jul', 'month.short.7': 'Ago', 'month.short.8': 'Sep',
      'month.short.9': 'Oct', 'month.short.10': 'Nov', 'month.short.11': 'Dic',
      'month.long.0': 'Enero', 'month.long.1': 'Febrero', 'month.long.2': 'Marzo',
      'month.long.3': 'Abril', 'month.long.4': 'Mayo', 'month.long.5': 'Junio',
      'month.long.6': 'Julio', 'month.long.7': 'Agosto', 'month.long.8': 'Septiembre',
      'month.long.9': 'Octubre', 'month.long.10': 'Noviembre', 'month.long.11': 'Diciembre',

      /* ── Misc ── */
      'misc.user': 'Usuario',
      'misc.days': 'días',
    },
    en: {
      /* ── Navigation ── */
      'nav.home': 'Home',
      'nav.expenses': 'Expenses',
      'nav.income': 'Income',
      'nav.dashboard': 'Summary',
      'nav.rates': 'Rates',

      /* ── User Menu ── */
      'menu.preferences': 'Preferences',
      'menu.account': 'Account Settings',
      'menu.logout': 'Log Out',

      /* ── Settings ── */
      'settings.title': 'Settings',
      'settings.font': 'Font',
      'settings.language': 'Language',
      'settings.darkmode': 'Light Mode',

      /* ── Font options ── */
      'font.sans': 'Sans',
      'font.serif': 'Serif',
      'font.mono': 'Mono',

      /* ── Language options ── */
      'lang.es': 'Español',
      'lang.en': 'English',

      /* ── Greetings ── */
      'greeting.welcome': 'Welcome back',
      'greeting.morning': 'Good morning',
      'greeting.afternoon': 'Good afternoon',
      'greeting.evening': 'Good evening',
      'greeting.hello': 'Hello',

      /* ── Preferences Modal ── */
      'prefs.title': 'Preferences',
      'prefs.save': 'Save Preferences',
      'prefs.budget': 'Budget',
      'prefs.budgetLabel': 'Monthly budget',
      'prefs.budgetDesc': 'Your monthly spending limit in USD',
      'prefs.currencySection': 'Default currency',
      'prefs.currency': 'Default currency',
      'prefs.primaryCurrency': 'Primary currency',
      'prefs.currencyDesc': 'For recording expenses and investments',
      'prefs.notifications': 'Notifications',
      'prefs.notifDesc': 'Spending alerts and reminders',
      'prefs.numberFormat': 'Number format',
      'prefs.numberFormatDesc': 'How amounts are displayed',

      /* ── Account Modal ── */
      'account.title': 'Account Settings',
      'account.profile': 'Profile',
      'account.name': 'Name',
      'account.email': 'Email',
      'account.type': 'Account type',
      'account.typeGoogle': 'Google Sign-In',
      'account.typeEmail': 'Email and password',
      'account.notifications': 'Notifications',
      'account.rateAlert': 'Rate alert',
      'account.rateAlertDesc': 'Reminder to update rates daily',
      'account.save': 'Save',
      'account.updated': 'Account updated',

      /* ── Budget Card ── */
      'budget.available': 'Available this month',
      'budget.spent': 'Spent',
      'budget.total': 'Total',
      'budget.setGoal': 'Set goal',
      'budget.goal': 'Monthly goal',
      'budget.goalDesc': 'Monthly spending limit in USD',
      'budget.title': 'Monthly budget',
      'budget.desc': 'Your monthly spending limit in USD',
      'budget.advantage': 'Real purchasing power',
      'budget.aboveBcv': 'above BCV',

      /* ── Rate Chips ── */
      'chip.parallel': 'Parallel',
      'chip.bcv': 'BCV',
      'chip.saldoBs': 'Bs Balance',

      /* ── Expense Form ── */
      'form.registerExpense': 'Record expense',
      'form.registerInvestment': 'Record investment',
      'form.expense': 'Expense',
      'form.investment': 'Investment',
      'form.category': 'Category',
      'form.investType': 'Investment type',
      'form.description': 'Description',
      'form.date': 'Date',
      'form.optional': 'Optional...',
      'form.submitExpense': 'Record Expense',
      'form.submitInvestment': 'Record Investment',
      'form.rateLabel': 'Rate at purchase',
      'form.rateCustom': 'Other',
      'form.ratePlaceholder': 'Custom rate (Bs/$)',
      'form.rateCustomLabel': 'Custom',

      /* ── Conversion Strip ── */
      'conv.bcvRate': 'At BCV rate',
      'conv.yourRate': 'At your rate',
      'conv.diff': 'Difference',

      /* ── Saldo Comparison ── */
      'saldo.balance': 'Balance',
      'saldo.remaining': 'Remaining',
      'saldo.ofBalance': 'of balance',

      /* ── Transactions ── */
      'recent.title': 'Recent',
      'recent.seeAll': 'See all',
      'recent.empty': 'No transactions yet.',
      'recent.emptyHint': 'Add your first one above!',

      /* ── All Expenses ── */
      'allExpenses.title': 'All expenses',
      'allExpenses.noExpenses': 'No expenses in this period',

      /* ── Recurring Expenses ── */
      'recurring.title': 'Recurring expenses',
      'recurring.add': 'Add',
      'recurring.monthly': 'Monthly',
      'recurring.name': 'Name',
      'recurring.amount': 'Amount USD',
      'recurring.category': 'Category',
      'recurring.noItems': 'No recurring expenses',
      'recurring.total': 'Monthly total',
      'recurring.formTitle': 'Recurring expense',
      'recurring.cancel': 'Cancel',
      'recurring.save': 'Save',

      /* ── Categories ── */
      'cat.food': 'Food',
      'cat.transport': 'Transport',
      'cat.market': 'Groceries',
      'cat.health': 'Health',
      'cat.home': 'Home',
      'cat.personal': 'Personal',
      'cat.tech': 'Tech',
      'cat.entertain': 'Leisure',
      'cat.clothes': 'Clothes',
      'cat.other': 'Other',

      /* ── Investment Types ── */
      'inv.crypto': 'Crypto',
      'inv.stocks': 'Stocks',
      'inv.savings': 'Savings',
      'inv.business': 'Business',
      'inv.realestate': 'Real Estate',
      'inv.education': 'Education',
      'inv.forex': 'Forex',
      'inv.other_inv': 'Other',

      /* ── Income Sources ── */
      'src.salary': 'Salary',
      'src.freelance': 'Freelance',
      'src.sale': 'Sale',
      'src.transfer': 'Transfer',
      'src.investment': 'Investment',
      'src.gift': 'Gift',
      'src.refund': 'Refund',
      'src.other': 'Other',

      /* ── Recurring Category Options ── */
      'rcat.entertain': 'Leisure',
      'rcat.tech': 'Tech',
      'rcat.health': 'Health',
      'rcat.home': 'Home',
      'rcat.personal': 'Personal',
      'rcat.food': 'Food',
      'rcat.transport': 'Transport',
      'rcat.other': 'Other',

      /* ── Toast Messages ── */
      'toast.expenseSaved': 'Expense saved',
      'toast.investmentSaved': 'Investment recorded',
      'toast.saveError': 'Error saving',
      'toast.invalidAmount': 'Enter a valid amount',
      'toast.selectDate': 'Select a date',
      'toast.selectCategory': 'Select a category',
      'toast.selectInvType': 'Select an investment type',
      'toast.configRates': 'Configure rates first',
      'toast.invalidRate': 'Enter a valid rate',
      'toast.prefsSaved': 'Preferences saved',
      'toast.incomeSaved': 'Income recorded',
      'toast.selectSource': 'Select a source',
      'toast.deleted': 'Deleted',
      'toast.goalUpdated': 'Goal updated',
      'toast.recurringSaved': 'Recurring expense saved',

      /* ── Income Page ── */
      'income.title': 'Income',
      'income.thisMonth': 'Income this month',
      'income.register': 'Record income',
      'income.source': 'Source',
      'income.submit': 'Record Income',
      'income.recent': 'Recent income',
      'income.empty': 'No income recorded yet.',

      /* ── Dashboard ── */
      'dash.welcome': 'Welcome back',
      'dash.hello': 'Hello',
      'dash.monthBalance': 'Monthly balance',
      'dash.daysLeft': 'days left',
      'dash.incomeMinusExp': 'Income minus expenses this month',
      'dash.income': 'Income',
      'dash.expenses': 'Expenses',
      'dash.net': 'Net',
      'dash.monthBudget': 'Monthly budget',
      'dash.saldoBs': 'Bolivar Balance',
      'dash.balanceAvailable': 'Available balance',
      'dash.registerCambio': 'Register a dollar purchase in the Rates section to see your balance',
      'dash.fromUsd': 'From $${amount} USD purchased · net balance',
      'dash.avgRate': 'Avg. rate',
      'dash.noData': 'No data',
      'dash.atYourAvgRate': 'At your average rate',
      'dash.atBcvRate': 'At BCV rate',
      'dash.diffBcvVsYours': 'BCV vs your rate difference',
      'dash.noDiff': 'No difference',
      'dash.rateOfDay': 'Rate of the day',
      'dash.exchangeRates': 'Exchange rates',
      'dash.noRateData': 'no data',
      'dash.bcvRate': 'BCV Rate',
      'dash.myRate': 'My actual rate',
      'dash.exchangeAdvantage': 'Exchange advantage',
      'dash.configRates': 'Configure your rates to see the advantage',
      'dash.your1usd': 'Your $1 is worth',
      'dash.atBcv': 'at BCV rate',
      'dash.diffPerDollar': 'per dollar',
      'dash.monthlySummary': 'Monthly summary',
      'dash.financialFlow': 'Financial flow',
      'dash.movements': 'transactions',
      'dash.totalIncome': 'Total Income',
      'dash.monthEntries': 'Month entries',
      'dash.totalExpenses': 'Total Expenses',
      'dash.monthExits': 'Month exits',
      'dash.investments': 'Investments',
      'dash.capitalInvested': 'Capital invested',
      'dash.netBalance': 'Net balance',
      'dash.incomeMinusExpShort': 'Income - Expenses',
      'dash.thisMonth': 'this month',
      'dash.expByCategory': 'Expenses by category',
      'dash.dailyVsBudget': 'Daily spending vs budget',
      'dash.spent': 'Spent',
      'dash.ideal': 'Ideal',

      /* ── Rates Page ── */
      'rates.title': 'Rates',
      'rates.noRatesAlert': 'You haven\'t recorded today\'s rates yet. Use the form below to update.',
      'rates.yourBalance': 'Your current balance',
      'rates.bolivares': 'Bolivares',
      'rates.realValueBcv': 'Real value (BCV)',
      'rates.noCambios': 'No exchanges recorded',
      'rates.equivBcv': 'Equivalent at BCV rate',
      'rates.todayRates': 'Today\'s rates',
      'rates.bcvOfficial': 'BCV Official',
      'rates.yourRate': 'Your rate',
      'rates.eurOfficial': 'EUR Official',
      'rates.noData': 'no data',
      'rates.loading': 'Loading...',
      'rates.unavailable': 'Unavailable',
      'rates.registerPurchase': 'Register dollar purchase',
      'rates.purchaseDesc': 'Record how many dollars you bought, at what rate, and the system will calculate your bolivar balance automatically.',
      'rates.bcvAuto': 'BCV Rate (automatic)',
      'rates.querying': 'Querying...',
      'rates.dollarsBought': 'Dollars you bought',
      'rates.yourBuyRate': 'Your buy rate (Bs/$)',
      'rates.youReceive': 'You receive',
      'rates.realValueBcvLabel': 'Real value (BCV)',
      'rates.registerBtn': 'Register Purchase',
      'rates.purchaseHistory': 'Purchase history',
      'rates.noPurchases': 'No dollar purchases recorded yet.',
      'rates.rateEvolution': 'Rate evolution',
      'rates.bcvVsYours': 'BCV vs Your rate',
      'rates.rateHistory': 'Rate history',
      'rates.record': 'Record',
      'rates.records': 'records',
      'rates.noRecords': 'No records',
      'rates.all': 'All',
      'rates.moreBsThanBcv': 'more than BCV rate',
      'rates.lessBsThanBcv': 'less than BCV rate',
      'rates.enterDollars': 'Enter the dollars you bought',
      'rates.enterRate': 'Enter your buy rate',
      'rates.purchaseRegistered': 'Purchase registered',
      'rates.at': 'at',
      'rates.cambioTitle': 'Purchase',
      'rates.cambioRate': 'Rate',

      /* ── Login Page ── */
      'login.subtitle': 'Control your finances with real-time exchange rates',
      'login.subtitleRegister': 'Create your account to start managing your finances',
      'login.google': 'Continue with Google',
      'login.or': 'or',
      'login.name': 'Name',
      'login.namePlaceholder': 'Your name',
      'login.email': 'Email address',
      'login.emailPlaceholder': 'you@email.com',
      'login.password': 'Password',
      'login.passwordPlaceholder': 'Your password',
      'login.confirmPassword': 'Confirm password',
      'login.confirmPlaceholder': 'Repeat your password',
      'login.submit': 'Sign In',
      'login.submitRegister': 'Create Account',
      'login.noAccount': 'Don\'t have an account?',
      'login.createAccount': 'Create account',
      'login.hasAccount': 'Already have an account?',
      'login.signIn': 'Sign in',
      'login.footer': 'Your data syncs securely in the cloud',
      'login.verifying': 'Verifying session...',
      'login.googleSuccess': 'Connected with Google. Redirecting...',
      'login.accountCreated': 'Account created. Redirecting...',
      'login.welcomeBack': 'Welcome back. Redirecting...',
      'login.fillFields': 'Fill in all fields',
      'login.enterName': 'Enter your name',
      'login.weakPassword': 'Password must be at least 6 characters',
      'login.passwordMismatch': 'Passwords do not match',

      /* ── Firebase Errors ── */
      'err.userNotFound': 'No account found with this email',
      'err.wrongPassword': 'Incorrect password',
      'err.invalidCredential': 'Invalid credentials',
      'err.emailInUse': 'An account with this email already exists',
      'err.weakPassword': 'Password must be at least 6 characters',
      'err.invalidEmail': 'Invalid email address',
      'err.tooManyRequests': 'Too many attempts. Try again later',
      'err.popupClosed': 'Google window was closed',
      'err.cancelled': 'Request cancelled',
      'err.network': 'Connection error. Check your internet',
      'err.default': 'Unexpected error. Try again.',

      /* ── Months ── */
      'month.short.0': 'Jan', 'month.short.1': 'Feb', 'month.short.2': 'Mar',
      'month.short.3': 'Apr', 'month.short.4': 'May', 'month.short.5': 'Jun',
      'month.short.6': 'Jul', 'month.short.7': 'Aug', 'month.short.8': 'Sep',
      'month.short.9': 'Oct', 'month.short.10': 'Nov', 'month.short.11': 'Dec',
      'month.long.0': 'January', 'month.long.1': 'February', 'month.long.2': 'March',
      'month.long.3': 'April', 'month.long.4': 'May', 'month.long.5': 'June',
      'month.long.6': 'July', 'month.long.7': 'August', 'month.long.8': 'September',
      'month.long.9': 'October', 'month.long.10': 'November', 'month.long.11': 'December',

      /* ── Misc ── */
      'misc.user': 'User',
      'misc.days': 'days',
    }
  };

  function applyLang(lang) {
    if (!T[lang]) lang = 'es';
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    set(KEYS.lang, lang);

    var dict = T[lang];
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (dict[key]) {
        els[i].textContent = dict[key];
      }
    }

    // Also translate placeholder attributes
    var placeholderEls = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < placeholderEls.length; j++) {
      var pKey = placeholderEls[j].getAttribute('data-i18n-placeholder');
      if (dict[pKey]) {
        placeholderEls[j].setAttribute('placeholder', dict[pKey]);
      }
    }

    var sel = document.getElementById('vf-lang-select');
    if (sel) sel.value = lang;

    // Fire custom event so pages can re-render dynamic content
    document.dispatchEvent(new CustomEvent('vf-lang-changed', { detail: { lang: lang } }));
  }

  /* ── Translate helper (for JS use) ─────────────────────────── */
  function t(key) {
    var lang = get(KEYS.lang) || DEFAULTS.lang;
    return (T[lang] && T[lang][key]) || key;
  }

  /* ── Get current language ──────────────────────────────────── */
  function getLang() {
    return get(KEYS.lang) || DEFAULTS.lang;
  }

  /* ── Init on page load ─────────────────────────────────────── */
  function init() {
    var font  = get(KEYS.font)  || DEFAULTS.font;
    var theme = get(KEYS.theme) || DEFAULTS.theme;
    var lang  = get(KEYS.lang)  || DEFAULTS.lang;

    applyFont(font);
    applyTheme(theme);
    applyLang(lang);
  }

  /* Apply immediately (before DOM ready) for font/theme to avoid flash */
  (function earlyApply() {
    var font  = get(KEYS.font)  || DEFAULTS.font;
    var theme = get(KEYS.theme) || DEFAULTS.theme;
    var html  = document.documentElement;
    html.classList.add('font-' + font);
    if (theme === 'light') html.classList.add('theme-light');
  })();

  /* Full init when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── Event handlers for settings controls ──────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var fontSelect = document.getElementById('vf-font-select');
    if (fontSelect) {
      fontSelect.addEventListener('change', function () {
        applyFont(this.value);
      });
    }

    var langSelect = document.getElementById('vf-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', function () {
        applyLang(this.value);
      });
    }

    var themeToggle = document.getElementById('vf-theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        var current = get(KEYS.theme) || DEFAULTS.theme;
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });

  /* ── Public API ─────────────────────────────────────────────── */
  window.VFSettings = {
    applyFont: applyFont,
    applyTheme: applyTheme,
    applyLang: applyLang,
    t: t,
    getLang: getLang,
    init: init
  };
})();
