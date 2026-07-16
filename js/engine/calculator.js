const Calculator = (() => {
  function calculateZScore(value, l, m, s) {
    if (!value || !m || !s) return null;
    if (l === 0) {
      return Math.log(value / m) / s;
    }
    return ((Math.pow(value / m, l) - 1) / (l * s));
  }

  function getResultCategory(zScore) {
    if (zScore === null || isNaN(zScore)) return { key: 'none', title: '', subtitle: '' };
    if (zScore >= -1 && zScore <= 1) {
      return { key: 'optimal', titleKey: 'results.optimal_title', subtitleKey: 'results.optimal_subtitle', emoji: '🌟' };
    } else if (zScore > 1) {
      return { key: 'high', titleKey: 'results.high_title', subtitleKey: 'results.high_subtitle', emoji: '🚀' };
    } else {
      return { key: 'low', titleKey: 'results.low_title', subtitleKey: 'results.low_subtitle', emoji: '💪' };
    }
  }

  function calculate(metricId, value, ageMonths, sex, country) {
    const lms = LookupEngine.lookupLMS(metricId, ageMonths, sex, country);
    if (!lms) return null;
    const z = calculateZScore(value, lms.l, lms.m, lms.s);
    if (z === null) return null;
    const percentile = Utils.zToPercentile(z);
    const category = getResultCategory(z);
    return {
      zScore: Utils.roundTo(z, 2),
      percentile,
      lms,
      category,
      value
    };
  }

  return { calculate, getResultCategory };
})();
