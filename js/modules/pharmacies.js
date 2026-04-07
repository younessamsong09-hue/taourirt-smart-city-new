// js/modules/pharmacies.js
import { supabaseConfig } from '../core/config.js';

export async function fetchPharmacies() {
  try {
    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/pharmacies?select=*`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ فشل جلب الصيدليات:', err);
    return [];
  }
}

export function sortByDuty(pharmacies) {
  return [...pharmacies].sort((a,b) => (a.is_on_duty === b.is_on_duty) ? 0 : a.is_on_duty ? -1 : 1);
}

function createCard(p) {
  const card = document.createElement('div');
  card.className = 'pharmacy-card' + (p.is_on_duty ? ' on-duty' : '');
  card.innerHTML = `
    <h3 class="pharmacy-name">${escapeHtml(p.name || 'بدون اسم')}</h3>
    <p class="pharmacy-address">📍 ${escapeHtml(p.address || 'عنوان غير متوفر')}</p>
    <p class="pharmacy-phone">📞 ${escapeHtml(p.phone || 'رقم غير متوفر')}</p>
    ${p.is_on_duty ? '<span class="duty-badge">🟢 صيدلية حراسة</span>' : ''}
    ${p.phone ? `<a href="tel:${escapeHtml(p.phone)}" class="call-button">📱 اتصل الآن</a>` : '<button class="call-button disabled" disabled>🚫 لا يوجد رقم</button>'}
  `;
  return card;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

export async function renderPharmacies(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">⏳ جاري التحميل...</div>';
  const pharmacies = await fetchPharmacies();
  const sorted = sortByDuty(pharmacies);
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-message">📭 لا توجد صيدليات مسجلة</div>';
    return;
  }
  container.innerHTML = '';
  sorted.forEach(p => container.appendChild(createCard(p)));
}
