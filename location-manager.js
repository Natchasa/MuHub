// location-manager.js — Populates countries, cities and dates in dropdowns

function populateCountryDropdowns() {
  const bCountry = document.getElementById('bCountry');
  const tCountry = document.getElementById('tCountry');
  const bookCountry = document.getElementById('bookCountry');
  if (!bCountry || !tCountry) return;

  const prevBVal = bCountry.value || 'TH';
  const prevTVal = tCountry.value || 'TH';
  const prevBookVal = bookCountry ? (bookCountry.value || 'TH') : 'TH';

  let countries = Object.entries(LOCATION_DATABASE).map(([code, data]) => ({
    code,
    name: data.name
  }));
  countries.sort((a, b) => a.name.localeCompare(b.name, 'th'));

  let th = countries.find(c => c.code === 'TH');
  let us = countries.find(c => c.code === 'US');
  countries = countries.filter(c => c.code !== 'TH' && c.code !== 'US');
  if (us) countries.unshift(us);
  if (th) countries.unshift(th);

  let html = '';
  countries.forEach(c => {
    html += `<option value="${c.code}">${c.name}</option>`;
  });
  html += `<option value="custom">กำหนดเอง</option>`;

  bCountry.innerHTML = html;
  tCountry.innerHTML = html;
  if (bookCountry) bookCountry.innerHTML = html;

  bCountry.value = prevBVal;
  tCountry.value = prevTVal;
  if (bookCountry) bookCountry.value = prevBookVal;

  const bCitySelect = document.getElementById('bCity');
  const prevBCityVal = bCitySelect ? bCitySelect.value : null;
  populateCities('b', prevBCityVal);

  const tCitySelect = document.getElementById('tCity');
  const prevTCityVal = tCitySelect ? tCitySelect.value : null;
  populateCities('t', prevTCityVal);

  const bookCitySelect = document.getElementById('bookCity');
  const prevBookCityVal = bookCitySelect ? bookCitySelect.value : null;
  if (bookCitySelect) populateCities('book', prevBookCityVal);

  // Sync searchable inputs
  ['b', 't', 'book'].forEach(prefix => {
    syncSearchInput(prefix, 'Country');
    syncSearchInput(prefix, 'City');
  });

  if (typeof searchableSelectsInitialized === 'undefined' || !searchableSelectsInitialized) {
    initAllSearchableSelects();
    window.searchableSelectsInitialized = true;
  }
}

function populateDateDropdowns(prefix, defaultDate = null) {
  const daySel = document.getElementById(prefix + 'Day');
  const monthSel = document.getElementById(prefix + 'Month');
  
  daySel.innerHTML = '';
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.text = i;
    daySel.appendChild(opt);
  }
  
  monthSel.innerHTML = '';
  MONTHS_TH.forEach((m, idx) => {
    const opt = document.createElement('option');
    opt.value = idx + 1;
    opt.text = m;
    monthSel.appendChild(opt);
  });
  
  const d = defaultDate ? new Date(defaultDate) : new Date();
  daySel.value = d.getDate();
  monthSel.value = d.getMonth() + 1;
  document.getElementById(prefix + 'Year').value = d.getFullYear() + 543;
  
  document.getElementById(prefix + 'Hour').value = String(d.getHours()).padStart(2, '0');
  document.getElementById(prefix + 'Min').value = String(d.getMinutes()).padStart(2, '0');
}

function populateCities(prefix, selectCityId = null) {
  const countryVal = document.getElementById(prefix + 'Country').value;
  const citySelect = document.getElementById(prefix + 'City');
  citySelect.innerHTML = '';
  
  const latField = document.getElementById(prefix + 'LatField');
  const lonField = document.getElementById(prefix + 'LonField');
  
  if (countryVal === 'custom') {
    latField.style.display = 'flex';
    lonField.style.display = 'flex';
    const opt = document.createElement('option');
    opt.value = 'custom';
    opt.text = 'กำหนดพิกัดเอง';
    citySelect.appendChild(opt);
    citySelect.disabled = true;
  } else {
    latField.style.display = 'none';
    lonField.style.display = 'none';
    citySelect.disabled = false;
    
    const countryData = LOCATION_DATABASE[countryVal];
    if (countryData) {
      countryData.cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city.id;
        opt.text = city.name;
        citySelect.appendChild(opt);
      });
    }
    
    let targetCityId = selectCityId;
    if (!targetCityId && countryVal === 'TH') {
      targetCityId = 'bangkok';
    }
    
    if (targetCityId) {
      citySelect.value = targetCityId;
      if (citySelect.selectedIndex === -1 && citySelect.options.length > 0) {
        citySelect.selectedIndex = 0;
      }
    } else if (citySelect.options.length > 0) {
      citySelect.selectedIndex = 0;
    }
    
    onCityChange(prefix);
  }
}

