const InputView = (() => {
  const METRIC_PARAMS = {
    length_for_age: ['length'],
    weight_for_age: ['weight'],
    head_circumference: ['head_circumference'],
    weight_for_length: ['weight', 'length'],
    height_for_age: ['height'],
    bmi_for_age: ['weight', 'height'],
    bmi: ['weight', 'height'],
    waist_to_hip: ['waist', 'hip'],
    gestational_weight_gain: ['weight_gain'],
    fundal_height: ['fundal_height'],
    cdc_growth_curve: ['weight', 'length', 'head_circumference']
  };

  const PARAM_CONFIG = {
    weight: { label: 'Weight', unit: 'kg', step: 0.1 },
    height: { label: 'Height', unit: 'cm', step: 0.1 },
    length: { label: 'Length', unit: 'cm', step: 0.1 },
    head_circumference: { label: 'Head Circumference', unit: 'cm', step: 0.1 },
    waist: { label: 'Waist Circumference', unit: 'cm', step: 0.1 },
    hip: { label: 'Hip Circumference', unit: 'cm', step: 0.1 },
    weight_gain: { label: 'Weight Gain', unit: 'kg', step: 0.1 },
    fundal_height: { label: 'Fundal Height', unit: 'cm', step: 0.1 }
  };

  function getParamMetricsMap(selected) {
    const map = {};
    selected.forEach(mId => {
      const params = METRIC_PARAMS[mId] || [];
      params.forEach(p => {
        if (!map[p]) map[p] = [];
        map[p].push(mId);
      });
    });
    return map;
  }

  function init() {
    const selected = AppState.get('selectedMetrics') || [];
    const profile = AppState.get('profile');
    const container = document.getElementById('dynamicInputs');
    container.innerHTML = '';

    if (!profile.dob) return;

    const ageMonths = Utils.getAgeInMonths(profile.dob);
    const paramMap = getParamMetricsMap(selected);
    const uniqueParams = Object.keys(paramMap);

    uniqueParams.forEach(param => {
      const config = PARAM_CONFIG[param] || { label: param, unit: '', step: 0.1 };
      const metricsUsing = paramMap[param];
      const metricLabels = metricsUsing.map(mId => {
        const found = Object.values(AgeEngine.getMetricsForCategory(AgeEngine.getCategory(ageMonths, profile.sex, profile.gestationalWeeks, profile.useCorrectedAge).id)).find(m => m.id === mId);
        return found ? found.labelKey : mId;
      });

      const div = document.createElement('div');
      div.className = 'form-group';
      div.innerHTML = `
        <label class="form__label" for="input_${param}">${config.label} (${config.unit})</label>
        <input type="number" id="input_${param}" class="form__input" step="${config.step}" min="0" required placeholder="e.g., 75.2">
        <div class="form__hint" id="hint_${param}"></div>
        <div class="form__hint form__hint--used-by">${I18N.t('input.used_by', { metrics: metricLabels.join(', ') })}</div>
      `;
      container.appendChild(div);
    });
  }

  function getMeasurements() {
    const selected = AppState.get('selectedMetrics') || [];
    const paramMap = getParamMetricsMap(selected);
    const data = {};
    Object.keys(paramMap).forEach(param => {
      const input = document.getElementById('input_' + param);
      if (input && input.value) {
        data[param] = parseFloat(input.value);
      }
    });
    return data;
  }

  function validate() {
    const selected = AppState.get('selectedMetrics') || [];
    const paramMap = getParamMetricsMap(selected);
    for (const param of Object.keys(paramMap)) {
      const input = document.getElementById('input_' + param);
      if (!input || !input.value || isNaN(parseFloat(input.value))) {
        alert('Please fill in all measurement fields');
        return false;
      }
    }
    return true;
  }

  return { init, getMeasurements, validate, METRIC_PARAMS, PARAM_CONFIG };
})();
