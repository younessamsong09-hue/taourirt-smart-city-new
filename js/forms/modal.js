// js/forms/modal.js - نظام نوافذ منبثقة موحد
export function showModal(title, formHtml, onSubmit) {
  // إزالة أي مودال موجود
  const existing = document.querySelector('.smart-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'smart-modal';
  modal.innerHTML = `
    <div class="smart-modal-overlay"></div>
    <div class="smart-modal-container">
      <div class="smart-modal-header">
        <h3>${title}</h3>
        <button class="smart-modal-close">&times;</button>
      </div>
      <div class="smart-modal-body">
        ${formHtml}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.smart-modal-close');
  const overlay = modal.querySelector('.smart-modal-overlay');

  const closeModal = () => modal.remove();
  closeBtn.onclick = closeModal;
  overlay.onclick = closeModal;

  const form = modal.querySelector('form');
  if (form && onSubmit) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      await onSubmit(form, modal);
    };
  }
  return modal;
}
