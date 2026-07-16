const AgeEngine = (() => {
  function getCategory(ageMonths, sex, gestationalWeeks, useCorrectedAge) {
    if (gestationalWeeks && useCorrectedAge) {
      const prematurityWeeks = 40 - parseInt(gestationalWeeks);
      ageMonths = Math.max(0, ageMonths - prematurityWeeks * 0.23);
    }
    if (ageMonths < 0) return { id: 'infancy', label: 'Infancy', months: ageMonths };
    if (ageMonths < 24) return { id: 'infancy', label: 'Infancy', months: ageMonths };
    if (ageMonths < 144) return { id: 'childhood', label: 'Childhood', months: ageMonths };
    if (ageMonths < 216) return { id: 'adolescence', label: 'Adolescence', months: ageMonths };
    if (ageMonths < 720) return { id: 'adulthood', label: 'Adulthood', months: ageMonths };
    return { id: 'eldercare', label: 'Elder Care', months: ageMonths };
  }

  function getMetricsForCategory(categoryId) {
    const matrix = {
      pregnancy: [
        { id: 'gestational_weight_gain', labelKey: 'Gestational Weight Gain', unit: 'kg', icon: '⚖️' },
        { id: 'fundal_height', labelKey: 'Fundal Height', unit: 'cm', icon: '📐' }
      ],
      infancy: [
        { id: 'length_for_age', labelKey: 'Length-for-Age', unit: 'cm', icon: '📏' },
        { id: 'weight_for_age', labelKey: 'Weight-for-Age', unit: 'kg', icon: '⚖️' },
        { id: 'head_circumference', labelKey: 'Head Circumference-for-Age', unit: 'cm', icon: '📐' },
        { id: 'weight_for_length', labelKey: 'Weight-for-Length', unit: 'kg', icon: '⚖️' },
        { id: 'cdc_growth_curve', labelKey: 'Kurva Pertumbuhan CDC', unit: '', icon: '📈' }
      ],
      childhood: [
        { id: 'height_for_age', labelKey: 'Height-for-Age', unit: 'cm', icon: '📏' },
        { id: 'bmi_for_age', labelKey: 'BMI-for-Age', unit: 'kg/m²', icon: '📊' }
      ],
      adolescence: [
        { id: 'height_for_age', labelKey: 'Height-for-Age', unit: 'cm', icon: '📏' },
        { id: 'bmi_for_age', labelKey: 'BMI-for-Age', unit: 'kg/m²', icon: '📊' }
      ],
      adulthood: [
        { id: 'bmi', labelKey: 'BMI', unit: 'kg/m²', icon: '📊' },
        { id: 'waist_to_hip', labelKey: 'Waist-to-Hip Ratio', unit: 'ratio', icon: '📐' }
      ],
      eldercare: [
        { id: 'bmi', labelKey: 'BMI', unit: 'kg/m²', icon: '📊' },
        { id: 'waist_to_hip', labelKey: 'Waist-to-Hip Ratio', unit: 'ratio', icon: '📐' }
      ]
    };
    return matrix[categoryId] || matrix.infancy;
  }

  function getCategoryLabelKey(categoryId) {
    const map = {
      pregnancy: 'metrics.pregnancy',
      infancy: 'metrics.infancy',
      childhood: 'metrics.childhood',
      adolescence: 'metrics.adolescence',
      adulthood: 'metrics.adulthood',
      eldercare: 'metrics.eldercare'
    };
    return map[categoryId] || 'metrics.infancy';
  }

  return { getCategory, getMetricsForCategory, getCategoryLabelKey };
})();
