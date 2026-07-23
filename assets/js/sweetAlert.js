// ============================================================
// showAlert.js – Toast Alert System for CampusHub
// Usage:
//   showAlert.info('Welcome back!');
//   showAlert.success('Item added to cart');
//   showAlert.error('Something went wrong');
//   showAlert.warning('Please check your inputs');
//
//   // With custom duration and position
//   showAlert.success('Saved!', { duration: 3000, position: 'top-right' });
// ============================================================

const showAlert = (function() {
    'use strict';

    // --- Configuration ---
    const DEFAULT_DURATION = 4000; // ms
    const DEFAULT_POSITION = 'top-right';
    const ICONS = {
        info: 'fa-circle-info',
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation'
    };
    const COLORS = {
        info: { bg: '#e8f4fd', text: '#0c5460', border: '#b8d4e3', accent: '#17a2b8' },
        success: { bg: '#eaf9ef', text: '#0d3e2a', border: '#b8e0c4', accent: '#0d8a3e' },
        error: { bg: '#fde8e8', text: '#721c24', border: '#f5c6cb', accent: '#e74c3c' },
        warning: { bg: '#fff3e0', text: '#856404', border: '#ffd8a8', accent: '#f5a623' }
    };
    // Dark mode overrides
    const COLORS_DARK = {
        info: { bg: '#1a2a3a', text: '#b8d4e3', border: '#2a4050', accent: '#17a2b8' },
        success: { bg: '#1a3a2a', text: '#b8e0c4', border: '#2a4a3a', accent: '#2ecc71' },
        error: { bg: '#3a1a1a', text: '#f5c6cb', border: '#4a2a2a', accent: '#e74c3c' },
        warning: { bg: '#3a2a1a', text: '#ffd8a8', border: '#4a3a2a', accent: '#f5a623' }
    };

    let container = null;
    let activeAlerts = [];

    // --- Helper: get color scheme based on current theme ---
    function getColors(type) {
        const isDark = document.documentElement.classList.contains('dark-mode');
        const palette = isDark ? COLORS_DARK : COLORS;
        return palette[type] || palette.info;
    }

    // --- Helper: create container if it doesn't exist ---
    function getContainer(position) {
        if (!container) {
            container = document.createElement('div');
            container.className = 'alert-container';
            container.style.cssText = `
                position: fixed;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
                max-width: 420px;
                width: 100%;
                padding: 16px;
            `;
            document.body.appendChild(container);
        }

        // Set position
        const pos = position || DEFAULT_POSITION;
        container.style.top = pos.includes('top') ? '0' : 'auto';
        container.style.bottom = pos.includes('bottom') ? '0' : 'auto';
        container.style.left = pos.includes('left') ? '0' : 'auto';
        container.style.right = pos.includes('right') ? '0' : 'auto';
        // If centered, we need to adjust
        if (pos === 'top-center') {
            container.style.top = '0';
            container.style.bottom = 'auto';
            container.style.left = '50%';
            container.style.right = 'auto';
            container.style.transform = 'translateX(-50%)';
        } else if (pos === 'bottom-center') {
            container.style.top = 'auto';
            container.style.bottom = '0';
            container.style.left = '50%';
            container.style.right = 'auto';
            container.style.transform = 'translateX(-50%)';
        } else {
            container.style.transform = '';
        }

        return container;
    }

    // --- Main alert function ---
    function showAlert(type, message, options) {
        const opts = Object.assign({
            duration: DEFAULT_DURATION,
            position: DEFAULT_POSITION,
            icon: true,
            closable: true,
            onClose: null
        }, options);

        const colors = getColors(type);
        const iconName = ICONS[type] || ICONS.info;

        // Create alert element
        const alertEl = document.createElement('div');
        alertEl.className = `alert-item alert-${type}`;
        alertEl.style.cssText = `
            background: ${colors.bg};
            color: ${colors.text};
            border-left: 4px solid ${colors.accent};
            border-radius: var(--radius-card, 12px);
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            pointer-events: auto;
            transform: translateX(40px);
            opacity: 0;
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
            border: 1px solid ${colors.border};
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
            position: relative;
        `;

        // Icon
        let iconHtml = '';
        if (opts.icon) {
            iconHtml = `<i class="fa-solid ${iconName}" style="
                font-size: 20px;
                color: ${colors.accent};
                flex-shrink: 0;
            "></i>`;
        }

        // Message
        const msgHtml = `<span style="flex: 1;">${message}</span>`;

        // Close button
        let closeHtml = '';
        if (opts.closable) {
            closeHtml = `<button class="alert-close-btn" style="
                background: none;
                border: none;
                color: ${colors.text};
                opacity: 0.5;
                cursor: pointer;
                font-size: 18px;
                padding: 0 4px;
                transition: opacity 0.2s;
                line-height: 1;
                flex-shrink: 0;
            ">&times;</button>`;
        }

        alertEl.innerHTML = iconHtml + msgHtml + closeHtml;

        // Close button handler
        const closeBtn = alertEl.querySelector('.alert-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                dismissAlert(alertEl, opts.onClose);
            });
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.opacity = '1';
            });
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.opacity = '0.5';
            });
        }

        // Add to container
        const containerEl = getContainer(opts.position);
        containerEl.appendChild(alertEl);

        // Trigger entrance animation
        requestAnimationFrame(() => {
            alertEl.style.transform = 'translateX(0)';
            alertEl.style.opacity = '1';
        });

        // Auto dismiss
        let timerId = null;
        if (opts.duration > 0) {
            timerId = setTimeout(() => {
                dismissAlert(alertEl, opts.onClose);
            }, opts.duration);
        }

        // Store reference for cleanup
        const alertData = { element: alertEl, timerId, onClose: opts.onClose };
        activeAlerts.push(alertData);

        // Return control object
        return {
            close: () => dismissAlert(alertEl, opts.onClose),
            element: alertEl,
            dismiss: () => dismissAlert(alertEl, opts.onClose)
        };
    }

    // --- Dismiss alert with animation ---
    function dismissAlert(alertEl, onClose) {
        if (!alertEl || !alertEl.parentNode) return;

        // Remove from active list
        activeAlerts = activeAlerts.filter(item => item.element !== alertEl);

        // Animate out
        alertEl.style.transform = 'translateX(40px)';
        alertEl.style.opacity = '0';

        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.remove();
            }
            if (typeof onClose === 'function') {
                onClose();
            }
            // Clean up container if empty
            if (container && container.children.length === 0) {
                container.remove();
                container = null;
            }
        }, 350);
    }

    // --- Public API ---
    const api = {
        /**
         * Show an info alert
         * @param {string} message - Alert message
         * @param {Object} [options] - { duration, position, icon, closable, onClose }
         */
        info(message, options) {
            return showAlert('info', message, options);
        },

        /**
         * Show a success alert
         */
        success(message, options) {
            return showAlert('success', message, options);
        },

        /**
         * Show an error alert
         */
        error(message, options) {
            return showAlert('error', message, options);
        },

        /**
         * Show a warning alert
         */
        warning(message, options) {
            return showAlert('warning', message, options);
        },

        /**
         * Dismiss all active alerts
         */
        dismissAll() {
            const alerts = [...activeAlerts];
            alerts.forEach(({ element, onClose }) => {
                dismissAlert(element, onClose);
            });
            activeAlerts = [];
        },

        /**
         * Update the default duration for all alerts
         */
        setDefaultDuration(ms) {
            DEFAULT_DURATION = ms;
        },

        /**
         * Update the default position
         */
        setDefaultPosition(pos) {
            DEFAULT_POSITION = pos;
            if (container) {
                // Reapply position
                const currentPos = container.style.top === '0' ? 'top' : 'bottom';
                // Just rebuild container on next alert
            }
        }
    };

    // --- Expose globally ---
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        window.showAlert = api;
    }

    return api;
})();