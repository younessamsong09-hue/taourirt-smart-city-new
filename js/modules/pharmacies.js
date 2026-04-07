import { supabaseConfig } from '../core/config.js';

let map, routingControl, userMarker;
let allPharmacies = [];
let currentRouteTarget = null;

// تهيئة الخريطة
export function initMap(containerId) {
  map = L.map(containerId).setView([34.416, -2.89], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }).addTo(map);
  return map;
}

// جلب الصيدليات من Supabase
export async function fetchPharmacies() {
  try {
    const res = await fetch(`${supabaseConfig.url}/rest/v1/pharmacies?select=*`, {
      headers: { apikey: supabaseConfig.anonKey, Authorization: `Bearer ${supabaseConfig.anonKey}` }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    allPharmacies = data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// عرض الصيدليات على الخريطة
export function displayPharmaciesOnMap(pharmacies) {
  if (!map) return;
  // إزالة الماركرات القديمة (غير routing)
  map.eachLayer(layer => {
    if (layer instanceof L.Marker && layer !== userMarker) map.removeLayer(layer);
  });
  pharmacies.forEach(p => {
    if (p.lat && p.lng) {
      const marker = L.marker([p.lat, p.lng])
        .bindPopup(`<b>${p.name}</b><br>${p.address}<br>${p.is_on_duty ? '🟢 مفتوحة' : '🔴 مغلقة'}`)
        .on('click', () => {
          // عند النقر على الماركر، نعرض المسار إذا كان المستخدم موجوداً
          if (userMarker) {
            drawRoute(userMarker.getLatLng(), [p.lat, p.lng]);
            currentRouteTarget = [p.lat, p.lng];
            speak(`هاد الصيدلية ديال ${p.name}، يمكن تمشيلها عبر الطريق اللي بان على الخريطة`);
          } else {
            speak("عافاك، ضغط على زر 'موقعي' باش نعرفو فين جاي");
          }
        });
      marker.addTo(map);
    }
  });
}

// رسم مسار بين نقطتين
export function drawRoute(start, end) {
  if (routingControl) {
    map.removeControl(routingControl);
  }
  routingControl = L.Routing.control({
    waypoints: [L.latLng(start.lat, start.lng), L.latLng(end[0], end[1])],
    routeWhileDragging: false,
    language: 'ar',
    showAlternatives: false,
    lineOptions: { styles: [{ color: '#2ecc71', weight: 5 }] }
  }).addTo(map);
  // تكبير لرؤية المسار
  const bounds = L.latLngBounds([start, end]);
  map.fitBounds(bounds);
}

// تحديد موقع المستخدم
export function locateUser() {
  if (!map) return;
  map.locate({ setView: true, maxZoom: 15 });
  map.on('locationfound', (e) => {
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(e.latlng, { icon: L.divIcon({ className: 'user-location', html: '<i class="fas fa-user"></i>', iconSize: [24,24] }) }).addTo(map);
    userMarker.bindPopup("أنت هنا").openPopup();
    speak("تما، لقيت موقعك. دابا يمكنك تختار صيدلية باش نعطيك الطريق");
  });
  map.on('locationerror', () => {
    speak("ما قدرتش نعرف موقعك. تأكد أن الخدمة مفعلة");
  });
}

// إيجاد أقرب صيدلية إلى المستخدم
export function findNearestPharmacy() {
  if (!userMarker) {
    speak("عافاك، ضغط على 'موقعي' أولاً باش نعرفو فين جاي");
    return;
  }
  if (allPharmacies.length === 0) return;
  let nearest = null;
  let minDist = Infinity;
  const userLatLng = userMarker.getLatLng();
  for (const p of allPharmacies) {
    if (p.lat && p.lng) {
      const dist = userLatLng.distanceTo(L.latLng(p.lat, p.lng));
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
  }
  if (nearest) {
    drawRoute(userLatLng, [nearest.lat, nearest.lng]);
    currentRouteTarget = [nearest.lat, nearest.lng];
    speak(`أقرب صيدلية هي ${nearest.name}، بعيدة تقريباً ${Math.round(minDist)} متر. تبع الطريق على الخريطة`);
  } else {
    speak("ما لقيتش صيدلية قريبة");
  }
}

// عرض قائمة الصيدليات في الشريط الجانبي
export function renderPharmaciesList(pharmacies, containerId, onSelectCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (pharmacies.length === 0) {
    container.innerHTML = '<div class="empty-msg">لا توجد صيدليات</div>';
    return;
  }
  container.innerHTML = pharmacies.map(p => `
    <div class="pharmacy-card ${p.is_on_duty ? 'on-duty' : ''}" data-id="${p.id}">
      <div class="pharmacy-name">
        <span>${p.name || 'بدون اسم'}</span>
        <span class="pharmacy-neighborhood">${p.neighborhood || ''}</span>
      </div>
      <div class="pharmacy-address"><i class="fas fa-location-dot"></i> ${p.address || ''}</div>
      <div class="pharmacy-phone"><i class="fas fa-phone"></i> ${p.phone || ''}</div>
      ${p.phone ? `<a href="tel:${p.phone}" class="call-btn">اتصل</a>` : ''}
    </div>
  `).join('');
  // إضافة حدث النقر على البطاقة لتحديد المسار
  document.querySelectorAll('.pharmacy-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const pharmacy = pharmacies.find(p => p.id == id);
      if (pharmacy && userMarker) {
        drawRoute(userMarker.getLatLng(), [pharmacy.lat, pharmacy.lng]);
        speak(`اخترتي ${pharmacy.name}. الطريق يبان على الخريطة`);
      } else if (!userMarker) {
        speak("عافاك، حدد موقعك أولاً باش نعطيك الطريق");
      }
    });
  });
}

// المساعد الصوتي بالدارجة
const synth = window.speechSynthesis;
export function speak(text) {
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-MA'; // دارجة مغربية
  utterance.rate = 0.9;
  synth.cancel();
  synth.speak(utterance);
}

// إحصائيات
export function updateStats(pharmacies) {
  const total = pharmacies.length;
  const open = pharmacies.filter(p => p.is_on_duty).length;
  const totalEl = document.getElementById('totalPharmacies');
  const openEl = document.getElementById('openNow');
  if (totalEl) totalEl.innerText = total;
  if (openEl) openEl.innerText = open;
}
