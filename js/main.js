import { initPharmacies } from './modules/pharmacies.js';
import { initMap } from './modules/map.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("نظام تاوريرت الحديث ينطلق... 🚀");
    
    // 1. جلب بيانات الصيدليات (سنقوم بتحديث pharmacies.js لجعلها تعيد البيانات)
    const pharmacies = await initPharmacies();
    
    // 2. تشغيل الخريطة وعرض الصيدليات عليها
    initMap(pharmacies);
});
