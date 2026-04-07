import { supabaseConfig } from '../core/config.js';

let map, routingControl, userMarker;
let allPharmacies = [];

export function initMap(containerId) {
  map = L.map(containerId).setView([34.416, -2.89], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  return map;
}

export async function fetchPharmacies() {
  try {
    const res = await fetch(`${supabaseConfig.url}/rest/v1/pharmacies?select=*`, {
      headers: { apikey: supabaseConfig.anonKey, Authorization: `Bearer ${supabaseConfig.anonKey}` }
    });
    if (!res.ok) throw new Error();
    allPharmacies = await res.json();
    return allPharmacies;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function displayMarkers(pharmacies) {
  if (!map) return;
  map.eachLayer(layer => {
    if (layer instanceof L.Marker && layer !== userMarker) map.removeLayer(layer);
  });
  pharmacies.forEach(p => {
    if (p.lat && p.lng) {
      const marker = L.marker([p.lat, p.lng])
        .bindPopup(`<b>${p.name}</b><br>${p.address}<br>${p.is_on_duty ? '🟢 مفتوحة' : '🔴 مغلقة'}`)
        .on('click', () => {
          if (userMarker) drawRoute(userMarker.getLatLng(), [p.lat, p.lng]);
          else speak("حدد موقعك أولاً عبر زر الموقع في الخريطة");
        });
      marker.addTo(map);
    }
  });
}

function drawRoute(start, end) {
  if (routingControl) map.removeControl(routingControl);
  routingControl = L.Routing.control({
    waypoints: [L.latLng(start.lat, start.lng), L.latLng(end[0], end[1])],
    language: 'ar',
    lineOptions: { styles: [{ color: '#2ecc71', weight: 5 }] }
  }).addTo(map);
  map.fitBounds([start, end]);
}

export function locateUser() {
  if (!map) return;
  map.locate({ setView: true, maxZoom: 15 });
  map.on('locationfound', (e) => {
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(e.latlng, { icon: L.divIcon({ className: 'user-location', html: '<i class="fas fa-user"></i>', iconSize: [24,24] }) }).addTo(map);
    userMarker.bindPopup("أنت هنا").openPopup();
    speak("تما، لقيت موقعك. دابا يمكنك تختار صيدلية باش نعطيك الطريق");
  });
  map.on('locationerror', () => speak("ما قدرتش نعرف موقعك. تأكد أن الخدمة مفعلة"));
}

export function findNearestPharmacy() {
  if (!userMarker) { speak("عافاك، ضغط على أيقونة الموقع في الخريطة باش نعرفو فين جاي"); return; }
  if (!allPharmacies.length) return;
  let nearest = null, minDist = Infinity;
  const userPos = userMarker.getLatLng();
  for (const p of allPharmacies) {
    if (p.lat && p.lng) {
      const d = userPos.distanceTo(L.latLng(p.lat, p.lng));
      if (d < minDist) { minDist = d; nearest = p; }
    }
  }
  if (nearest) {
    drawRoute(userPos, [nearest.lat, nearest.lng]);
    speak(`أقرب صيدلية هي ${nearest.name}، بعيدة تقريباً ${Math.round(minDist)} متر. تبع الطريق على الخريطة`);
  } else speak("ما لقيتش صيدلية قريبة");
}

export function renderPharmaciesList(pharmacies, containerId, onSelectCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!pharmacies.length) { container.innerHTML = '<div class="empty-msg">لا توجد صيدليات</div>'; return; }
  container.innerHTML = pharmacies.map(p => `
    <div class="pharmacy-card ${p.is_on_duty ? 'on-duty' : ''}" data-id="${p.id}">
      <div class="pharmacy-name"><span>${p.name || ''}</span><span>${p.neighborhood || ''}</span></div>
      <div class="pharmacy-address"><i class="fas fa-location-dot"></i> ${p.address || ''}</div>
      <div class="pharmacy-phone"><i class="fas fa-phone"></i> ${p.phone || ''}</div>
      ${p.phone ? `<a href="tel:${p.phone}" class="call-btn">اتصل</a>` : ''}
    </div>
  `).join('');
  document.querySelectorAll('.pharmacy-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const ph = pharmacies.find(p => p.id == id);
      if (ph && userMarker) drawRoute(userMarker.getLatLng(), [ph.lat, ph.lng]);
      else if (!userMarker) speak("حدد موقعك أولاً");
    });
  });
}

export function updateStats(pharmacies) {
  const total = pharmacies.length;
  const open = pharmacies.filter(p => p.is_on_duty).length;
  const totalEl = document.getElementById('totalPharmacies');
  const openEl = document.getElementById('openNowCount');
  if (totalEl) totalEl.innerText = total;
  if (openEl) openEl.innerText = open;
}

export function getUniqueNeighborhoods(pharmacies) {
  return [...new Set(pharmacies.map(p => p.neighborhood).filter(Boolean))].sort();
}

// المساعد الصوتي بالدارجة
const synth = window.speechSynthesis;
export function speak(text) {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-MA';
  u.rate = 0.9;
  synth.cancel();
  synth.speak(u);
}
