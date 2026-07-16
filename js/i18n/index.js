const I18N = (() => {
  let currentLang = 'en';
  let translations = {};

  const cache = {};

  async function loadLanguage(lang) {
    if (cache[lang]) {
      translations = cache[lang];
      return;
    }
    try {
      const res = await fetch(`js/i18n/${lang}.json`);
      translations = await res.json();
      cache[lang] = translations;
    } catch {
      translations = cache['en'] || {};
    }
  }

  function t(key, data) {
    const parts = key.split('.');
    let val = translations;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        return key;
      }
    }
    if (typeof val !== 'string') return key;
    if (data) {
      for (const [k, v] of Object.entries(data)) {
        val = val.replace(`{${k}}`, v);
      }
    }
    return val;
  }

  function updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', t(key));
    });
    document.documentElement.lang = currentLang === 'id' ? 'id' : 'en';
    const toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.querySelector('.lang-toggle__current').textContent = currentLang.toUpperCase();
      toggle.querySelector('.lang-toggle__other').textContent = currentLang === 'en' ? 'ID' : 'EN';
    }
    document.dispatchEvent(new CustomEvent('i18n-changed', { detail: { lang: currentLang } }));
  }

  async function switchLanguage(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    await loadLanguage(lang);
    updateDOM();
    localStorage.setItem('eratrack_lang', lang);
  }

  async function detectLanguage() {
    const saved = localStorage.getItem('eratrack_lang');
    if (saved) {
      currentLang = saved;
      await loadLanguage(saved);
      updateDOM();
      return;
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal, mode: 'cors' });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        currentLang = data.country === 'ID' ? 'id' : 'en';
      }
    } catch {
      currentLang = 'en';
    }
    await loadLanguage(currentLang);
    updateDOM();
  }

  function getCurrentLang() { return currentLang; }

  detectLanguage();

  return { t, switchLanguage, getCurrentLang, updateDOM };
})();
