import { renderPharmacies, fetchPharmacies } from './modules/pharmacies.js';
import { renderRealEstate, fetchRealEstate } from './modules/real_estate.js';
import { renderJobs, fetchJobs } from './modules/jobs.js';
import { renderReports, fetchReports } from './modules/reports.js';

const modules = {
  pharmacies: { render: renderPharmacies, containerId: 'pharmacies-container', fetcher: fetchPharmacies },
  realestate: { render: renderRealEstate, containerId: 'realestate-container', fetcher: fetchRealEstate },
  jobs: { render: renderJobs, containerId: 'jobs-container', fetcher: fetchJobs },
  reports: { render: renderReports, containerId: 'reports-container', fetcher: fetchReports }
};

let currentTab = 'pharmacies';

async function updateStats() {
  const stats = {
    pharmacies: (await fetchPharmacies()).length,
    realestate: (await fetchRealEstate()).length,
    jobs: (await fetchJobs()).length,
    reports: (await fetchReports()).length
  };
  for (const [key, value] of Object.entries(stats)) {
    const el = document.getElementById(`stat-${key}`);
    if (el) el.textContent = value;
  }
}

async function showTab(tabId) {
  if (!modules[tabId]) return;
  // إخفاء الكل
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  // إظهار الجديد
  const container = document.getElementById(modules[tabId].containerId);
  if (container) container.classList.add('active');
  const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  currentTab = tabId;
  await modules[tabId].render(modules[tabId].containerId);
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      showTab(tab);
    });
  });
}

function initDarkMode() {
  const btn = document.getElementById('theme-toggle-btn');
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.body.classList.add('dark');
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initDarkMode();
  await showTab('pharmacies');
  await updateStats();
  // تحديث الإحصائيات كل 30 ثانية
  setInterval(updateStats, 30000);
});
