import { initMap, fetchPharmacies, displayMarkers, locateUser, findNearestPharmacy, renderPharmaciesList, updateStats, getUniqueNeighborhoods, speak } from './modules/pharmacies.js';

let map, allPharmacies = [];
let currentNeighborhood = 'الكل';

async function load() {
  map = initMap('map');
  allPharmacies = await fetchPharmacies();
  updateStats(allPharmacies);
  displayMarkers(allPharmacies);
  renderPharmaciesList(allPharmacies, 'pharmaciesList');
  initNeighborhoodFilters();
  initSearch();
  initMapControls();
  initVoiceAssistant();
}

function initNeighborhoodFilters() {
  const neighborhoods = ['الكل', ...getUniqueNeighborhoods(allPharmacies)];
  const container = document.getElementById('neighborhoodFilters');
  if (!container) return;
  container.innerHTML = neighborhoods.map(n => `<span class="filter-chip ${n === currentNeighborhood ? 'active' : ''}" data-hood="${n}">${n}</span>`).join('');
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentNeighborhood = chip.dataset.hood;
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });
}

function initSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => applyFilters());
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  let filtered = currentNeighborhood === 'الكل' ? allPharmacies : allPharmacies.filter(p => p.neighborhood === currentNeighborhood);
  if (searchTerm) {
    filtered = filtered.filter(p => (p.name && p.name.toLowerCase().includes(searchTerm)) || (p.neighborhood && p.neighborhood.toLowerCase().includes(searchTerm)));
  }
  renderPharmaciesList(filtered, 'pharmaciesList');
  displayMarkers(filtered);
  document.getElementById('resultCount').innerText = filtered.length;
}

function initMapControls() {
  // إضافة زر "موقعي" على الخريطة (اختياري) - سنضيفه مباشرة كزر في الواجهة
  const locateBtn = document.createElement('button');
  locateBtn.innerHTML = '<i class="fas fa-location-dot"></i>';
  locateBtn.className = 'custom-locate-btn';
  locateBtn.style.position = 'absolute';
  locateBtn.style.bottom = '10px';
  locateBtn.style.right = '10px';
  locateBtn.style.zIndex = '1000';
  locateBtn.style.background = 'var(--secondary)';
  locateBtn.style.border = 'none';
  locateBtn.style.borderRadius = '50%';
  locateBtn.style.width = '40px';
  locateBtn.style.height = '40px';
  locateBtn.style.cursor = 'pointer';
  locateBtn.onclick = () => locateUser();
  document.querySelector('.map-container').appendChild(locateBtn);

  // زر أقرب صيدلية
  const nearestBtn = document.createElement('button');
  nearestBtn.innerHTML = '<i class="fas fa-route"></i>';
  nearestBtn.className = 'custom-nearest-btn';
  nearestBtn.style.position = 'absolute';
  nearestBtn.style.bottom = '10px';
  nearestBtn.style.right = '60px';
  nearestBtn.style.zIndex = '1000';
  nearestBtn.style.background = 'var(--primary)';
  nearestBtn.style.border = 'none';
  nearestBtn.style.borderRadius = '50%';
  nearestBtn.style.width = '40px';
  nearestBtn.style.height = '40px';
  nearestBtn.style.cursor = 'pointer';
  nearestBtn.onclick = () => findNearestPharmacy();
  document.querySelector('.map-container').appendChild(nearestBtn);
}

function initVoiceAssistant() {
  const btn = document.getElementById('voiceAssistant');
  btn.addEventListener('click', () => {
    speak("أهلاً بيك فدليل الصيدليات ديال تاوريرت. ضغط على أيقونة الموقع باش نبداو، أو اختار صيدلية من القائمة باش نعطيك الطريق");
  });
  // ترحيب أول مرة (اختياري)
  setTimeout(() => speak("أهلاً بك في تاوريرت هوب"), 1500);
}

// أزرار الإجراءات السريعة
document.getElementById('bloodBtn').onclick = () => speak("خدمة التبرع بالدم غادي تكون قريباً");
document.getElementById('lostBtn').onclick = () => speak("خدمة المفقودات غادية تكون قريباً");
document.getElementById('jobsBtn').onclick = () => speak("وظائف تاوريرت غادية تكون قريباً");

// الوضع المظلم
const themeBtn = document.createElement('button');
themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
themeBtn.className = 'theme-toggle-btn';
themeBtn.style.position = 'fixed';
themeBtn.style.bottom = '20px';
themeBtn.style.right = '20px';
themeBtn.style.zIndex = '1000';
themeBtn.style.background = 'var(--primary)';
themeBtn.style.border = 'none';
themeBtn.style.borderRadius = '50%';
themeBtn.style.width = '45px';
themeBtn.style.height = '45px';
themeBtn.style.cursor = 'pointer';
themeBtn.style.color = 'white';
document.body.appendChild(themeBtn);
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
};
if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');

load();
