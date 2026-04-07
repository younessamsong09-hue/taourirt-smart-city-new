export const initMap = (pharmacies) => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // إحداثيات مركز مدينة تاوريرت
    const taourirtCoords = [34.407, -2.897]; 
    
    // إنشاء الخريطة بنمط حديث
    const map = L.map('map', {
        zoomControl: false // سنضيف أزرار التحكم لاحقاً بشكل أجمل
    }).setView(taourirtCoords, 14);

    // إضافة طبقة الخريطة (CartoDB Dark Matter) لكي تناسب التصميم الداكن
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // إضافة الصيدليات إلى الخريطة إذا وجدت
    if (pharmacies && pharmacies.length > 0) {
        pharmacies.forEach(ph => {
            if (ph.lat && ph.lng) {
                const marker = L.marker([ph.lat, ph.lng]).addTo(map);
                marker.bindPopup(`<b>${ph.name}</b><br>${ph.address}`);
            }
        });
    }

    return map;
};
