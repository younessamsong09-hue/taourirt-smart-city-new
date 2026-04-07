// js/forms/realestate_form.js
import { supabaseConfig } from '../core/config.js';
import { showModal } from './modal.js';

export function showAddRealEstateForm(onSuccess) {
  const formHtml = `
    <form id="add-realestate-form">
      <label>العنوان *</label>
      <input type="text" name="title" required>
      <label>الموقع</label>
      <input type="text" name="location">
      <label>السعر (د.م)</label>
      <input type="text" name="price">
      <label>النوع</label>
      <select name="property_type">
        <option value="for_sale">للبيع</option>
        <option value="for_rent">للكراء</option>
      </select>
      <label>رقم الهاتف</label>
      <input type="tel" name="phone">
      <button type="submit">➕ إضافة العقار</button>
    </form>
  `;

  showModal('➕ إضافة عقار جديد', formHtml, async (form, modal) => {
    const formData = new FormData(form);
    const data = {
      title: formData.get('title'),
      location: formData.get('location'),
      price: formData.get('price'),
      property_type: formData.get('property_type'),
      phone: formData.get('phone'),
      created_at: new Date().toISOString()
    };

    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/real_estate`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      modal.remove();
      if (onSuccess) onSuccess();
      alert('✅ تم إضافة العقار بنجاح');
    } else {
      const err = await res.text();
      alert('❌ فشل الإضافة: ' + err);
    }
  });
}
