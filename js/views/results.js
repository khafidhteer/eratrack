const ResultsView = (() => {
  const DERIVED_METRICS = {
    bmi_for_age: (p) => p.height > 0 ? p.weight / Math.pow(p.height / 100, 2) : null,
    bmi:         (p) => p.height > 0 ? p.weight / Math.pow(p.height / 100, 2) : null,
    waist_to_hip:(p) => p.hip > 0 ? p.waist / p.hip : null
  };

  const STATUS_EMOJI = {
    severely_low: '🔴', low: '🟡', slightly_low: '🟢',
    optimal: '🟢',
    slightly_high: '🟢', high: '🟡', severely_high: '🔴'
  };

  function getMetricValue(metricId, rawParams) {
    if (DERIVED_METRICS[metricId]) return DERIVED_METRICS[metricId](rawParams);
    const params = InputView.METRIC_PARAMS[metricId] || [];
    return params.length > 0 ? (rawParams[params[0]] || null) : null;
  }

  function render(selectedMetrics, rawParams) {
    const profile = AppState.get('profile');
    const ageMonths = Utils.getAgeInMonths(profile.dob);
    const results = [];
    document.getElementById('resultsCards').innerHTML = '';

    selectedMetrics.forEach(metricId => {
      if (metricId === 'cdc_growth_curve') return;
      const value = getMetricValue(metricId, rawParams);
      if (value == null) return;
      const r = Calculator.calculate(metricId, value, ageMonths, profile.sex, profile.country);
      if (r) {
        r.metricId = metricId;
        const config = getMetricConfig(metricId);
        r.label = config.label;
        r.unit = config.unit;
        r.displayValue = DERIVED_METRICS[metricId]
          ? Utils.roundTo(value, 1)
          : Utils.roundTo(value, 1);
        results.push(r);
      }
    });

    if (results.length === 0) return;

    const worst = results.reduce((a, b) =>
      (b.category.severity ?? 99) < (a.category.severity ?? 99) ? b : a
    );
    const cat = worst.category;

    const heroEmoji = STATUS_EMOJI[cat.key] || '🌟';
    document.getElementById('resultEmoji').textContent = heroEmoji;
    document.getElementById('resultTitle').textContent = I18N.t('interpretations.' + cat.key + '_title', { metric: worst.label });
    document.getElementById('resultSubtitle').textContent = I18N.t('interpretations.' + cat.key + '_desc', { metric: worst.label, percentile: worst.percentile });

    const chartsContainer = document.getElementById('resultsCharts');
    chartsContainer.innerHTML = '';

    for (const r of results) {
      const table = LookupEngine.getReferenceTable(r.metricId, ageMonths, profile.sex, profile.country);
      if (table) {
        ChartRenderer.renderChart(
          'resultsCharts',
          r.metricId,
          r.label,
          r.unit,
          table,
          { v: r.value },
          ageMonths
        );
      }
    }

    renderInputsSection(rawParams);
    renderResultCards(results);

    AppState.set('results', {
      metrics: results,
      title: I18N.t('interpretations.' + cat.key + '_title', { metric: worst.label }),
      subtitle: I18N.t('interpretations.' + cat.key + '_desc', { metric: worst.label, percentile: worst.percentile })
    });
  }

  function renderInputsSection(rawParams) {
    const container = document.getElementById('resultsCards');
    const section = document.createElement('div');
    section.className = 'results__inputs';
    section.innerHTML = `<h3 class="results__inputs-title">${I18N.t('results.your_inputs')}</h3>`;
    const list = document.createElement('div');
    list.className = 'grid grid--2col';
    const known = [
      { key: 'weight', label: 'Weight', unit: 'kg' },
      { key: 'height', label: 'Height', unit: 'cm' },
      { key: 'length', label: 'Length', unit: 'cm' },
      { key: 'head_circumference', label: 'Head Circumference', unit: 'cm' },
      { key: 'waist', label: 'Waist Circumference', unit: 'cm' },
      { key: 'hip', label: 'Hip Circumference', unit: 'cm' },
      { key: 'weight_gain', label: 'Weight Gain', unit: 'kg' },
      { key: 'fundal_height', label: 'Fundal Height', unit: 'cm' }
    ];
    let hasAny = false;
    known.forEach(k => {
      if (rawParams[k.key] != null) {
        hasAny = true;
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <div class="result-card__label">${k.label}</div>
          <div class="result-card__value">${rawParams[k.key]} ${k.unit}</div>
        `;
        list.appendChild(card);
      }
    });
    if (hasAny) {
      section.appendChild(list);
      container.prepend(section);
    }
  }

  function renderResultCards(results) {
    const cardsContainer = document.getElementById('resultsCards');
    for (const r of results) {
      const card = document.createElement('div');
      card.className = 'result-card';
      const cat = r.category;
      const emoji = STATUS_EMOJI[cat.key] || '';
      const derivedNote = DERIVED_METRICS[r.metricId]
        ? `<div class="result-card__derived">${I18N.t('results.derived_from')}</div>`
        : '';
      card.innerHTML = `
        <div class="result-card__label">${r.label}</div>
        <div class="result-card__value">${r.displayValue} ${r.unit}</div>
        ${derivedNote}
        <div class="result-card__status result-card__status--${cat.key}">
          ${emoji} ${I18N.t('interpretations.' + cat.key + '_title', { metric: r.label })}
        </div>
        <div class="result-card__interpretation">
          ${I18N.t('interpretations.' + cat.key + '_desc', { metric: r.label, percentile: r.percentile })}
        </div>
      `;
      cardsContainer.appendChild(card);
    }
  }

  function getMetricConfig(metricId) {
    const configs = {
      length_for_age: { label: 'Length-for-Age', unit: 'cm' },
      weight_for_age: { label: 'Weight-for-Age', unit: 'kg' },
      head_circumference: { label: 'Head Circumference', unit: 'cm' },
      weight_for_length: { label: 'Weight-for-Length', unit: 'kg' },
      height_for_age: { label: 'Height-for-Age', unit: 'cm' },
      bmi_for_age: { label: 'BMI-for-Age', unit: 'kg/m²' },
      bmi: { label: 'BMI', unit: 'kg/m²' },
      waist_to_hip: { label: 'Waist-to-Hip Ratio', unit: '' },
      gestational_weight_gain: { label: 'Weight Gain', unit: 'kg' },
      fundal_height: { label: 'Fundal Height', unit: 'cm' }
    };
    return configs[metricId] || { label: metricId, unit: '' };
  }

  return { init: () => {}, render };
})();
