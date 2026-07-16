const MetricsView = (() => {
  function init() {
    renderMetrics();
  }

  function renderMetrics() {
    const profile = AppState.get('profile');
    const ageMonths = Utils.getAgeInMonths(profile.dob);
    const category = AgeEngine.getCategory(ageMonths, profile.sex, profile.gestationalWeeks, profile.useCorrectedAge);
    const metrics = AgeEngine.getMetricsForCategory(category.id);

    const ageLabelKey = AgeEngine.getCategoryLabelKey(category.id);
    const ageLabel = document.getElementById('metricsAgeLabel');
    if (ageLabel) ageLabel.textContent = I18N.t(ageLabelKey);

    const grid = document.getElementById('metricsGrid');
    grid.innerHTML = '';

    const isGlobal = LookupEngine.isGlobalEngine(profile.country);
    document.getElementById('globalNotice').style.display = isGlobal ? 'flex' : 'none';

    const selected = AppState.get('selectedMetrics') || [];

    metrics.forEach(m => {
      const card = document.createElement('div');
      card.className = 'bench-card' + (selected.includes(m.id) ? ' bench-card--selected' : '');
      card.dataset.metricId = m.id;
      card.innerHTML = `
        <input type="checkbox" class="bench-card__checkbox" ${selected.includes(m.id) ? 'checked' : ''}>
        <div class="bench-card__icon">${m.icon}</div>
        <div class="bench-card__title">${m.labelKey}</div>
        <div class="bench-card__unit">${m.unit}</div>
      `;
      card.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        const cb = card.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        card.classList.toggle('bench-card--selected', cb.checked);
        updateContinueBtn();
        AppState.set('selectedMetrics', getSelected());
      });
      card.querySelector('input[type="checkbox"]').addEventListener('change', () => {
        card.classList.toggle('bench-card--selected', card.querySelector('input').checked);
        updateContinueBtn();
        AppState.set('selectedMetrics', getSelected());
      });
      grid.appendChild(card);
    });

    updateContinueBtn();
  }

  function getSelected() {
    const checked = document.querySelectorAll('#metricsGrid .bench-card__checkbox:checked');
    return Array.from(checked).map(cb => cb.closest('.bench-card').dataset.metricId);
  }

  function updateContinueBtn() {
    const selected = getSelected();
    const btn = document.getElementById('metricsContinue');
    btn.disabled = selected.length === 0;
    btn.textContent = I18N.t('metrics.continue_btn', { count: selected.length });
  }

  document.addEventListener('i18n-changed', () => {
    const profile = AppState.get('profile');
    if (profile.dob) {
      const ageMonths = Utils.getAgeInMonths(profile.dob);
      const category = AgeEngine.getCategory(ageMonths, profile.sex, profile.gestationalWeeks, profile.useCorrectedAge);
      const ageLabelKey = AgeEngine.getCategoryLabelKey(category.id);
      const ageLabel = document.getElementById('metricsAgeLabel');
      if (ageLabel) ageLabel.textContent = I18N.t(ageLabelKey);
    }
    updateContinueBtn();
  });

  return { init, getSelected };
})();
