const ProfileView = (() => {
  let countryData = [];

  function init() {
    countryData = Utils.COUNTRIES.map(c => ({ value: c, label: c }));
    populateCountries();
    setupCountrySearch();
    setupSexToggle();
    setupDateValidation();
    setupGestationalField();
    loadSavedData();
  }

  function populateCountries() {
    const dropdown = document.getElementById('countryDropdown');
    dropdown.innerHTML = countryData.map(c =>
      `<div class="searchable-select__item${c.value === 'Indonesia' ? ' searchable-select__item--selected' : ''}" data-value="${c.value}">${c.label}</div>`
    ).join('');
  }

  function setupCountrySearch() {
    const search = document.getElementById('profileCountrySearch');
    const hidden = document.getElementById('profileCountry');
    const dropdown = document.getElementById('countryDropdown');

    search.addEventListener('focus', () => dropdown.classList.add('open'));
    search.addEventListener('blur', () => setTimeout(() => dropdown.classList.remove('open'), 200));
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      const items = dropdown.querySelectorAll('.searchable-select__item');
      items.forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    dropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.searchable-select__item');
      if (!item) return;
      search.value = item.textContent;
      hidden.value = item.dataset.value;
      dropdown.querySelectorAll('.searchable-select__item').forEach(el => el.classList.remove('searchable-select__item--selected'));
      item.classList.add('searchable-select__item--selected');
      dropdown.classList.remove('open');
    });
  }

  function setupSexToggle() {
    const btns = document.querySelectorAll('.toggle-btn');
    const hidden = document.getElementById('profileSex');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('toggle-btn--active'));
        btn.classList.add('toggle-btn--active');
        hidden.value = btn.dataset.value;
      });
    });
  }

  function setupDateValidation() {
    const dob = document.getElementById('profileDob');
    dob.max = new Date().toISOString().split('T')[0];
  }

  function setupGestationalField() {
    const dob = document.getElementById('profileDob');
    const gestationalGroup = document.getElementById('gestationalGroup');
    const select = document.getElementById('profileGestational');
    select.innerHTML = '<option value="">--</option>';
    for (let i = 22; i <= 42; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i + ' ' + I18N.t('profile.weeks');
      select.appendChild(opt);
    }
    dob.addEventListener('change', () => {
      if (!dob.value) { gestationalGroup.style.display = 'none'; return; }
      const months = Utils.getAgeInMonths(dob.value);
      gestationalGroup.style.display = months < 24 ? 'block' : 'none';
    });
  }

  function loadSavedData() {
    const p = AppState.get('profile');
    if (p.name) document.getElementById('profileName').value = p.name;
    if (p.dob) {
      document.getElementById('profileDob').value = p.dob;
      document.getElementById('profileDob').dispatchEvent(new Event('change'));
    }
    if (p.sex) {
      document.querySelectorAll('.toggle-btn').forEach(b => {
        b.classList.toggle('toggle-btn--active', b.dataset.value === p.sex);
      });
      document.getElementById('profileSex').value = p.sex;
    }
    if (p.country) {
      document.getElementById('profileCountrySearch').value = p.country;
      document.getElementById('profileCountry').value = p.country;
    }
    if (p.gestationalWeeks) document.getElementById('profileGestational').value = p.gestationalWeeks;
    if (p.useCorrectedAge) document.getElementById('profileCorrected').checked = true;
  }

  function getFormData() {
    return {
      name: document.getElementById('profileName').value.trim(),
      dob: document.getElementById('profileDob').value,
      sex: document.getElementById('profileSex').value,
      country: document.getElementById('profileCountry').value,
      gestationalWeeks: document.getElementById('profileGestational').value,
      useCorrectedAge: document.getElementById('profileCorrected').checked
    };
  }

  function validate() {
    const data = getFormData();
    if (!data.name) { alert('Please enter a name'); return false; }
    if (!data.dob) { alert('Please select a date of birth'); return false; }
    return true;
  }

  document.addEventListener('i18n-changed', () => {
    setupGestationalField();
  });

  return { init, getFormData, validate };
})();
