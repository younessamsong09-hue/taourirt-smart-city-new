import { initMap, fetchPharmacies, displayPharmaciesOnMap, locateUser, findNearestPharmacy, renderPharmaciesList, updateStats, speak } from './modules/pharmacies.js';

let map;
let allPharmacies = [];

async function init() {
  map = initMap('map');
  allPharmacies = await fetchPharmacies();
  updateStats(allPharmacies);
  displayPharmaciesOnMap(allPharmacies);
  renderPharmaciesList(allPharmacies, 'pharmaciesList');

  // أزرار التحكم
  document.getElementById('locateMeBtn').addEventListener('click', () => locateUser());
  document.getElementById('nearestPharmacyBtn').addEventListener('click', () => findNearestPharmacy());
  document.getElementById('voiceAssistBtn').addEventListener('click', () => {
    speak("أهلاً بيك فدليل الصيدليات ديال تاوريرت. تقدر تلقى أقرب صيدلية، أو تختار وحدة من القائمة، ونعطيك الطريق بالخريطة. ضغط على موقعي باش نبداو");
  });
  
  // البحث
  const searchInput = document.getElementById('searchPharmacy');
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allPharmacies.filter(p => 
      (p.name && p.name.toLowerCase().includes(term)) || 
      (p.neighborhood && p.neighborhood.toLowerCase().includes(term))
    );
    renderPharmaciesList(filtered, 'pharmaciesList');
    displayPharmaciesOnMap(filtered);
  });

  // الوضع المظلم
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  });
  if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
}

init();
