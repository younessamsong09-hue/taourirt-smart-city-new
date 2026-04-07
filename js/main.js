import { renderPharmacies, fetchPharmacies } from './modules/pharmacies.js';
import { renderRealEstate, fetchRealEstate } from './modules/real_estate.js';
import { renderJobs, fetchJobs } from './modules/jobs.js';
import { renderReports, fetchReports } from './modules/reports.js';
import { showAddRealEstateForm } from './forms/realestate_form.js';
import { showAddJobForm } from './forms/jobs_form.js';
import { showAddReportForm } from './forms/reports_form.js';

const modules = {
  pharmacies: { render: renderPharmacies, containerId: 'pharmacies-container', fetcher: fetchPharmacies, addForm: null },
  realestate: { render: renderRealEstate, containerId: 'realestate-container', fetcher: fetchRealEstate, addForm: showAddRealEstateForm },
  jobs: { render: renderJobs, containerId: 'jobs-container', fetcher: fetchJobs, addForm: showAddJobForm },
  reports: { render: renderReports, containerId: 'reports-container', fetcher: fetchReports, addForm: showAddReportForm }
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

async function refreshCurrentTab() {
  const mod = modules[currentTab];
  if (mod && mod.render) {
    await mod.render(mod.containerId);
    await updateStats();
  }
}

async function showTab(tabId) {
  if (!modules[tabId]) return;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
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

function initAddButtons() {
  // إضافة أزرار "إضافة جديدة" بجانب كل تبويب (ستظهر في واجهة المستخدم)
  const tabsContainer = document.querySelector('.tabs-container');
  if (!tabsContainer) return;

  for (const [key, mod] of Object.entries(modules)) {
    if (mod.addForm) {
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ إضافة';
      addBtn.className = 'add-btn';
      addBtn.setAttribute('data-tab', key);
      addBtn.style.background = 'var(--secondary)';
      addBtn.style.color = '#1e2a3e';
      addBtn.style.borderRadius = '40px';
      addBtn.style.padding = '0.5rem 1rem';
      addBtn.style.margin = '0 0.2rem';
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mod.addForm(() => refreshCurrentTab());
      });
      tabsContainer.appendChild(addBtn);
    }
  }
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
  initAddButtons();
  await showTab('pharmacies');
  await updateStats();
  setInterval(updateStats, 30000);
});
