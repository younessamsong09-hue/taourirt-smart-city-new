import { renderPharmacies, fetchPharmacies } from './modules/pharmacies.js';
import { renderRealEstate, fetchRealEstate } from './modules/real_estate.js';
import { renderJobs, fetchJobs } from './modules/jobs.js';
import { renderReports, fetchReports } from './modules/reports.js';
import { showAddRealEstateForm } from './forms/realestate_form.js';
import { showAddJobForm } from './forms/jobs_form.js';
import { showAddReportForm } from './forms/reports_form.js';
import { initParticleNetwork } from './effects/particles.js';

const modules = {
  pharmacies: { render: renderPharmacies, containerId: 'pharmacies-container', fetcher: fetchPharmacies, addForm: null, title: 'الصيدليات' },
  realestate: { render: renderRealEstate, containerId: 'realestate-container', fetcher: fetchRealEstate, addForm: showAddRealEstateForm, title: 'العقارات' },
  jobs: { render: renderJobs, containerId: 'jobs-container', fetcher: fetchJobs, addForm: showAddJobForm, title: 'الوظائف' },
  reports: { render: renderReports, containerId: 'reports-container', fetcher: fetchReports, addForm: showAddReportForm, title: 'التبليغات' }
};

let currentTab = 'pharmacies';

function animateNumber(element, target) {
  if (!element) return;
  let current = 0;
  const step = Math.ceil(target / 30);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      element.textContent = target;
      clearInterval(interval);
    } else {
      element.textContent = current;
    }
  }, 20);
}

async function updateStats() {
  const stats = {
    pharmacies: (await fetchPharmacies()).length,
    realestate: (await fetchRealEstate()).length,
    jobs: (await fetchJobs()).length,
    reports: (await fetchReports()).length
  };
  for (const [key, value] of Object.entries(stats)) {
    const el = document.getElementById(`stat-${key}`);
    if (el) animateNumber(el, value);
  }
}

async function refreshCurrentTab() {
  const mod = modules[currentTab];
  if (mod && mod.render) {
    await mod.render(mod.containerId);
    await updateStats();
  }
}

// تأثير الكتابة على العنوان
function typeWriter(text, element, speed = 60) {
  let i = 0;
  element.textContent = '';
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

async function showTab(tabId) {
  if (!modules[tabId]) return;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeNav) activeNav.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const container = document.getElementById(modules[tabId].containerId);
  if (container) container.classList.add('active');
  const titleEl = document.getElementById('current-tab-title');
  const newTitle = modules[tabId].title;
  typeWriter(newTitle, titleEl, 50);
  const addBtn = document.getElementById('add-btn-main');
  if (modules[tabId].addForm) {
    addBtn.style.display = 'flex';
    addBtn.onclick = () => modules[tabId].addForm(() => refreshCurrentTab());
  } else {
    addBtn.style.display = 'none';
  }
  currentTab = tabId;
  await modules[tabId].render(modules[tabId].containerId);
}

function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      showTab(tab);
    });
  });
}

function initDarkMode() {
  const btn = document.getElementById('theme-toggle-sidebar');
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.body.classList.add('dark');
  btn.innerHTML = isDark ? '<i class="fas fa-sun"></i> الوضع الفاتح' : '<i class="fas fa-moon"></i> الوضع المظلم';
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isNowDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isNowDark);
    btn.innerHTML = isNowDark ? '<i class="fas fa-sun"></i> الوضع الفاتح' : '<i class="fas fa-moon"></i> الوضع المظلم';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initParticleNetwork();
  initNav();
  initDarkMode();
  await showTab('pharmacies');
  await updateStats();
  setInterval(updateStats, 30000);
});
