const LookupEngine = (() => {
  let referenceData = null;
  let loading = false;
  let loadPromise = null;

  async function ensureLoaded() {
    if (referenceData) return;
    if (loading) return loadPromise;
    loading = true;
    loadPromise = fetch('data/references.json').then(r => r.json()).then(data => {
      referenceData = data;
      loading = false;
    }).catch(() => {
      referenceData = {};
      loading = false;
    });
    return loadPromise;
  }

  function getEngineForCountry(country) {
    return country === 'Indonesia' ? 'kemenkes' : 'who';
  }

  function getReferenceTable(metric, ageMonths, sex, country) {
    if (!referenceData) return null;
    const engine = getEngineForCountry(country);
    const metricMap = {
      length_for_age: 'length_for_age',
      weight_for_age: 'weight_for_age',
      head_circumference: 'head_circumference',
      weight_for_length: 'weight_for_length',
      height_for_age: 'height_for_age',
      bmi_for_age: 'bmi_for_age',
      bmi: 'bmi',
      waist_to_hip: 'waist_to_hip',
      gestational_weight_gain: 'gestational_weight_gain',
      fundal_height: 'fundal_height',
      cdc_growth_curve: 'cdc_growth_curve'
    };
    const tableKey = metricMap[metric];
    if (!tableKey) return null;
    let engineData = referenceData[engine];
    if (!engineData) {
      engineData = referenceData['who'];
    }
    const table = engineData?.[tableKey];
    if (!table) return null;
    const sexKey = sex === 'male' ? 'male' : 'female';
    return table[sexKey] || null;
  }

  function lookupLMS(metric, ageMonths, sex, country) {
    const table = getReferenceTable(metric, ageMonths, sex, country);
    if (!table || !table.length) return null;
    const ageInMonths = Math.round(ageMonths);
    let entry = table.find(e => e.age === ageInMonths);
    if (!entry) {
      entry = Utils.findClosestInArray(table, ageInMonths, 'age');
    }
    return entry ? { l: entry.l, m: entry.m, s: entry.s } : null;
  }

  function isGlobalEngine(country) {
    return getEngineForCountry(country) !== 'kemenkes';
  }

  return { ensureLoaded, getEngineForCountry, lookupLMS, isGlobalEngine, getReferenceTable };
})();
