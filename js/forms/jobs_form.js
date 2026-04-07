import { supabaseConfig } from '../core/config.js';
import { showModal } from './modal.js';

export function showAddJobForm(onSuccess) {
  const formHtml = `
    <form id="add-job-form">
      <label>عنوان الوظيفة *</label>
      <input type="text" name="title" required>
      <label>اسم الشركة</label>
      <input type="text" name="company">
      <label>الموقع</label>
      <input type="text" name="location">
      <label>نوع الوظيفة (مثلاً: دوام كامل، عن بعد)</label>
      <input type="text" name="job_type">
      <label>وصف مختصر</label>
      <textarea name="description" rows="3"></textarea>
      <label>وسيلة التواصل (بريد إلكتروني أو هاتف)</label>
      <input type="text" name="contact">
      <button type="submit">➕ إضافة الوظيفة</button>
    </form>
  `;

  showModal('➕ إضافة وظيفة جديدة', formHtml, async (form, modal) => {
    const formData = new FormData(form);
    const data = {
      title: formData.get('title'),
      company: formData.get('company'),
      location: formData.get('location'),
      job_type: formData.get('job_type'),
      description: formData.get('description'),
      contact: formData.get('contact'),
      created_at: new Date().toISOString()
    };

    const { url, anonKey } = supabaseConfig;
    const res = await fetch(`${url}/rest/v1/jobs`, {
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
      alert('✅ تم إضافة الوظيفة بنجاح');
    } else {
      const err = await res.text();
      alert('❌ فشل الإضافة: ' + err);
    }
  });
}
