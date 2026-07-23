// ============================================================
// form-helpers.js – Custom form validation & file upload
// ============================================================

(function() {
    'use strict';

    // ─── Drag & Drop File Upload ──────────────────────────────

    function initFileDropZones() {
        document.querySelectorAll('.file-drop-zone').forEach(zone => {
            const fileInput = zone.querySelector('input[type="file"]');
            if (!fileInput) return;

            const previewContainer = zone.querySelector('.file-preview-container');
            const dropText = zone.querySelector('.drop-text');
            const dropHint = zone.querySelector('.drop-hint');
            const dropIcon = zone.querySelector('.drop-icon');
            const errorEl = zone.querySelector('.drop-error');

            // ── Drag events ──
            ['dragenter', 'dragover'].forEach(eventName => {
                zone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.add('dragover');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, e => {
                    e.preventDefault();
                    e.stopPropagation();
                    zone.classList.remove('dragover');
                });
            });

            zone.addEventListener('drop', e => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    handleFileSelection(fileInput, zone);
                }
            });

            // ── Click to select ──
            zone.addEventListener('click', e => {
                if (e.target.closest('.file-remove')) return;
                if (e.target.closest('.file-preview')) return;
                fileInput.click();
            });

            // ── File input change ──
            fileInput.addEventListener('change', function() {
                handleFileSelection(this, zone);
            });

            // ── Remove file ──
            zone.addEventListener('click', function(e) {
                const removeBtn = e.target.closest('.file-remove');
                if (removeBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInput.value = '';
                    clearPreview(zone);
                    zone.classList.remove('has-file');
                    if (errorEl) errorEl.textContent = '';
                }
            });
        });
    }

    function handleFileSelection(input, zone) {
        const file = input.files[0];
        const errorEl = zone.querySelector('.drop-error');
        const previewContainer = zone.querySelector('.file-preview-container');

        if (!file) {
            clearPreview(zone);
            zone.classList.remove('has-file');
            if (errorEl) errorEl.textContent = '';
            return;
        }

        // Validate size (5MB max)
        const maxSize = parseInt(input.getAttribute('data-max-size')) || 5 * 1024 * 1024;
        if (file.size > maxSize) {
            if (errorEl) {
                errorEl.textContent = `File too large. Max ${(maxSize / 1024 / 1024).toFixed(0)}MB.`;
            }
            input.value = '';
            clearPreview(zone);
            zone.classList.remove('has-file');
            return;
        }

        // Validate type
        const accept = input.getAttribute('accept') || '';
        if (accept) {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const fileType = file.type;
            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
            const isValid = acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    return fileExt === type.toLowerCase();
                }
                if (type.includes('/*')) {
                    const baseType = type.split('/')[0];
                    return fileType.startsWith(baseType + '/');
                }
                return fileType === type;
            });
            if (!isValid) {
                if (errorEl) {
                    errorEl.textContent = `Invalid file type. Allowed: ${accept}`;
                }
                input.value = '';
                clearPreview(zone);
                zone.classList.remove('has-file');
                return;
            }
        }

        // Success – show preview
        if (errorEl) errorEl.textContent = '';
        zone.classList.add('has-file');

        // Build preview
        const isImage = file.type.startsWith('image/');
        let previewHtml = `
            <div class="file-preview">
                <span class="file-icon">${isImage ? '🖼️' : '📄'}</span>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button type="button" class="file-remove" aria-label="Remove file">&times;</button>
            </div>
        `;

        // If image, show thumbnail
        if (isImage) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgHtml = `
                    <div class="file-preview file-preview-image" style="flex-direction:column; padding:12px;">
                        <img src="${e.target.result}" style="max-width:80px; max-height:80px; border-radius:8px; object-fit:cover;" />
                        <div class="file-info" style="text-align:center; margin-top:6px;">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <button type="button" class="file-remove" aria-label="Remove file">&times;</button>
                    </div>
                `;
                if (previewContainer) {
                    previewContainer.innerHTML = imgHtml;
                    // Re-attach remove handler
                    previewContainer.querySelector('.file-remove')?.addEventListener('click', function(e) {
                        e.stopPropagation();
                        input.value = '';
                        clearPreview(zone);
                        zone.classList.remove('has-file');
                        if (errorEl) errorEl.textContent = '';
                    });
                }
            };
            reader.readAsDataURL(file);
            return;
        }

        if (previewContainer) {
            previewContainer.innerHTML = previewHtml;
            previewContainer.querySelector('.file-remove')?.addEventListener('click', function(e) {
                e.stopPropagation();
                input.value = '';
                clearPreview(zone);
                zone.classList.remove('has-file');
                if (errorEl) errorEl.textContent = '';
            });
        }
    }

    function clearPreview(zone) {
        const container = zone.querySelector('.file-preview-container');
        if (container) container.innerHTML = '';
    }

    // ─── Validation ──────────────────────────────────────────────

    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
        const errors = [];

        inputs.forEach(input => {
            const group = input.closest('.form-group');
            const helpEl = group?.querySelector('.help-text');
            const label = group?.querySelector('label');

            // Check required
            if (input.hasAttribute('required') || input.dataset.required === 'true') {
                const value = input.value.trim();
                if (!value) {
                    isValid = false;
                    input.classList.add('error');
                    input.classList.remove('success');
                    if (helpEl) {
                        helpEl.textContent = `${label?.textContent?.replace('*', '') || 'This field'} is required.`;
                        helpEl.classList.add('error');
                    }
                    errors.push(input);
                } else {
                    input.classList.remove('error');
                    input.classList.add('success');
                    if (helpEl) {
                        helpEl.textContent = input.dataset.helpText || '';
                        helpEl.classList.remove('error');
                    }
                }
            }

            // Email validation
            if (input.type === 'email' && input.value.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(input.value.trim())) {
                    isValid = false;
                    input.classList.add('error');
                    input.classList.remove('success');
                    if (helpEl) {
                        helpEl.textContent = 'Please enter a valid email address.';
                        helpEl.classList.add('error');
                    }
                    errors.push(input);
                }
            }
        });

        // Check custom validity
        const customValidations = form.querySelectorAll('[data-validate]');
        customValidations.forEach(el => {
            const validator = el.dataset.validate;
            const group = el.closest('.form-group');
            const helpEl = group?.querySelector('.help-text');
            if (validator === 'phone') {
                const phonePattern = /^[0-9+()\- ]{7,15}$/;
                if (el.value.trim() && !phonePattern.test(el.value.trim())) {
                    isValid = false;
                    el.classList.add('error');
                    el.classList.remove('success');
                    if (helpEl) {
                        helpEl.textContent = 'Please enter a valid phone number.';
                        helpEl.classList.add('error');
                    }
                    errors.push(el);
                }
            }
        });

        return { isValid, errors };
    }

    // ─── Helpers ──────────────────────────────────────────────────

    function clearValidation(form) {
        form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
            el.classList.remove('error', 'success');
            const group = el.closest('.form-group');
            const helpEl = group?.querySelector('.help-text');
            if (helpEl) {
                helpEl.textContent = el.dataset.helpText || '';
                helpEl.classList.remove('error');
            }
        });
    }

    // ─── Init ────────────────────────────────────────────────────

    document.addEventListener('DOMContentLoaded', function() {
        initFileDropZones();
    });

    // Expose API
    window.CampusForms = {
        validateForm,
        clearValidation,
        initFileDropZones
    };

})();