// js/main.js - حالياً يدير الصيدليات فقط، للتوسع أضف وحدات جديدة بنفس النمط
import { renderPharmacies } from './modules/pharmacies.js';

// سجل الوحدات (يمكن إضافة realestate, reports, jobs لاحقاً)
const modules = {
  pharmacies: { btnId: 'btn-pharmacies', containerId: 'pharmacies-container', render: renderPharmacies }
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
  const btn = document.getElementById('btn-pharmacies');
  if (btn) btn.addEventListener('click', () => showModule('pharmacies'));
  showModule('pharmacies');
});
