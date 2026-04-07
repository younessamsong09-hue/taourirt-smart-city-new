import { renderPharmacies, fetchPharmacies } from './modules/pharmacies.js';
import { renderRealEstate, fetchRealEstate } from './modules/real_estate.js';
import { renderJobs, fetchJobs } from './modules/jobs.js';
import { renderReports, fetchReports } from './modules/reports.js';

// تعريف الوحدات
const modules = {
  pharmacies: { render: renderPharmacies, containerId: 'pharmacies-container', fetcher: fetchPharmacies, title: 'الصيدليات', hasAdd: false },
  realestate: { render: renderRealEstate, containerId: 'realestate-container', fetcher: fetchRealEstate, title: 'العقارات', hasAdd: true },
  jobs: { render: renderJobs, containerId: 'jobs-container', fetcher: fetchJobs, title: 'الوظائف', hasAdd: true },
  reports: { render: renderReports, containerId: 'reports-container', fetcher: fetchReports, title: 'التبليغات', hasAdd: true }
};

let currentTab = 'pharmacies';

// تحديث الإحصائيات
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

// تحديث التبويب الحالي
async function refreshCurrentTab() {
  const mod = modules[currentTab];
  if (mod && mod.render) {
    await mod.render(mod.containerId);
    await updateStats();
  }
}

// عرض تبويب معين
async function showTab(tabId) {
  if (!modules[tabId]) return;
  // تحديث الأزرار
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');
  // إخفاء وإظهار الحاويات
  document.querySelectorAll('.tab-container').forEach(container => container.classList.remove('active'));
  const container = document.getElementById(modules[tabId].containerId);
  if (container) container.classList.add('active');
  // تحديث العنوان وزر الإضافة
  document.getElementById('currentTitle').textContent = modules[tabId].title;
  const addBtn = document.getElementById('addNewBtn');
  if (modules[tabId].hasAdd) {
    addBtn.style.display = 'flex';
    // مؤقتاً نعرض رسالة لأن النماذج لم تضف بعد
    addBtn.onclick = () => alert('سيتم إضافة نموذج الإضافة قريباً');
  } else {
    addBtn.style.display = 'none';
  }
  currentTab = tabId;
  await modules[tabId].render(modules[tabId].containerId);
}

// تهيئة التنقل
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      showTab(tab);
    });
  });
}

// تهيئة الوضع المظلم
function initDarkMode() {
  const btn = document.getElementById('themeToggle');
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark');
    btn.innerHTML = '<i class="fas fa-sun"></i> الوضع الفاتح';
  } else {
    btn.innerHTML = '<i class="fas fa-moon"></i> الوضع المظلم';
  }
  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isNowDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isNowDark);
    btn.innerHTML = isNowDark ? '<i class="fas fa-sun"></i> الوضع الفاتح' : '<i class="fas fa-moon"></i> الوضع المظلم';
  });
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initDarkMode();
  await showTab('pharmacies');
  await updateStats();
  // تحديث كل 30 ثانية
  setInterval(updateStats, 30000);
});
