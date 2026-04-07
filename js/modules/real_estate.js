// js/modules/real_estate.js
import { supabaseConfig } from '../core/config.js';

export async function fetchRealEstate() {
  try {
    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/real_estate?select=*`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ فشل جلب العقارات:', err);
    return [];
  }
}

// ترتيب: للبيع أولاً ثم الكراء، أو حسب السعر
export function sortByType(properties) {
  const order = { for_sale: 1, for_rent: 2 };
  return [...properties].sort((a, b) => (order[a.property_type] || 3) - (order[b.property_type] || 3));
}

function createCard(p) {
  const card = document.createElement('div');
  card.className = 'realestate-card';
  const typeText = p.property_type === 'for_sale' ? '🏷️ للبيع' : '🔑 للكراء';
  card.innerHTML = `
    <h3 class="realestate-title">${escapeHtml(p.title || 'عقار بدون عنوان')}</h3>
    <p class="realestate-location">📍 ${escapeHtml(p.location || 'الموقع غير محدد')}</p>
    <p class="realestate-price">💰 ${escapeHtml(p.price || 'سعر غير محدد')} د.م.</p>
    <p class="realestate-type">${typeText}</p>
    ${p.phone ? `<a href="tel:${escapeHtml(p.phone)}" class="contact-button">📞 اتصل بالمالك</a>` : ''}
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

export async function renderRealEstate(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">⏳ جاري تحميل العقارات...</div>';
  const properties = await fetchRealEstate();
  const sorted = sortByType(properties);
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-message">🏠 لا توجد عقارات مسجلة حالياً</div>';
    return;
  }
  container.innerHTML = '';
  sorted.forEach(p => container.appendChild(createCard(p)));
}
