import { supabaseConfig } from '../core/config.js';
import { showModal } from './modal.js';

export function showAddReportForm(onSuccess) {
  const formHtml = `
    <form id="add-report-form">
      <label>عنوان البلاغ *</label>
      <input type="text" name="title" required>
      <label>الموقع</label>
      <input type="text" name="location">
      <label>وصف المشكلة</label>
      <textarea name="description" rows="3" required></textarea>
      <label>رابط صورة (اختياري)</label>
      <input type="url" name="image_url">
      <button type="submit">📢 إرسال البلاغ</button>
    </form>
  `;

  showModal('📢 إضافة بلاغ جديد', formHtml, async (form, modal) => {
    const formData = new FormData(form);
    const data = {
      title: formData.get('title'),
      location: formData.get('location'),
      description: formData.get('description'),
      image_url: formData.get('image_url') || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/reports`, {
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
      alert('✅ تم إرسال البلاغ بنجاح');
    } else {
      const err = await res.text();
      alert('❌ فشل إرسال البلاغ: ' + err);
    }
  });
}
