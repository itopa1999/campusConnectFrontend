// ============================================================
// modal.js – Style-Driven Modal Component for CampusHub
// Designed to work seamlessly with light/dark mode via CSS variables
//
// 🔥 Quick Examples:
//   Delete:   new Modal({ title: 'Delete?', body: '...', type: 'danger', confirmText: 'Delete' })
//   Warning:  new Modal({ title: 'Warning', body: '...', type: 'warning', confirmText: 'Proceed' })
//   Confirm:  new Modal({ title: 'Confirm', body: '...', type: 'success', confirmText: 'OK' })
//
// 🚀 Form Validation Integration:
//   const result = await Modal.confirmForm({
//     title: 'Submit Feedback',
//     formHtml: '<input class="form-input" ...>',
//     onValidate: (data) => { ... } // optional extra validation
//   });
//   if (result) { console.log('Submitted:', result); }
// ============================================================

class Modal {
    /**
     * @param {Object} options
     * @param {string} options.title - Title text
     * @param {string} [options.header] - Custom header HTML (overrides title & close)
     * @param {string} options.body - Main content HTML
     * @param {string} [options.footer] - Custom footer HTML (overrides buttons)
     * @param {string} [options.type='default'] - 'default' | 'danger' | 'warning' | 'success' | 'info'
     * @param {string} [options.confirmText='Confirm'] - Text for the confirm button
     * @param {string} [options.cancelText='Cancel'] - Text for the cancel button
     * @param {boolean} [options.showConfirm=true] - Show confirm button
     * @param {boolean} [options.showCancel=true] - Show cancel button
     * @param {boolean} [options.showClose=true] - Show close (X) button in header
     * @param {Function} [options.onConfirm] - Callback when confirm is clicked. Return `false` to prevent closing.
     * @param {Function} [options.onCancel] - Callback when cancel is clicked. Return `false` to prevent closing.
     * @param {string} [options.size='md'] - 'sm' | 'md' | 'lg'
     * @param {boolean} [options.closeOnOverlay=true] - Close when clicking overlay
     * @param {boolean} [options.closeOnEsc=true] - Close when pressing ESC
     * @param {Function} [options.onOpen] - Callback after modal opens
     * @param {Function} [options.onClose] - Callback after modal closes
     */
    constructor(options) {
        const defaultOptions = {
            title: '',
            header: null,
            body: '',
            footer: null,
            type: 'default',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showConfirm: true,
            showCancel: true,
            showClose: true,
            onConfirm: null,
            onCancel: null,
            size: 'md',
            closeOnOverlay: true,
            closeOnEsc: true,
            onOpen: null,
            onClose: null,
        };

        this.options = { ...defaultOptions, ...options };
        this.isOpen = false;
        this._element = null;
        this._overlay = null;
        this._escHandler = null;

        // ─── Theme configuration ──────────────────────────────
        this.themes = {
            danger: { btnClass: 'modal-btn-danger', icon: 'fa-triangle-exclamation' },
            warning: { btnClass: 'modal-btn-warning', icon: 'fa-triangle-exclamation' },
            success: { btnClass: 'modal-btn-success', icon: 'fa-circle-check' },
            info: { btnClass: 'modal-btn-info', icon: 'fa-circle-info' },
            default: { btnClass: 'modal-btn-primary', icon: 'fa-circle-check' },
        };

        this._build();
    }

