// ============================================================
// form-helpers.js – Custom form validation, file upload, and utilities
// + Reusable client‑side image cropper
// ============================================================

(function() {
    'use strict';

    // ─── Helpers ──────────────────────────────────────────────

    /** Find the .help-text element inside the same .form-group as a field. */
    function getFieldHelpEl(field) {
        const group = field.closest('.form-group');
        return group ? group.querySelector('.help-text') : null;
    }

    /** Find the .input-wrap (or parent) for error styling if needed. */
    function getFieldWrap(field) {
        return field.closest('.input-wrap') || field.closest('.form-group');
    }

    /** Set help text and style. type = 'error' | 'success' | '' */
    function setFieldHelp(field, message, type = 'error') {
        const helpEl = getFieldHelpEl(field);
        if (!helpEl) return;

        helpEl.textContent = message || '';
        helpEl.className = 'help-text' + (type ? ' ' + type : '');

        // Also add/remove error/success class on the field itself
        field.classList.remove('error', 'success');
        if (type === 'error') field.classList.add('error');
        if (type === 'success') field.classList.add('success');

        // Optionally style the wrap (if using .input-wrap)
        const wrap = getFieldWrap(field);
        if (wrap) {
            wrap.classList.remove('error', 'success');
            if (type === 'error') wrap.classList.add('error');
            if (type === 'success') wrap.classList.add('success');
        }
    }

    /** Clear help text and styling for a field. */
    function clearFieldHelp(field) {
        setFieldHelp(field, '', '');
    }

    // ─── Validation ──────────────────────────────────────────

    /**
     * Validate a form (or a single field).
     * @param {HTMLFormElement|HTMLInputElement} formOrField - The form or a single field.
     * @param {Object} [options] - Optional validation rules.
     * @param {Object} [options.rules] - Custom rules: { fieldName: validatorFn(value) => true|string }
     * @param {boolean} [options.clearOthers] - Clear help on untouched fields.
     * @returns {Object} { isValid: boolean, errors: { fieldName: string } }
     */
    function validateForm(formOrField, options = {}) {
        const isForm = formOrField instanceof HTMLFormElement;
        const fields = isForm ? formOrField.querySelectorAll('.form-input, .form-textarea, .form-select') : [formOrField];
        const result = { isValid: true, errors: {} };

        const customRules = options.rules || {};

        fields.forEach(field => {
            // Skip fields without a name (for error reporting)
            const name = field.name || field.id;
            if (!name) return;

            // Clear previous help if we are validating the whole form and clearOthers is true
            if (isForm && options.clearOthers !== false) {
                clearFieldHelp(field);
            }

            // 1) Required
            const required = field.hasAttribute('required') || field.dataset.required === 'true';
            const value = field.value.trim();

            if (required && !value) {
                const label = field.closest('.form-group')?.querySelector('label')?.textContent?.replace('*', '').trim() || name;
                const msg = `${label || 'This field'} is required.`;
                setFieldHelp(field, msg, 'error');
                result.isValid = false;
                result.errors[name] = msg;
                return;
            }

            // 2) Email
            if (field.type === 'email' && value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    const msg = 'Please enter a valid email address.';
                    setFieldHelp(field, msg, 'error');
                    result.isValid = false;
                    result.errors[name] = msg;
                    return;
                }
            }

            // 3) minlength
            const minLen = parseInt(field.getAttribute('minlength'));
            if (minLen && value && value.length < minLen) {
                const msg = `Must be at least ${minLen} characters.`;
                setFieldHelp(field, msg, 'error');
                result.isValid = false;
                result.errors[name] = msg;
                return;
            }

            // 4) Custom data-validate
            const validator = field.dataset.validate;
            if (validator === 'phone' && value) {
                const phonePattern = /^[0-9+()\- ]{7,15}$/;
                if (!phonePattern.test(value)) {
                    const msg = 'Please enter a valid phone number.';
                    setFieldHelp(field, msg, 'error');
                    result.isValid = false;
                    result.errors[name] = msg;
                    return;
                }
            }

            // 5) Custom validator from options
            if (customRules[name] && typeof customRules[name] === 'function') {
                const customResult = customRules[name](value, field);
                if (customResult !== true) {
                    const msg = typeof customResult === 'string' ? customResult : 'Invalid value.';
                    setFieldHelp(field, msg, 'error');
                    result.isValid = false;
                    result.errors[name] = msg;
                    return;
                }
            }

            // If we passed all checks, mark as success (only if there's no error already)
            if (!result.errors[name]) {
                setFieldHelp(field, '', 'success');
            }
        });

        return result;
    }

    /** Clear validation states on all fields in a form. */
    function clearValidation(form) {
        const fields = form.querySelectorAll('.form-input, .form-textarea, .form-select');
        fields.forEach(field => {
            field.classList.remove('error', 'success');
            const wrap = getFieldWrap(field);
            if (wrap) wrap.classList.remove('error', 'success');
            const helpEl = getFieldHelpEl(field);
            if (helpEl) {
                helpEl.textContent = '';
                helpEl.className = 'help-text';
            }
        });
    }

    // ─── Form Utilities ──────────────────────────────────────

    /** Serialize form data into an object { name: value } */
    function serializeForm(form) {
        const data = {};
        const elements = form.querySelectorAll('input, textarea, select');
        elements.forEach(el => {
            if (el.name) {
                if (el.type === 'checkbox') {
                    data[el.name] = el.checked;
                } else if (el.type === 'radio') {
                    if (el.checked) data[el.name] = el.value;
                } else {
                    data[el.name] = el.value;
                }
            }
        });
        return data;
    }

    /** Populate form fields from an object. */
    function populateForm(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (!field) return;
            if (field.type === 'checkbox') {
                field.checked = !!data[key];
            } else if (field.type === 'radio') {
                const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else {
                field.value = data[key];
            }
        });
    }

    /** Reset a form to its default values and clear validation. */
    function resetForm(form) {
        form.reset();
        clearValidation(form);
    }

    // ─── Cropper State ────────────────────────────────────────

    let _cropperModal = null;
    let _cropperImage = null;
    let _cropperScale = 1;
    let _cropperTranslateX = 0;
    let _cropperTranslateY = 0;
    let _cropperStartX = 0;
    let _cropperStartY = 0;
    let _cropperIsDragging = false;
    let _cropperOptions = null;
    let _cropperResolve = null;
    let _cropperReject = null;
    let _cropperFile = null;
    let _cropperOriginalName = '';
    let _cropperImageElement = null;

    // ─── Cropper UI ──────────────────────────────────────────

    function _buildCropperModal() {
        const modal = document.createElement('div');
        modal.className = 'cropper-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(4px);
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        modal.innerHTML = `
            <div class="cropper-container" style="
                background: var(--bg-card, #1e1e1e);
                border-radius: var(--radius-card, 18px);
                max-width: 90vw;
                max-height: 90vh;
                width: 800px;
                height: 600px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                overflow: hidden;
                border: 1px solid var(--border-card, #2a2a2a);
            ">
                <!-- Header -->
                <div style="
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--border-color, #2a2a2a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                ">
                    <h3 style="
                        font-size: 18px;
                        font-weight: 700;
                        color: var(--text-primary, #f0f0f0);
                        margin: 0;
                    ">Crop Image</h3>
                    <button class="cropper-close" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        color: var(--text-muted2, #999);
                        cursor: pointer;
                        padding: 0 8px;
                        line-height: 1;
                    ">&times;</button>
                </div>

                <!-- Image area -->
                <div style="
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    background: #0a0a0a;
                    touch-action: none;
                " id="cropperImageArea">
                    <img id="cropperImage" style="
                        position: absolute;
                        top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        max-width: none;
                        max-height: none;
                        will-change: transform;
                        user-select: none;
                        pointer-events: none;
                    " alt="Crop preview" />
                    <div id="cropperCropArea" style="
                        position: absolute;
                        top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        border: 2px solid rgba(255,255,255,0.8);
                        box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
                        pointer-events: none;
                        z-index: 2;
                    "></div>
                </div>

                <!-- Controls -->
                <div style="
                    padding: 16px 24px;
                    border-top: 1px solid var(--border-color, #2a2a2a);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-shrink: 0;
                    flex-wrap: wrap;
                ">
                    <label style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 14px;
                        color: var(--text-secondary, #c0c0c0);
                        flex: 1;
                        min-width: 120px;
                    ">
                        <span>Zoom</span>
                        <input type="range" id="cropperZoom" min="0.1" max="5" step="0.01" value="1" style="
                            flex: 1;
                            accent-color: var(--green, #2ecc71);
                        " />
                    </label>
                    <button id="cropperCancel" style="
                        padding: 8px 24px;
                        border-radius: 30px;
                        font-size: 14px;
                        font-weight: 600;
                        border: none;
                        cursor: pointer;
                        background: var(--bg-input, #2a2a2a);
                        color: var(--text-secondary, #c0c0c0);
                        transition: all 0.2s;
                    ">Cancel</button>
                    <button id="cropperConfirm" style="
                        padding: 8px 24px;
                        border-radius: 30px;
                        font-size: 14px;
                        font-weight: 600;
                        border: none;
                        cursor: pointer;
                        background: var(--green, #2ecc71);
                        color: #fff;
                        transition: all 0.2s;
                    ">Apply Crop</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.cropper-close');
        const cancelBtn = modal.querySelector('#cropperCancel');
        const confirmBtn = modal.querySelector('#cropperConfirm');
        const zoomSlider = modal.querySelector('#cropperZoom');
        const imageArea = modal.querySelector('#cropperImageArea');
        const imageEl = modal.querySelector('#cropperImage');

        closeBtn.addEventListener('click', _closeCropper);
        cancelBtn.addEventListener('click', _closeCropper);
        confirmBtn.addEventListener('click', _applyCrop);

        zoomSlider.addEventListener('input', function() {
            _cropperScale = parseFloat(this.value);
            _updateCropperTransform();
        });

        // Mouse events for panning
        imageArea.addEventListener('mousedown', _cropperStartDrag);
        document.addEventListener('mousemove', _cropperDrag);
        document.addEventListener('mouseup', _cropperEndDrag);

        // Touch events
        imageArea.addEventListener('touchstart', _cropperStartDrag);
        document.addEventListener('touchmove', _cropperDrag);
        document.addEventListener('touchend', _cropperEndDrag);

        // Prevent default drag behaviors
        imageArea.addEventListener('dragstart', e => e.preventDefault());

        // Store refs
        _cropperModal = modal;
        _cropperImageElement = imageEl;

        return modal;
    }

    function _cropperStartDrag(e) {
        if (!_cropperImageElement) return;
        const ev = e.touches ? e.touches[0] : e;
        _cropperIsDragging = true;
        _cropperStartX = ev.clientX - _cropperTranslateX;
        _cropperStartY = ev.clientY - _cropperTranslateY;
        _cropperModal.querySelector('#cropperImageArea').style.cursor = 'grabbing';
        e.preventDefault();
    }

    function _cropperDrag(e) {
        if (!_cropperIsDragging) return;
        const ev = e.touches ? e.touches[0] : e;
        _cropperTranslateX = ev.clientX - _cropperStartX;
        _cropperTranslateY = ev.clientY - _cropperStartY;
        _updateCropperTransform();
        e.preventDefault();
    }

    function _cropperEndDrag(e) {
        _cropperIsDragging = false;
        if (_cropperModal) {
            _cropperModal.querySelector('#cropperImageArea').style.cursor = 'default';
        }
    }

    function _updateCropperTransform() {
        if (!_cropperImageElement) return;
        const scale = _cropperScale;
        const tx = _cropperTranslateX;
        const ty = _cropperTranslateY;
        _cropperImageElement.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;
    }

    function _openCropper(file, options) {
        return new Promise((resolve, reject) => {
            _cropperFile = file;
            _cropperOriginalName = file.name;
            _cropperOptions = options;
            _cropperResolve = resolve;
            _cropperReject = reject;

            const modal = _buildCropperModal();

            // Load image
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Store image dimensions (natural)
                    const naturalWidth = img.naturalWidth;
                    const naturalHeight = img.naturalHeight;

                    // Set up crop area
                    const area = modal.querySelector('#cropperCropArea');
                    const aspect = options.aspectRatio || (options.width / options.height);
                    let areaWidth, areaHeight;
                    // Determine crop area size based on image area
                    const container = modal.querySelector('#cropperImageArea');
                    const containerRect = container.getBoundingClientRect();
                    const maxW = containerRect.width * 0.85;
                    const maxH = containerRect.height * 0.85;
                    if (aspect >= 1) {
                        areaWidth = Math.min(maxW, maxH * aspect);
                        areaHeight = areaWidth / aspect;
                    } else {
                        areaHeight = Math.min(maxH, maxW / aspect);
                        areaWidth = areaHeight * aspect;
                    }
                    area.style.width = areaWidth + 'px';
                    area.style.height = areaHeight + 'px';

                    // Position image
                    const imageEl = modal.querySelector('#cropperImage');
                    imageEl.src = img.src;
                    _cropperImageElement = imageEl;
                    _cropperScale = 1;
                    _cropperTranslateX = 0;
                    _cropperTranslateY = 0;
                    _updateCropperTransform();

                    // Set zoom range based on image size
                    const zoomSlider = modal.querySelector('#cropperZoom');
                    const minZoom = Math.min(containerRect.width / naturalWidth, containerRect.height / naturalHeight);
                    const maxZoom = 5;
                    zoomSlider.min = minZoom;
                    zoomSlider.max = maxZoom;
                    zoomSlider.step = 0.01;
                    zoomSlider.value = Math.max(minZoom, 1);

                    // Show modal
                    modal.style.display = 'flex';
                    requestAnimationFrame(() => {
                        modal.style.opacity = '1';
                    });
                };
                img.onerror = function() {
                    reject(new Error('Failed to load image.'));
                };
                img.src = e.target.result;
            };
            reader.onerror = function() {
                reject(new Error('Failed to read file.'));
            };
            reader.readAsDataURL(file);
        });
    }

    function _closeCropper() {
        if (_cropperModal) {
            _cropperModal.style.opacity = '0';
            setTimeout(() => {
                _cropperModal.style.display = 'none';
                _cropperModal.remove();
                _cropperModal = null;
                _cropperImageElement = null;
                _cropperImage = null;
                _cropperIsDragging = false;
                // Clean up event listeners? They are on document, we'll keep them but they will check _cropperModal.
                // We can keep them active but they will bail if modal is null.
                if (_cropperReject) {
                    _cropperReject(new Error('Cropping cancelled.'));
                    _cropperReject = null;
                    _cropperResolve = null;
                }
            }, 300);
        }
    }

    function _applyCrop() {
        if (!_cropperModal || !_cropperImageElement) return;

        const imageEl = _cropperImageElement;
        const img = imageEl;
        const area = _cropperModal.querySelector('#cropperCropArea');
        const areaRect = area.getBoundingClientRect();
        const container = _cropperModal.querySelector('#cropperImageArea');
        const containerRect = container.getBoundingClientRect();

        // Compute crop rectangle in image pixel coordinates
        // Get the image's transform: translate(calc(-50% + x), calc(-50% + y)) scale(s)
        // We need to know the image's current scale and translation relative to the container.
        // The image is positioned at 50%/50% then translated by _cropperTranslateX/Y and scaled.
        // The image's natural width/height is img.naturalWidth, naturalHeight.

        const scale = _cropperScale;
        const tx = _cropperTranslateX;
        const ty = _cropperTranslateY;

        // The image's top-left corner in container coordinates (relative to container)
        // The image is centered at (50%, 50%) of container, then translated by (tx, ty).
        // The displayed size is naturalWidth * scale, naturalHeight * scale.
        const cx = containerRect.width / 2 + tx;
        const cy = containerRect.height / 2 + ty;

        // Crop area center relative to container
        const cropLeft = areaRect.left - containerRect.left;
        const cropTop = areaRect.top - containerRect.top;
        const cropWidth = areaRect.width;
        const cropHeight = areaRect.height;

        // Compute crop rectangle in image pixel coordinates (before scale)
        // The image is drawn with top-left at (cx - (naturalWidth*scale)/2, cy - (naturalHeight*scale)/2)
        // So pixel coordinates = (containerX - (cx - naturalWidth*scale/2)) / scale
        const imgLeft = cx - (img.naturalWidth * scale) / 2;
        const imgTop = cy - (img.naturalHeight * scale) / 2;

        const srcX = (cropLeft - imgLeft) / scale;
        const srcY = (cropTop - imgTop) / scale;
        const srcW = cropWidth / scale;
        const srcH = cropHeight / scale;

        // Clamp to image bounds
        const finalSrcX = Math.max(0, Math.min(img.naturalWidth, srcX));
        const finalSrcY = Math.max(0, Math.min(img.naturalHeight, srcY));
        const finalSrcW = Math.max(1, Math.min(img.naturalWidth - finalSrcX, srcW));
        const finalSrcH = Math.max(1, Math.min(img.naturalHeight - finalSrcY, srcH));

        // Validate crop area
        if (finalSrcW <= 0 || finalSrcH <= 0) {
            _cropperModal.querySelector('#cropperImageArea').style.border = '2px solid red';
            setTimeout(() => { _cropperModal.querySelector('#cropperImageArea').style.border = ''; }, 500);
            return;
        }

        // Create canvas with output dimensions
        const options = _cropperOptions;
        const outWidth = options.width;
        const outHeight = options.height;
        const canvas = document.createElement('canvas');
        canvas.width = outWidth;
        canvas.height = outHeight;
        const ctx = canvas.getContext('2d');

        // Draw the cropped portion onto canvas
        ctx.drawImage(
            img,
            finalSrcX, finalSrcY, finalSrcW, finalSrcH,
            0, 0, outWidth, outHeight
        );

        // Export as blob
        const outputType = options.outputType || 'image/webp';
        const quality = options.quality !== undefined ? options.quality : 0.85;

        // Check if browser supports the desired format
        let mimeType = outputType;
        if (mimeType === 'image/webp' && !canvas.toBlob) {
            mimeType = 'image/png';
        } else if (mimeType === 'image/webp') {
            // Test if WebP is actually supported
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 1;
            testCanvas.height = 1;
            const testBlob = testCanvas.toBlob ? testCanvas.toBlob((b) => {}) : null;
            if (!testCanvas.toBlob) {
                // Fallback to PNG
                mimeType = 'image/png';
            } else {
                // We'll rely on canvas.toBlob and handle errors
            }
        }

        canvas.toBlob(function(blob) {
            if (!blob) {
                _cropperReject(new Error('Failed to export cropped image.'));
                return;
            }
            // Create a new File object
            const ext = mimeType.split('/')[1] || 'webp';
            const newName = _cropperOriginalName.replace(/\.[^.]+$/, '') + '.' + ext;
            const croppedFile = new File([blob], newName, { type: mimeType });

            // Validate the result
            if (!(croppedFile instanceof File) || croppedFile.size === 0) {
                _cropperReject(new Error('Cropped image is empty.'));
                return;
            }
            if (!croppedFile.type.startsWith('image/')) {
                _cropperReject(new Error('Cropped file is not an image.'));
                return;
            }

            // Resolve promise with the cropped file
            _cropperResolve(croppedFile);
            _closeCropper();
        }, mimeType, quality);
    }

    // ─── Public cropImage API ─────────────────────────────────

    /**
     * Crop an image using configurable dimensions.
     *
     * @param {File} file - The image file to crop.
     * @param {Object} options
     * @param {number} options.width - Desired output width.
     * @param {number} options.height - Desired output height.
     * @param {number} [options.aspectRatio] - Crop aspect ratio (width/height). Defaults to width/height.
     * @param {string} [options.outputType] - MIME type (e.g., "image/webp", "image/png"). Default "image/webp".
     * @param {number} [options.quality] - Image quality (0-1). Default 0.85.
     * @returns {Promise<File>} A promise that resolves with the cropped File.
     */
    function cropImage(file, options) {
        if (!file || !(file instanceof File)) {
            return Promise.reject(new Error('Invalid file provided.'));
        }
        if (!options || typeof options.width !== 'number' || typeof options.height !== 'number') {
            return Promise.reject(new Error('Options must include width and height.'));
        }
        if (!file.type.startsWith('image/')) {
            return Promise.reject(new Error('File is not an image.'));
        }

        // Ensure aspect ratio is set
        if (!options.aspectRatio) {
            options.aspectRatio = options.width / options.height;
        }

        // Ensure outputType default
        if (!options.outputType) {
            options.outputType = 'image/webp';
        }

        // Ensure quality default
        if (options.quality === undefined) {
            options.quality = 0.85;
        }

        return _openCropper(file, options);
    }

    // ─── File Drop Zones (Enhanced) ───────────────────────────

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

    // ─── Enhanced File Selection Handler ─────────────────────

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

        // ─── Check if crop is required ──────────────────────────
        const crop = input.dataset.crop === 'true';
        if (crop) {
            // Parse crop options
            const options = {
                width: parseInt(input.dataset.cropWidth) || 400,
                height: parseInt(input.dataset.cropHeight) || 400,
                aspectRatio: parseFloat(input.dataset.cropAspectRatio) || null,
                outputType: input.dataset.cropOutput || 'image/webp',
                quality: parseFloat(input.dataset.cropQuality) || 0.85,
            };
            // If aspectRatio not explicitly set, derive from width/height
            if (!options.aspectRatio) {
                options.aspectRatio = options.width / options.height;
            }

            // Open cropper
            cropImage(file, options)
                .then(croppedFile => {
                    // Replace the input's file with the cropped file using DataTransfer
                    try {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(croppedFile);
                        input.files = dataTransfer.files;
                    } catch (e) {
                        // Fallback: some browsers may not support assigning files via DataTransfer
                        // In that case, we can't replace the file, but we can still show the preview
                        // and the user will need to use FormData append manually? 
                        // We'll emit a warning and continue with the original file? 
                        // Better: we'll store the cropped file in a data attribute and let the user handle it?
                        // But the requirement says to replace the input file.
                        // We'll try to assign via DataTransfer; if it fails, we'll show an error.
                        console.warn('Unable to replace input file with cropped file. Some browsers may not support this.');
                        if (errorEl) {
                            errorEl.textContent = 'Cropping succeeded but your browser does not support replacing the file. Please use a modern browser.';
                        }
                        // Still show preview with cropped image
                        _showCroppedPreview(zone, croppedFile);
                        return;
                    }
                    // Success: show preview of cropped image
                    _showCroppedPreview(zone, croppedFile);
                })
                .catch(err => {
                    // Crop cancelled or failed
                    console.warn('Crop cancelled or failed:', err);
                    input.value = '';
                    clearPreview(zone);
                    zone.classList.remove('has-file');
                    if (errorEl) {
                        errorEl.textContent = err.message || 'Cropping cancelled.';
                    }
                });
            return;
        }

        // ─── No crop – existing behavior ──────────────────────────

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

    // ─── Helper to show cropped preview ───────────────────────

    function _showCroppedPreview(zone, file) {
        const previewContainer = zone.querySelector('.file-preview-container');
        const errorEl = zone.querySelector('.drop-error');
        if (!previewContainer) return;

        // Clear previous preview
        previewContainer.innerHTML = '';

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
            previewContainer.innerHTML = imgHtml;
            zone.classList.add('has-file');
            if (errorEl) errorEl.textContent = '';

            // Re-attach remove handler
            previewContainer.querySelector('.file-remove')?.addEventListener('click', function(e) {
                e.stopPropagation();
                const input = zone.querySelector('input[type="file"]');
                if (input) {
                    input.value = '';
                }
                clearPreview(zone);
                zone.classList.remove('has-file');
                if (errorEl) errorEl.textContent = '';
            });
        };
        reader.readAsDataURL(file);
    }

    function clearPreview(zone) {
        const container = zone.querySelector('.file-preview-container');
        if (container) container.innerHTML = '';
    }

    // ─── Init on DOM ready ───────────────────────────────────

    document.addEventListener('DOMContentLoaded', function() {
        initFileDropZones();
    });

    // ─── Expose Public API ───────────────────────────────────

    window.CampusForms = {
        // Validation
        validateForm,
        clearValidation,
        setFieldHelp,
        clearFieldHelp,
        // Form utilities
        serializeForm,
        populateForm,
        resetForm,
        // File upload
        initFileDropZones,
        // Cropper (new)
        cropImage,
        // Helpers (exposed for advanced use)
        _getFieldHelpEl: getFieldHelpEl,
        _getFieldWrap: getFieldWrap,
    };

})();