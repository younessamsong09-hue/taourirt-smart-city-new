// js/modules/reports.js
import { supabaseConfig } from '../core/config.js';

export async function fetchReports() {
  try {
    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/reports?select=*`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ فشل جلب التبليغات:', err);
    return [];
  }
}

// ترتيب: الأحدث أولاً
export function sortByDate(reports) {
  return [...reports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

function getStatusBadge(status) {
  const statuses = {
    pending: '⏳ قيد المراجعة',
    in_progress: '🔧 قيد المعالجة',
    resolved: '✅ تم الحل',
    rejected: '❌ مرفوض'
  };
  return statuses[status] || '📝 جديد';
}

function createCard(report) {
  const card = document.createElement('div');
  card.className = 'report-card';
  card.innerHTML = `
    <h3 class="report-title">${escapeHtml(report.title || 'بلاغ بدون عنوان')}</h3>
    <p class="report-location">📍 ${escapeHtml(report.location || 'الموقع غير محدد')}</p>
    <p class="report-description">${escapeHtml(report.description || 'لا يوجد وصف')}</p>
    <div class="report-status ${escapeHtml(report.status || 'pending')}">${getStatusBadge(report.status)}</div>
    ${report.image_url ? `<img src="${escapeHtml(report.image_url)}" class="report-image" alt="صورة البلاغ" loading="lazy">` : ''}
    <small class="report-date">📅 ${new Date(report.created_at).toLocaleDateString('ar-EG')}</small>
  `;
  return card;
}

export async function renderReports(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">⏳ جاري تحميل التبليغات...</div>';
  const reports = await fetchReports();
  const sorted = sortByDate(reports);
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-message">📭 لا توجد تبليغات مسجلة حالياً</div>';
    return;
  }
  container.innerHTML = '';
  sorted.forEach(report => container.appendChild(createCard(report)));
}
