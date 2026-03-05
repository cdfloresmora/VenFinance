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
      'nav.home': 'Inicio',
      'nav.expenses': 'Gastos',
      'nav.income': 'Ingresos',
      'nav.dashboard': 'Resumen',
      'nav.rates': 'Tasas',
      'menu.preferences': 'Preferencias',
      'menu.account': 'Configuración de cuenta',
      'menu.logout': 'Cerrar sesión',
      'settings.title': 'Configuración',
      'settings.font': 'Fuente',
      'settings.language': 'Idioma',
      'settings.darkmode': 'Modo Claro',
      'font.sans': 'Sans',
      'font.serif': 'Serif',
      'font.mono': 'Mono',
      'lang.es': 'Español',
      'lang.en': 'English',
      'greeting.welcome': 'Bienvenido de vuelta',
      'budget.title': 'Presupuesto mensual',
      'budget.desc': 'Tu límite de gastos en USD por mes',
      'prefs.save': 'Guardar Preferencias',
      'prefs.budget': 'Presupuesto',
      'prefs.currency': 'Moneda por defecto',
      'prefs.primaryCurrency': 'Moneda principal',
      'prefs.currencyDesc': 'Para registrar gastos e ingresos',
      'account.title': 'Configuración de cuenta',
      'account.profile': 'Perfil',
      'account.name': 'Nombre',
      'account.email': 'Correo electrónico',
      'account.type': 'Tipo de cuenta',
      'account.notifications': 'Notificaciones',
      'account.rateAlert': 'Alerta de tasas',
      'account.rateAlertDesc': 'Recuerda actualizar tasas diariamente',
      'account.save': 'Guardar',
      'recent.title': 'Recientes',
      'recent.seeAll': 'Ver todos',
      'allExpenses.title': 'Todos los gastos',
      'allExpenses.noExpenses': 'No hay gastos en este periodo',
      'recurring.title': 'Gastos recurrentes',
      'recurring.add': 'Agregar',
      'recurring.monthly': 'Mensual',
      'recurring.name': 'Nombre',
      'recurring.amount': 'Monto USD',
      'recurring.category': 'Categoria',
      'recurring.noItems': 'No hay gastos recurrentes',
      'recurring.total': 'Total mensual',
      'budget.available': 'Disponible este mes',
      'budget.spent': 'Gastado',
      'budget.total': 'Total',
      'budget.setGoal': 'Establecer meta',
      'budget.goal': 'Meta mensual',
      'budget.goalDesc': 'Limite de gastos en USD por mes',
      'prefs.notifications': 'Notificaciones',
      'prefs.notifDesc': 'Alertas de gastos y recordatorios',
      'prefs.numberFormat': 'Formato numerico',
      'prefs.numberFormatDesc': 'Como se muestran los montos'
    },
    en: {
      'nav.home': 'Home',
      'nav.expenses': 'Expenses',
      'nav.income': 'Income',
      'nav.dashboard': 'Summary',
      'nav.rates': 'Rates',
      'menu.preferences': 'Preferences',
      'menu.account': 'Account Settings',
      'menu.logout': 'Log Out',
      'settings.title': 'Settings',
      'settings.font': 'Font',
      'settings.language': 'Language',
      'settings.darkmode': 'Light Mode',
      'font.sans': 'Sans',
      'font.serif': 'Serif',
      'font.mono': 'Mono',
      'lang.es': 'Español',
      'lang.en': 'English',
      'greeting.welcome': 'Welcome back',
      'budget.title': 'Monthly budget',
      'budget.desc': 'Your monthly spending limit in USD',
      'prefs.save': 'Save Preferences',
      'prefs.budget': 'Budget',
      'prefs.currency': 'Default currency',
      'prefs.primaryCurrency': 'Primary currency',
      'prefs.currencyDesc': 'For recording expenses and income',
      'account.title': 'Account Settings',
      'account.profile': 'Profile',
      'account.name': 'Name',
      'account.email': 'Email',
      'account.type': 'Account type',
      'account.notifications': 'Notifications',
      'account.rateAlert': 'Rate alert',
      'account.rateAlertDesc': 'Reminder to update rates daily',
      'account.save': 'Save',
      'recent.title': 'Recent',
      'recent.seeAll': 'See all',
      'allExpenses.title': 'All expenses',
      'allExpenses.noExpenses': 'No expenses in this period',
      'recurring.title': 'Recurring expenses',
      'recurring.add': 'Add',
      'recurring.monthly': 'Monthly',
      'recurring.name': 'Name',
      'recurring.amount': 'Amount USD',
      'recurring.category': 'Category',
      'recurring.noItems': 'No recurring expenses',
      'recurring.total': 'Monthly total',
      'budget.available': 'Available this month',
      'budget.spent': 'Spent',
      'budget.total': 'Total',
      'budget.setGoal': 'Set goal',
      'budget.goal': 'Monthly goal',
      'budget.goalDesc': 'Monthly spending limit in USD',
      'prefs.notifications': 'Notifications',
      'prefs.notifDesc': 'Spending alerts and reminders',
      'prefs.numberFormat': 'Number format',
      'prefs.numberFormatDesc': 'How amounts are displayed'
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

    var sel = document.getElementById('vf-lang-select');
    if (sel) sel.value = lang;
  }

  /* ── Translate helper (for JS use) ─────────────────────────── */
  function t(key) {
    var lang = get(KEYS.lang) || DEFAULTS.lang;
    return (T[lang] && T[lang][key]) || key;
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
    init: init
  };
})();