    /**
     * Build the modal DOM structure
     */
    _build() {
        if (this._element) {
            this._element.remove();
            this._overlay?.remove();
        }

        const theme = this.themes[this.options.type] || this.themes.default;

        // --- Overlay ---
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            backdrop-filter: blur(4px);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        this._overlay = overlay;

        // --- Modal Container ---
        const modal = document.createElement('div');
        modal.className = `modal-container modal-${this.options.type}`;
        modal.style.cssText = `
            background: var(--bg-card, #ffffff);
            border-radius: var(--radius-card, 18px);
            max-width: 560px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            transform: scale(0.95) translateY(10px);
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
            border: 1px solid var(--border-card, #f0f0f0);
            overflow: hidden;
        `;

        if (this.options.size === 'sm') modal.style.maxWidth = '400px';
        else if (this.options.size === 'lg') modal.style.maxWidth = '720px';

        // --- Header ---
        let header = null;
        if (this.options.header) {
            header = document.createElement('div');
            header.className = 'modal-header custom-header';
            header.style.cssText = `
                padding: 20px 24px 16px;
                border-bottom: 1px solid var(--border-color, #f0f0f0);
                flex-shrink: 0;
            `;
            header.innerHTML = this.options.header;
        } else {
            header = document.createElement('div');
            header.className = 'modal-header';
            header.style.cssText = `
                padding: 20px 24px 16px;
                border-bottom: 1px solid var(--border-color, #f0f0f0);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            `;
            header.innerHTML = `
                <h3 style="
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--text-primary, #1a1a1a);
                    margin: 0;
                    letter-spacing: -0.3px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    ${this.options.type !== 'default' ? `<i class="fa-solid ${theme.icon}"></i>` : ''}
                    ${this.options.title}
                </h3>
                ${this.options.showClose ? `
                    <button class="modal-close-btn" style="
                        background: none;
                        border: none;
                        font-size: 22px;
                        color: var(--text-muted2, #8e8e93);
                        cursor: pointer;
                        padding: 4px 8px;
                        border-radius: 8px;
                        transition: background 0.2s, color 0.2s;
                        line-height: 1;
                    ">&times;</button>
                ` : ''}
            `;
            const closeBtn = header.querySelector('.modal-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }

        // --- Body ---
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 24px;
            overflow-y: auto;
            flex: 1;
            color: var(--text-secondary, #4a4a4a);
            font-size: 14px;
            line-height: 1.6;
        `;
        body.innerHTML = this.options.body;

        // --- Footer ---
        let footer = null;
        if (this.options.footer) {
            footer = document.createElement('div');
            footer.className = 'modal-footer';
            footer.style.cssText = `
                padding: 16px 24px 24px;
                border-top: 1px solid var(--border-color, #f0f0f0);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-shrink: 0;
                flex-wrap: wrap;
            `;
            footer.innerHTML = this.options.footer;
        } else if (this.options.showConfirm || this.options.showCancel) {
            footer = document.createElement('div');
            footer.className = 'modal-footer';
            footer.style.cssText = `
                padding: 16px 24px 24px;
                border-top: 1px solid var(--border-color, #f0f0f0);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-shrink: 0;
                flex-wrap: wrap;
            `;

            let html = '';
            if (this.options.showCancel) {
                html += `
                    <button class="modal-cancel-btn btn-reset" style="
                        padding: 10px 24px;
                        border-radius: 30px;
                        font-size: 14px;
                        font-weight: 600;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s;
                        background: var(--bg-input, #f3f4f6);
                        color: var(--text-secondary, #4a4a4a);
                    ">${this.options.cancelText}</button>
                `;
            }
            if (this.options.showConfirm) {
                html += `
                    <button class="modal-confirm-btn ${theme.btnClass}">${this.options.confirmText}</button>
                `;
            }
            footer.innerHTML = html;
        }

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        if (footer) modal.appendChild(footer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        this._element = modal;
        this._overlay = overlay;

        // --- Event Listeners ---

        if (this.options.closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        if (this.options.closeOnEsc) {
            this._escHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            };
            document.addEventListener('keydown', this._escHandler);
        }

        const confirmBtn = footer?.querySelector('.modal-confirm-btn');
        const cancelBtn = footer?.querySelector('.modal-cancel-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                if (typeof this.options.onConfirm === 'function') {
                    const result = this.options.onConfirm(this, e);
                    if (result !== false) {
                        this.close();
                    }
                } else {
                    this.close();
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                if (typeof this.options.onCancel === 'function') {
                    const result = this.options.onCancel(this, e);
                    if (result !== false) {
                        this.close();
                    }
                } else {
                    this.close();
                }
            });
        }
    }

    /**
     * Open the modal
     */
    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        const overlay = this._overlay;
        const modal = this._element;

        overlay.style.display = 'flex';
        void overlay.offsetWidth;
        overlay.style.opacity = '1';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1) translateY(0)';

        document.body.style.overflow = 'hidden';

        if (typeof this.options.onOpen === 'function') {
            this.options.onOpen(this);
        }
    }

    /**
     * Close the modal
     */
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;

        const overlay = this._overlay;
        const modal = this._element;

        overlay.style.opacity = '0';
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95) translateY(10px)';

        setTimeout(() => {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);

        if (typeof this.options.onClose === 'function') {
            this.options.onClose(this);
        }
    }

    /**
     * Destroy the modal (remove from DOM)
     */
    destroy() {
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        if (this._overlay) {
            this._overlay.remove();
            this._overlay = null;
        }
        this._element = null;
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    /**
     * Update modal content dynamically
     */
    setContent(options) {
        const bodyEl = this._element?.querySelector('.modal-body');
        const headerEl = this._element?.querySelector('.modal-header h3');
        const footerEl = this._element?.querySelector('.modal-footer');

        if (options.title && headerEl) {
            const theme = this.themes[this.options.type] || this.themes.default;
            const icon = theme.icon || '';
            headerEl.innerHTML = `
                ${this.options.type !== 'default' ? `<i class="fa-solid ${icon}"></i>` : ''}
                ${options.title}
            `;
            this.options.title = options.title;
        }
        if (options.body && bodyEl) {
            bodyEl.innerHTML = options.body;
            this.options.body = options.body;
        }
        if (options.footer !== undefined && footerEl) {
            footerEl.innerHTML = options.footer;
            this.options.footer = options.footer;
        } else if (options.footer === null && footerEl) {
            footerEl.remove();
            this.options.footer = null;
        }
    }

    // ============================================================
    // 🚀 FORM INTEGRATION
    // ============================================================

    /**
     * Embed a form into the modal body and attach validation using CampusForms.
     * @param {string|HTMLFormElement} formHtmlOrEl - HTML string or DOM element of the form.
     * @param {Object} [options] - Additional options.
     * @param {Function} [options.onValidate] - Extra validation callback, receives form data.
     * @param {Function} [options.onSubmit] - Custom submit handler (instead of default).
     * @param {string} [options.submitText='Submit'] - Text for the submit button.
     * @param {string} [options.cancelText='Cancel'] - Text for the cancel button.
     * @returns {this} - The modal instance (chainable).
     */
    setForm(formHtmlOrEl, options = {}) {
        // Build form HTML if string, or clone element
        let formEl;
        if (typeof formHtmlOrEl === 'string') {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = formHtmlOrEl;
            formEl = wrapper.querySelector('form');
            if (!formEl) {
                throw new Error('setForm: No <form> element found in the provided HTML.');
            }
        } else if (formHtmlOrEl instanceof HTMLFormElement) {
            formEl = formHtmlOrEl.cloneNode(true);
        } else {
            throw new Error('setForm: Expected a string or HTMLFormElement.');
        }

        // Ensure form has novalidate to use CampusForms
        formEl.setAttribute('novalidate', '');

        // Inject form into modal body
        const bodyEl = this._element?.querySelector('.modal-body');
        if (!bodyEl) throw new Error('Modal body not found.');
        bodyEl.innerHTML = '';
        bodyEl.appendChild(formEl);

        // Adjust footer: show submit/cancel
        const theme = this.themes[this.options.type] || this.themes.default;
        const footer = this._element?.querySelector('.modal-footer');
        if (footer) {
            footer.innerHTML = `
                <button class="modal-cancel-btn btn-reset" style="
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--bg-input, #f3f4f6);
                    color: var(--text-secondary, #4a4a4a);
                ">${options.cancelText || this.options.cancelText || 'Cancel'}</button>
                <button class="modal-confirm-btn ${theme.btnClass}" id="modalFormSubmit">${options.submitText || 'Submit'}</button>
            `;
        } else {
            // If no footer, create one
            const newFooter = document.createElement('div');
            newFooter.className = 'modal-footer';
            newFooter.style.cssText = `
                padding: 16px 24px 24px;
                border-top: 1px solid var(--border-color, #f0f0f0);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-shrink: 0;
                flex-wrap: wrap;
            `;
            newFooter.innerHTML = `
                <button class="modal-cancel-btn btn-reset" style="
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: var(--bg-input, #f3f4f6);
                    color: var(--text-secondary, #4a4a4a);
                ">${options.cancelText || this.options.cancelText || 'Cancel'}</button>
                <button class="modal-confirm-btn ${theme.btnClass}" id="modalFormSubmit">${options.submitText || 'Submit'}</button>
            `;
            this._element?.appendChild(newFooter);
        }

        // Re-bind events
        const submitBtn = this._element?.querySelector('#modalFormSubmit');
        const cancelBtnEl = this._element?.querySelector('.modal-cancel-btn');

        // Store form validation state
        let formData = null;
        const validate = (e) => {
            e.preventDefault();
            const validationResult = window.CampusForms?.validateForm(formEl);
            if (!validationResult || !validationResult.isValid) {
                // Show error messages already handled by helper
                return false;
            }
            // Gather form data
            const data = new FormData(formEl);
            const obj = {};
            data.forEach((value, key) => { obj[key] = value; });

            // Custom validation
            if (typeof options.onValidate === 'function') {
                const extra = options.onValidate(obj, formEl);
                if (extra === false) return false;
                if (typeof extra === 'object') Object.assign(obj, extra);
            }
            formData = obj;
            return true;
        };

        // Submit handler
        const onSubmit = (e) => {
            if (options.onSubmit) {
                // Custom submit handler
                options.onSubmit(e, formEl, this);
                return;
            }
            if (validate(e)) {
                // Close modal with success
                this.options.onConfirm = () => {
                    // Return the data via the modal's result mechanism
                    this._result = formData;
                };
                this.close();
            }
        };

        submitBtn?.addEventListener('click', onSubmit);
        cancelBtnEl?.addEventListener('click', () => {
            this._result = null;
            this.close();
        });

        // Also allow Enter key on form fields
        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            onSubmit(e);
        });

        return this;
    }

    /**
     * Get the result of a form modal (resolves after close).
     * Used with setForm() – returns form data if confirmed, null if cancelled.
     * @returns {Promise<any>}
     */
    getFormResult() {
        return new Promise((resolve) => {
            const originalClose = this.close.bind(this);
            this.close = () => {
                originalClose();
                resolve(this._result || null);
                // Restore original close
                this.close = originalClose;
            };
            // If already closed, resolve immediately
            if (!this.isOpen) {
                resolve(this._result || null);
            }
        });
    }

    // ============================================================
    // STATIC HELPER: Modal.confirmForm()
    // ============================================================

    /**
     * Static method to create a modal with a form, validate it, and return a Promise.
     * @param {Object} options
     * @param {string} options.title - Modal title.
     * @param {string|HTMLFormElement} options.form - Form HTML string or DOM element.
     * @param {string} [options.confirmText='Submit'] - Confirm button text.
     * @param {string} [options.cancelText='Cancel'] - Cancel button text.
     * @param {Function} [options.onValidate] - Extra validation callback.
     * @param {string} [options.type='default'] - Modal type.
     * @param {string} [options.size='md'] - Modal size.
     * @param {Object} [options.modalOptions] - Additional options for Modal constructor.
     * @returns {Promise<any>} - Resolves with form data on confirm, or null on cancel.
     */
    static confirmForm(options) {
        return new Promise((resolve) => {
            const modalOptions = {
                title: options.title || 'Submit Form',
                type: options.type || 'default',
                size: options.size || 'md',
                showConfirm: false, // will be controlled by setForm
                showCancel: false,   // will be controlled by setForm
                ...options.modalOptions,
                onClose: () => {
                    // If no result, resolve null
                    if (modal._result === undefined) {
                        resolve(null);
                    }
                }
            };

            const modal = new Modal(modalOptions);
            modal.setForm(options.form, {
                submitText: options.confirmText || 'Submit',
                cancelText: options.cancelText || 'Cancel',
                onValidate: options.onValidate,
                onSubmit: (e, formEl, modalInstance) => {
                    // Use CampusForms validateForm
                    const validationResult = window.CampusForms?.validateForm(formEl);
                    if (!validationResult || !validationResult.isValid) {
                        return;
                    }
                    const data = new FormData(formEl);
                    const obj = {};
                    data.forEach((value, key) => { obj[key] = value; });
                    if (typeof options.onValidate === 'function') {
                        const extra = options.onValidate(obj, formEl);
                        if (extra === false) return;
                        if (typeof extra === 'object') Object.assign(obj, extra);
                    }
                    modal._result = obj;
                    modal.close();
                    resolve(obj);
                }
            });
            modal.open();

            // If modal is closed without submitting, resolve null
            const originalClose = modal.close.bind(modal);
            modal.close = () => {
                originalClose();
                if (modal._result === undefined) {
                    resolve(null);
                }
            };
        });
    }
}

// ============================================================
// EXPORT (for both module and global usage)
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
} else {
    window.Modal = Modal;
}