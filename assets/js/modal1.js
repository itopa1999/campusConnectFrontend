// ============================================================
// modal.js – Style-Driven Modal Component for CampusHub
// Designed to work seamlessly with light/dark mode via CSS variables
//
// 🔥 Quick Examples:
//   Delete:   new Modal({ title: 'Delete?', body: '...', type: 'danger', confirmText: 'Delete' })
//   Warning:  new Modal({ title: 'Warning', body: '...', type: 'warning', confirmText: 'Proceed' })
//   Confirm:  new Modal({ title: 'Confirm', body: '...', type: 'success', confirmText: 'OK' })
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
     * @param {Function} [options.onConfirm] - Callback when confirm is clicked
     * @param {Function} [options.onCancel] - Callback when cancel is clicked
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

        // Theme configuration
        this.themes = {
            danger: { accent: 'var(--red)', icon: 'fa-triangle-exclamation', btnClass: 'modal-btn-danger' },
            warning: { accent: 'var(--orange)', icon: 'fa-triangle-exclamation', btnClass: 'modal-btn-warning' },
            success: { accent: 'var(--green)', icon: 'fa-circle-check', btnClass: 'modal-btn-success' },
            info: { accent: 'var(--blue)', icon: 'fa-circle-info', btnClass: 'modal-btn-info' },
            default: { accent: 'var(--green)', icon: 'fa-circle-check', btnClass: 'modal-btn-primary' },
        };

        this._build();
    }

    /**
     * Build the modal DOM structure
     */
    _build() {
        // Remove any existing modal with same instance
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

        // Size variants
        if (this.options.size === 'sm') {
            modal.style.maxWidth = '400px';
        } else if (this.options.size === 'lg') {
            modal.style.maxWidth = '720px';
        }

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
                    ${this.options.type !== 'default' ? `<i class="fa-solid ${theme.icon}" style="color:${theme.accent};"></i>` : ''}
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
                        background: var(--bg-input, #f3f4f6);
                        color: var(--text-secondary, #4a4a4a);
                        transition: all 0.2s;
                    ">${this.options.cancelText}</button>
                `;
            }
            if (this.options.showConfirm) {
                const btnStyle = `
                    padding: 10px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: ${theme.accent};
                    color: #ffffff;
                `;
                html += `
                    <button class="modal-confirm-btn ${theme.btnClass}" style="${btnStyle}">${this.options.confirmText}</button>
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

        // Close on overlay click
        if (this.options.closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }

        // Close on ESC
        if (this.options.closeOnEsc) {
            this._escHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) this.close();
            };
            document.addEventListener('keydown', this._escHandler);
        }

        // Button click handlers
        const confirmBtn = footer?.querySelector('.modal-confirm-btn');
        const cancelBtn = footer?.querySelector('.modal-cancel-btn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', (e) => {
                if (typeof this.options.onConfirm === 'function') {
                    this.options.onConfirm(this, e);
                } else {
                    // Auto-close if no custom onConfirm
                    this.close();
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                if (typeof this.options.onCancel === 'function') {
                    this.options.onCancel(this, e);
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
        // Trigger reflow for animation
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
            const icon = this.themes[this.options.type]?.icon || '';
            const accent = this.themes[this.options.type]?.accent || '';
            headerEl.innerHTML = `
                ${this.options.type !== 'default' ? `<i class="fa-solid ${icon}" style="color:${accent};"></i>` : ''}
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
}

// ============================================================
// EXPORT (for both module and global usage)
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
} else {
    window.Modal = Modal;
}