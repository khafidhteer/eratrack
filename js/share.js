const ShareModule = (() => {
  function generateBadgeImage(results, profile) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bg = isDark ? '#16163a' : '#ffffff';
    const text = isDark ? '#e2e8f0' : '#1a1a2e';
    const accent = isDark ? '#00b4d8' : '#0f4c5c';
    const gold = isDark ? '#f0c040' : '#b8860b';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = accent;
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.fillText('EraTrack', 30, 50);

    ctx.fillStyle = text;
    ctx.font = '20px -apple-system, sans-serif';
    ctx.fillText(results.title || 'Growing Strong!', 30, 90);

    ctx.fillStyle = gold;
    ctx.font = '16px -apple-system, sans-serif';
    ctx.fillText(results.subtitle || 'Optimal Range', 30, 120);

    ctx.fillStyle = text;
    ctx.font = '15px -apple-system, sans-serif';
    let y = 170;
    for (const r of results.metrics || []) {
      ctx.fillText(r.label + ': ' + r.value + ' (' + r.percentile + '%)', 30, y);
      y += 30;
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillText('Powered by EraTrack · 100% Private', 30, 370);

    return canvas.toDataURL('image/png');
  }

  function downloadImage(dataUrl) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'eratrack-milestone.png';
    a.click();
  }

  async function webShare(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch { }
    }
    return false;
  }

  function shareToWhatsApp(text) {
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  function shareToFacebook(text) {
    const url = 'https://www.facebook.com/sharer/sharer.php?quote=' + encodeURIComponent(text) + '&u=' + encodeURIComponent(window.location.href);
    window.open(url, '_blank');
  }

  function shareToInstagram(text) {
    const url = 'https://www.instagram.com/create/story/?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  return { generateBadgeImage, downloadImage, webShare, shareToWhatsApp, shareToFacebook, shareToInstagram };
})();
