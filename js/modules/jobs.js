// js/modules/jobs.js
import { supabaseConfig } from '../core/config.js';

export async function fetchJobs() {
  try {
    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/jobs?select=*`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('❌ فشل جلب الوظائف:', err);
    return [];
  }
}

// ترتيب: الأحدث أولاً (حسب تاريخ النشر)
export function sortByDate(jobs) {
  return [...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

function createCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  card.innerHTML = `
    <h3 class="job-title">${escapeHtml(job.title || 'وظيفة بدون عنوان')}</h3>
    <p class="job-company">🏢 ${escapeHtml(job.company || 'الشركة غير محددة')}</p>
    <p class="job-location">📍 ${escapeHtml(job.location || 'الموقع غير محدد')}</p>
    <p class="job-type">📌 ${escapeHtml(job.job_type || 'نوع الوظيفة غير محدد')}</p>
    <p class="job-description">${escapeHtml(job.description || 'لا يوجد وصف')}</p>
    ${job.contact ? `<a href="mailto:${escapeHtml(job.contact)}" class="apply-button">📧 تقدم الآن</a>` : ''}
  `;
  return card;
}

export async function renderJobs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">⏳ جاري تحميل الوظائف...</div>';
  const jobs = await fetchJobs();
  const sorted = sortByDate(jobs);
  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-message">💼 لا توجد وظائف مسجلة حالياً</div>';
    return;
  }
  container.innerHTML = '';
  sorted.forEach(job => container.appendChild(createCard(job)));
}
