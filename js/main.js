// js/main.js - يدير جميع الوحدات (صيدليات، عقارات، وظائف، تبليغات)
import { renderPharmacies } from './modules/pharmacies.js';
import { renderRealEstate } from './modules/real_estate.js';
import { renderJobs } from './modules/jobs.js';
import { renderReports } from './modules/reports.js';

const modules = {
  pharmacies: { btnId: 'btn-pharmacies', containerId: 'pharmacies-container', render: renderPharmacies },
  realestate: { btnId: 'btn-realestate', containerId: 'realestate-container', render: renderRealEstate },
  jobs: { btnId: 'btn-jobs', containerId: 'jobs-container', render: renderJobs },
  reports: { btnId: 'btn-reports', containerId: 'reports-container', render: renderReports }
};

function hideAll() {
  Object.values(modules).forEach(m => {
    const el = document.getElementById(m.containerId);
    if (el) el.style.display = 'none';
  });
}

async function showModule(key) {
  const mod = modules[key];
  if (!mod) return;
  hideAll();
  const container = document.getElementById(mod.containerId);
  if (container) container.style.display = 'block';
  await mod.render(mod.containerId);
}

document.addEventListener('DOMContentLoaded', () => {
  for (const [key, mod] of Object.entries(modules)) {
    const btn = document.getElementById(mod.btnId);
    if (btn) btn.addEventListener('click', () => showModule(key));
  }
  showModule('pharmacies'); // العرض الافتراضي
});
