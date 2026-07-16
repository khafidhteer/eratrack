const App = (() => {
  const views = ['welcome', 'profile', 'metrics', 'input', 'results'];

  function init() {
    initTheme();
    initLangToggle();
    initActions();
    initFormSubmissions();
    initShareButtons();
    MethodologyView.init();
    LookupEngine.ensureLoaded();
    showView('welcome');
  }

  function initTheme() {
    const saved = localStorage.getItem('eratrack_theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeToggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('eratrack_theme', next);
    });
  }

  function initLangToggle() {
    document.getElementById('langToggle').addEventListener('click', () => {
      const current = I18N.getCurrentLang();
      const next = current === 'en' ? 'id' : 'en';
      I18N.switchLanguage(next);
    });
  }

  function initActions() {
    document.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const action = el.dataset.action;
        switch (action) {
          case 'go-welcome': showView('welcome'); break;
          case 'go-profile': showView('profile'); break;
          case 'go-metrics': showView('metrics'); break;
          case 'go-input': showView('input'); break;
          case 'show-methodology': MethodologyView.show(); break;
          case 'download-image': handleDownloadImage(); break;
          default: break;
        }
      });
    });
  }

  function initFormSubmissions() {
    document.getElementById('profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ProfileView.validate()) return;
      const data = ProfileView.getFormData();
      AppState.updateProfile(data);
      showView('metrics');
    });

    document.getElementById('inputForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!InputView.validate()) return;
      const rawParams = InputView.getMeasurements();
      AppState.set('rawParams', rawParams);
      const selected = AppState.get('selectedMetrics') || [];
      showView('results');
      ResultsView.render(selected, rawParams);
    });

    document.getElementById('metricsContinue').addEventListener('click', () => {
      const selected = MetricsView.getSelected();
      if (selected.length === 0) return;
      AppState.set('selectedMetrics', selected);
      showView('input');
    });
  }

  function initShareButtons() {
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const type = btn.dataset.share;
        const results = AppState.get('results');
        const profile = AppState.get('profile');
        if (!results || !results.metrics) return;

        let text = I18N.t('share.text', { title: results.title || '' });
        let dataUrl = '';

        if (type === 'whatsapp') {
          ShareModule.shareToWhatsApp(text);
        } else if (type === 'facebook') {
          ShareModule.shareToFacebook(text);
        } else if (type === 'instagram') {
          ShareModule.shareToInstagram(text);
        } else if (type === 'more') {
          dataUrl = ShareModule.generateBadgeImage(results, profile);
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'eratrack-milestone.png', { type: 'image/png' });
          const shared = await ShareModule.webShare({ title: 'EraTrack', text, files: [file] });
          if (!shared) {
            ShareModule.webShare({ title: 'EraTrack', text });
          }
        }
      });
    });
  }

  function handleDownloadImage() {
    const results = AppState.get('results');
    const profile = AppState.get('profile');
    if (!results) return;
    const dataUrl = ShareModule.generateBadgeImage(results, profile);
    ShareModule.downloadImage(dataUrl);
  }

  function showView(viewId) {
    document.querySelectorAll('.view, .section--centered').forEach(el => {
      el.classList.remove('view--active');
    });
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('view--active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (viewId === 'profile') ProfileView.init();
    if (viewId === 'metrics') MetricsView.init();
    if (viewId === 'input') InputView.init();
  }

  document.addEventListener('DOMContentLoaded', init);
  return { showView };
})();
