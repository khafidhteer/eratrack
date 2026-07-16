const Calculator = (() => {
  function calculateZScore(value, l, m, s) {
    if (!value || !m || !s) return null;
    if (l === 0) {
      return Math.log(value / m) / s;
    }
    return ((Math.pow(value / m, l) - 1) / (l * s));
  }

  function getResultCategory(zScore) {
    if (zScore === null || isNaN(zScore)) return { key: 'none', severity: -1 };
    if (zScore < -3) return { key: 'severely_low', severity: 0 };
    if (zScore < -2) return { key: 'low', severity: 1 };
    if (zScore < -1) return { key: 'slightly_low', severity: 2 };
    if (zScore <= 1) return { key: 'optimal', severity: 3 };
    if (zScore <= 2) return { key: 'slightly_high', severity: 4 };
    if (zScore <= 3) return { key: 'high', severity: 5 };
    return { key: 'severely_high', severity: 6 };
  }

  const SEVERITY_ORDER = {
    severely_low: 0,
    low: 1,
    slightly_low: 2,
    optimal: 3,
    slightly_high: 4,
    high: 5,
    severely_high: 6
  };

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

  return { calculate, getResultCategory, SEVERITY_ORDER };
})();
