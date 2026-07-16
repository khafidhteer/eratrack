const ChartRenderer = (() => {

  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      accent: style.getPropertyValue('--color-accent').trim() || (isDark ? '#00b4d8' : '#0f4c5c'),
      gold: style.getPropertyValue('--color-gold').trim() || (isDark ? '#f0c040' : '#b8860b'),
      text: style.getPropertyValue('--color-text').trim() || '#1a1a2e',
      muted: style.getPropertyValue('--color-text-muted').trim() || '#6b7280',
      grid: style.getPropertyValue('--color-border').trim() || '#e5e7eb',
      bg: style.getPropertyValue('--color-bg-card').trim() || '#ffffff'
    };
  }

  function drawGrowthChart(canvas, dataPoints, userValue, metricLabel, unit) {
    const colors = getThemeColors();
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 32;
    const h = Math.min(w * 0.6, 280);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    const pad = { top: 20, right: 16, bottom: 40, left: 48 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const ages = dataPoints.map(d => d.age);
    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);

    const p5 = dataPoints.map(d => d.p5 || (d.m * Math.exp(d.s * -1.645 * d.l)));
    const p50 = dataPoints.map(d => d.m);
    const p95 = dataPoints.map(d => d.p95 || (d.m * Math.exp(d.s * 1.645 * d.l)));
    const allVals = [...p5, ...p95, userValue].filter(v => v != null);
    const minVal = Math.min(...allVals) * 0.95;
    const maxVal = Math.max(...allVals) * 1.05;

    function xPos(age) { return pad.left + ((age - minAge) / (maxAge - minAge)) * plotW; }
    function yPos(val) { return pad.top + plotH - ((val - minVal) / (maxVal - minVal)) * plotH; }

    function drawCurve(values, color, lineWidth) {
      ctx.beginPath();
      values.forEach((v, i) => {
        const x = xPos(dataPoints[i].age);
        const y = yPos(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * plotH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
      const val = minVal + (1 - i / 4) * (maxVal - minVal);
      ctx.fillStyle = colors.muted;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(1), pad.left - 6, y + 4);
    }
    ctx.setLineDash([]);

    ctx.fillStyle = colors.muted;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    const ageStep = Math.max(1, Math.round((maxAge - minAge) / 6));
    for (let a = minAge; a <= maxAge; a += ageStep) {
      const x = xPos(a);
      ctx.fillText(a + 'mo', x, h - 8);
    }

    ctx.fillStyle = colors.muted;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Age (months)', pad.left + plotW / 2 - 30, h - 8);

    drawCurve(p50, colors.accent, 2);
    drawCurve(p5, colors.muted, 1);
    drawCurve(p95, colors.muted, 1);

    ctx.fillStyle = colors.muted;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('P5', pad.left + 2, yPos(p5[0]) - 4);
    ctx.fillText('P95', pad.left + 2, yPos(p95[0]) - 4);
    ctx.fillText('P50', pad.left + 2, yPos(p50[0]) - 4);

    if (userValue != null) {
      const userAge = ages.includes(Math.round(userValue._age)) ? userValue._age : Math.round(userValue._age);
      const ux = xPos(userValue._age);
      const uy = yPos(userValue.v);

      ctx.beginPath();
      ctx.arc(ux, uy, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.gold;
      ctx.fill();
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.gold;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('● You', ux + 10, uy + 4);
    }

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(metricLabel + ' (' + unit + ')', pad.left, 14);
  }

  function renderChart(containerId, metricId, metricLabel, unit, dataPoints, userValue, ageMonths) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart-container';
    chartDiv.innerHTML = '<div class="chart-title">' + metricLabel + '</div><canvas></canvas>';
    container.appendChild(chartDiv);
    const canvas = chartDiv.querySelector('canvas');
    const points = dataPoints.map(d => ({ ...d, p5: d.m * Math.pow(Math.E, -1.645 * d.s * d.l), p95: d.m * Math.pow(Math.E, 1.645 * d.s * d.l) }));
    userValue._age = ageMonths;
    requestAnimationFrame(() => drawGrowthChart(canvas, points, userValue, metricLabel, unit));
  }

  return { renderChart, drawGrowthChart };
})();