function onCountryChange(prefix) {
  syncSearchInput(prefix, 'Country');
  populateCities(prefix);
  syncSearchInput(prefix, 'City');
}

function onCityChange(prefix) {
  const countryVal = document.getElementById(prefix + 'Country').value;
  if (countryVal === 'custom') return;
  
  const cityId = document.getElementById(prefix + 'City').value;
  const countryData = LOCATION_DATABASE[countryVal];
  if (!countryData) return;
  
  const city = countryData.cities.find(c => c.id === cityId);
  if (city) {
    document.getElementById(prefix + 'Lat').value = city.lat;
    document.getElementById(prefix + 'Lon').value = city.lon;
  }
  syncSearchInput(prefix, 'City');
}

// Searchable select autocomplete helper functions
function initAllSearchableSelects() {
  ['b', 't', 'book'].forEach(prefix => {
    initSearchableSelect(prefix, 'Country');
    initSearchableSelect(prefix, 'City');
  });
}

function initSearchableSelect(prefix, type) {
  const searchInput = document.getElementById(`${prefix}${type}Search`);
  const optionsList = document.getElementById(`${prefix}${type}Options`);
  const hiddenSelect = document.getElementById(`${prefix}${type}`);
  
  if (!searchInput || !optionsList || !hiddenSelect) return;

  searchInput.addEventListener('focus', () => {
    optionsList.classList.add('show');
    filterSearchableOptions(prefix, type, searchInput.value);
  });

  searchInput.addEventListener('input', () => {
    optionsList.classList.add('show');
    filterSearchableOptions(prefix, type, searchInput.value);
  });

  // Close list when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !optionsList.contains(e.target)) {
      optionsList.classList.remove('show');
    }
  });
}

function filterSearchableOptions(prefix, type, query) {
  const optionsList = document.getElementById(`${prefix}${type}Options`);
  const hiddenSelect = document.getElementById(`${prefix}${type}`);
  if (!optionsList || !hiddenSelect) return;

  const q = query.trim().toLowerCase();
  optionsList.innerHTML = '';

  // Retrieve option items from the hidden select
  const options = Array.from(hiddenSelect.options);
  
  const filtered = options.filter(opt => {
    const text = opt.text.toLowerCase();
    const val = opt.value.toLowerCase();
    return text.includes(q) || val.includes(q);
  });

  if (filtered.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.style.padding = '8px 12px';
    emptyItem.style.color = 'var(--dim)';
    emptyItem.style.fontSize = '0.85rem';
    emptyItem.textContent = '❌ ไม่พบข้อมูล';
    optionsList.appendChild(emptyItem);
    return;
  }

  filtered.forEach(opt => {
    const el = document.createElement('div');
    el.className = 'option-item';
    if (opt.value === hiddenSelect.value) {
      el.classList.add('selected');
    }
    el.textContent = opt.text;
    el.addEventListener('click', () => {
      document.getElementById(`${prefix}${type}Search`).value = opt.text;
      hiddenSelect.value = opt.value;
      optionsList.classList.remove('show');
      
      // Dispatch change event on the hidden select to trigger existing listeners
      hiddenSelect.dispatchEvent(new Event('change'));
    });
    optionsList.appendChild(el);
  });
}

function syncSearchInput(prefix, type) {
  const searchInput = document.getElementById(`${prefix}${type}Search`);
  const hiddenSelect = document.getElementById(`${prefix}${type}`);
  if (searchInput && hiddenSelect) {
    const selectedOption = hiddenSelect.options[hiddenSelect.selectedIndex];
    searchInput.value = selectedOption ? selectedOption.text : '';
  }
}
