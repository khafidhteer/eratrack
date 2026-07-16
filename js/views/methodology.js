const MethodologyView = (() => {
  function show() {
    document.getElementById('modal-overlay').style.display = 'flex';
  }

  function hide() {
    document.getElementById('modal-overlay').style.display = 'none';
  }

  function init() {
    document.getElementById('modalClose').addEventListener('click', hide);
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
  }

  return { init, show, hide };
})();
