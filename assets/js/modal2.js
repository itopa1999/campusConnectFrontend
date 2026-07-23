
/**
 * FORM MODAL CONTROLLER
 */
class FormModal {
  constructor() {
    this.modal = document.getElementById('formModal');
    this.titleEl = document.getElementById('formModalTitle');
    this.bodyEl = document.getElementById('formModalBody');
    this.footerEl = document.getElementById('formModalFooter');
    this.closeBtn = document.getElementById('closeFormModalBtn');
    this.isOpen = false;

    // Close on background click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    this.closeBtn.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open({ title, formHtml, onSubmit, submitLabel = 'Submit', cancelLabel = 'Cancel', onClose = null }) {
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = `<form id="dynamicFormModalForm">${formHtml}</form>`;
    
    // Build footer buttons
    this.footerEl.innerHTML = '';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelLabel;
    cancelBtn.className = 'btn-secondary';
    cancelBtn.addEventListener('click', () => this.close());
    
    const submitBtn = document.createElement('button');
    submitBtn.textContent = submitLabel;
    submitBtn.className = 'btn-primary';
    submitBtn.addEventListener('click', async () => {
      const form = document.getElementById('dynamicFormModalForm');
      if (onSubmit) await onSubmit(form);
    });
    
    this.footerEl.appendChild(cancelBtn);
    this.footerEl.appendChild(submitBtn);
    
    this.onCloseCallback = onClose;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.isOpen = false;
    if (this.onCloseCallback) this.onCloseCallback();
  }
}

/**
 * CONFIRMATION MODAL CONTROLLER
 */
class ConfirmModal {
  constructor() {
    this.modal = document.getElementById('confirmModal');
    this.titleEl = document.getElementById('confirmModalTitle');
    this.messageEl = document.getElementById('confirmMessage');
    this.footerEl = document.getElementById('confirmModalFooter');
    this.closeBtn = document.getElementById('closeConfirmModalBtn');
    this.isOpen = false;

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    this.closeBtn.addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  open({ title = 'Confirm Action', message, onConfirm, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel' }) {
    this.titleEl.textContent = title;
    this.messageEl.textContent = message;
    
    this.footerEl.innerHTML = '';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelText;
    cancelBtn.className = 'btn-secondary';
    cancelBtn.addEventListener('click', () => {
      if (onCancel) onCancel();
      this.close();
    });
    
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = 'btn-primary';
    if (confirmText.toLowerCase().includes('delete')) confirmBtn.classList.add('btn-danger');
    confirmBtn.addEventListener('click', async () => {
      if (onConfirm) await onConfirm();
      this.close();
    });
    
    this.footerEl.appendChild(cancelBtn);
    this.footerEl.appendChild(confirmBtn);
    
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }

  close() {
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
    this.isOpen = false;
  }
}

// Create global instances
const formModal = new FormModal();
const confirmModal = new ConfirmModal();