const AppState = (() => {
  const STORAGE_KEY = 'eratrack_state';

  let state = {
    profile: {
      name: '',
      dob: '',
      sex: 'female',
      country: 'Indonesia',
      gestationalWeeks: '',
      useCorrectedAge: false
    },
    selectedMetrics: [],
    measurements: {},
    rawParams: {},
    results: {}
  };

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed, profile: { ...state.profile, ...parsed.profile } };
      }
    } catch { }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { }
  }

  function get(key) {
    return key ? state[key] : state;
  }

  function set(key, value) {
    state[key] = value;
    save();
  }

  function updateProfile(fields) {
    state.profile = { ...state.profile, ...fields };
    save();
  }

  function clearProfile() {
    state.profile = { name: '', dob: '', sex: 'female', country: 'Indonesia', gestationalWeeks: '', useCorrectedAge: false };
    state.selectedMetrics = [];
    state.measurements = {};
    state.rawParams = {};
    state.results = {};
    save();
  }

  load();

  return { get, set, updateProfile, clearProfile, save };
})();
