// js/main.js - يدير الصيدليات والعقارات بشكل منفصل، جاهز للتوسع
import { renderPharmacies } from './modules/pharmacies.js';
import { renderRealEstate } from './modules/real_estate.js';

const modules = {
  pharmacies: { btnId: 'btn-pharmacies', containerId: 'pharmacies-container', render: renderPharmacies },
  realestate: { btnId: 'btn-realestate', containerId: 'realestate-container', render: renderRealEstate }
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
  // إضافة مستمعي الأزرار
  for (const [key, mod] of Object.entries(modules)) {
    const btn = document.getElementById(mod.btnId);
    if (btn) btn.addEventListener('click', () => showModule(key));
  }
  // عرض الصيدليات افتراضياً
  showModule('pharmacies');
});
