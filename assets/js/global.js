// ============================================================
// global.js – Shared functionality for all pages
// Includes: header, dark mode, filter sidebar, bottom nav,
// scroll to top, desktop overlay, profile sidebar, auth, form guard
// UPDATED: Unauthenticated user handling
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // API ENDPOINTS
    // ============================================================
    const AUTH_URL = 'http://127.0.0.1:8000/v1/user/api/auth/';
    const CAMPUS_URL = 'http://127.0.0.1:8000/v1/campus/api/campus/';
    const NOTIFICATIONS_URL = 'http://127.0.0.1:8000/v1/user/api/notifications/';
    const LOGOUT_URL = 'http://127.0.0.1:8000/v1/user/api/auth/logout-user';
    const REFRESH_POINTS_URL = 'http://127.0.0.1:8000/v1/user/api/';
    const X_KEY_ID = '1';
    const PLATFORM = 'web';


    // ============================================================
    // RATE LIMIT HANDLING (429 Too Many Requests)
    // ============================================================

    let _rateLimitModal = null;
    let _rateLimitInterval = null;
    let _rateLimitResolve = null;
    let _rateLimitReject = null;

    /**
     * Wait for the rate‑limit cooldown to finish.
     * Shows a modal with a countdown. Returns a promise that
     * resolves when the cooldown ends, or rejects if the user cancels.
     *
     * @param {number} retryAfter – seconds to wait
     * @returns {Promise<void>}
     */
    function waitForRateLimit(retryAfter) {
        // If we are already waiting, return the same promise
        if (_rateLimitResolve) {
            return new Promise((resolve, reject) => {
                // We attach to the existing promise by storing callbacks
                // But we need to chain properly. We'll use a simple approach:
                // Wrap the existing promise.
                return new Promise((res, rej) => {
                    // We'll store a chain
                    // Simpler: just return a new promise that waits for the same resolve/reject
                    // We'll push our callbacks into an array.
                    // To keep it simple, we'll just use the same promise instance.
                    // But we cannot attach multiple resolve/reject to the same promise.
                    // We'll use a shared promise that we can await.
                    // We'll store a pending promise.
                });
            });
        }

        return new Promise((resolve, reject) => {
            _rateLimitResolve = resolve;
            _rateLimitReject = reject;

            let timeLeft = Math.max(1, Math.floor(retryAfter));
            const modal = new Modal({
                title: 'Rate Limit Exceeded',
                type: 'warning',
                body: `
                    <div style="text-align:center; padding:8px 0;">
                    <div style="font-size:48px; margin-bottom:12px;">⏳</div>
                    <p style="font-size:16px; color: var(--text-secondary); line-height:1.6; margin-bottom:12px;">
                        Too many requests. Please wait <strong id="retryCountdown">${timeLeft}</strong> seconds.
                    </p>
                    <div style="display:flex; justify-content:center; gap:12px;">
                        <button class="btn btn-primary" id="retryCancelBtn" style="padding:10px 24px; border-radius:30px; border:none; background:var(--red); color:#fff; font-weight:600; cursor:pointer;">Cancel</button>
                    </div>
                    </div>
                `,
                showConfirm: false,
                showCancel: false,
                showClose: false,
                closeOnOverlay: false,
                closeOnEsc: false,
                onOpen: function() {
                    _rateLimitModal = modal;
                    _rateLimitInterval = setInterval(() => {
                        timeLeft--;
                        const el = document.getElementById('retryCountdown');
                        if (el) el.textContent = timeLeft;
                        if (timeLeft <= 0) {
                            clearInterval(_rateLimitInterval);
                            _rateLimitInterval = null;
                            modal.close();
                            setTimeout(() => {
                                modal.destroy();
                                _rateLimitModal = null;
                                if (_rateLimitResolve) {
                                    _rateLimitResolve();
                                    _rateLimitResolve = null;
                                    _rateLimitReject = null;
                                }
                            }, 300);
                        }
                    }, 1000);

                    // Cancel button
                    const cancelBtn = document.getElementById('retryCancelBtn');
                    if (cancelBtn) {
                        cancelBtn.addEventListener('click', function() {
                            clearInterval(_rateLimitInterval);
                            _rateLimitInterval = null;
                            modal.close();
                            setTimeout(() => {
                                modal.destroy();
                                _rateLimitModal = null;
                                if (_rateLimitReject) {
                                    _rateLimitReject(new Error('Request cancelled by user'));
                                    _rateLimitResolve = null;
                                    _rateLimitReject = null;
                                }
                            }, 300);
                        });
                    }
                },
                onClose: function() {
                    // Cleanup if modal closes unexpectedly
                    if (_rateLimitInterval) {
                        clearInterval(_rateLimitInterval);
                        _rateLimitInterval = null;
                    }
                    _rateLimitModal = null;
                    if (_rateLimitReject) {
                        _rateLimitReject(new Error('Rate limit modal closed'));
                        _rateLimitResolve = null;
                        _rateLimitReject = null;
                    }
                }
            });
            modal.open();
        });
    }

    const listingStatusMap = {
        active: 'active',
        expired: 'expired',
        sold: 'sold',
        pending: 'pending',
        reject: 'reject',
    };

    const notificationTypeMap = {
        listing: 'listing',
        account: 'account',
        system: 'system',
        transaction: 'transaction',
        others: 'others'
    };

    // ============================================================
    // USER SESSION MANAGEMENT
    // ============================================================

    function getUserData() {
        const rememberMe = sessionStorage.getItem('rememberMe') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;

        const userData = storage.getItem('user');
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }

    function isAuthenticated() {
        const user = getUserData();
        return user !== null;
    }

    function clearUserSession() {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('rememberMe');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    }

    function setUserData(userData, rememberMe = false) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    }

    function updateHeaderUser() {
        const user = getUserData();

        const avatarEl = document.querySelector('#profileSidebarAvatar');
        const nameEl = document.querySelector('#profileSidebarName');
        const emailEl = document.querySelector('#profileSidebarEmail');

        if (user) {
            if (avatarEl) {
                const email = user.email || '';
                const initial = email.charAt(0).toUpperCase() || 'S';
                avatarEl.textContent = initial;
            }
            if (nameEl) {
                const displayName = user.email ? user.email.split('@')[0] : 'Student';
                const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                nameEl.textContent = formattedName;
            }
            if (emailEl) {
                const displayEmail = user.email ? '@' + user.email.split('@')[1] : '@student.uniben';
                emailEl.textContent = displayEmail;
            }
        } else {
            // Guest user
            if (avatarEl) avatarEl.textContent = 'G';
            if (nameEl) nameEl.textContent = 'Guest';
            if (emailEl) emailEl.textContent = '@guest';
        }

        if (user && user.total_favourites !== undefined) {
            window.updateFavouriteCount(user.total_favourites);
        } else {
            window.updateFavouriteCount(0);
        }

    }

    // ============================================================
    // GLOBAL SPINNER
    // ============================================================

    let spinnerElement = null;

    function createSpinner() {
        if (spinnerElement) return spinnerElement;
        const overlay = document.createElement('div');
        overlay.className = 'spinner-overlay';
        overlay.innerHTML = `
            <div class="spinner-box">
                <i class="fa-solid fa-spinner spinner-icon"></i>
                <div class="spinner-text">Loading…</div>
            </div>
        `;
        document.body.appendChild(overlay);
        spinnerElement = overlay;
        return spinnerElement;
    }

    function showGlobalSpinner(text = 'Loading…') {
        const spinner = createSpinner();
        const textEl = spinner.querySelector('.spinner-text');
        if (textEl) textEl.textContent = text;
        spinner.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideGlobalSpinner() {
        if (spinnerElement) {
            spinnerElement.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ============================================================
    // REFRESH TOKEN LOGIC
    // ============================================================

    let isRefreshing = false;
    let refreshSubscribers = [];

    function subscribeToRefresh(resolve, reject) {
        refreshSubscribers.push({ resolve, reject });
    }

    function onRefreshed() {
        refreshSubscribers.forEach(sub => sub.resolve());
        refreshSubscribers = [];
        isRefreshing = false;
    }

    function onRefreshFailed(error) {
        refreshSubscribers.forEach(sub => sub.reject(error));
        refreshSubscribers = [];
        isRefreshing = false;
        clearUserSession();
        if (typeof showAlert !== 'undefined') {
            showAlert.error('Session expired. Please login again.');
        }
        setTimeout(() => {
            window.location.href = '/auth/auth.html';
        }, 1000);
    }

    async function refreshToken() {
        const response = await fetch(`${AUTH_URL}refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Key-Id': X_KEY_ID,
            },
            body: JSON.stringify({ platform: PLATFORM })
        });
        if (!response.ok) {
            throw new Error('Refresh failed');
        }

        const result = await response.json();
        if (result.is_success && result.data && result.data.user) {
            const rememberMe = sessionStorage.getItem('rememberMe') === 'true';
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('user', JSON.stringify(result.data.user));
            updateHeaderUser();
        }
        return response;
    }

    // ============================================================
    // HELPER: Process notification field from API responses
    // ============================================================

    function handleNotificationFromResponse(response) {
        if (!response || !response.ok) return;
        response.clone().json().then(data => {
            let hasUnread = null;
            let favouritesCount = null;

            // Check notification flag (root or nested)
            if (data.notification !== undefined) {
                hasUnread = !!data.notification;
            } else if (data.data && data.data.notification !== undefined) {
                hasUnread = !!data.data.notification;
            }

            // Check favourites_count (root or nested)
            if (data.favourites_count !== undefined) {
                favouritesCount = data.favourites_count;
            } else if (data.data && data.data.favourites_count !== undefined) {
                favouritesCount = data.data.favourites_count;
            }

            // Update notification dot
            if (hasUnread !== null) {
                if (typeof window.setNotificationDot === 'function') {
                    window.setNotificationDot(hasUnread);
                }
                const user = getUserData();
                if (user) {
                    user.has_unread_notifications = hasUnread;
                    const rememberMe = sessionStorage.getItem('rememberMe') === 'true';
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('user', JSON.stringify(user));
                }
            }

            // Update favourite badge
            if (favouritesCount !== null) {
                if (typeof window.updateFavouriteCount === 'function') {
                    window.updateFavouriteCount(favouritesCount);
                }
                const user = getUserData();
                if (user) {
                    user.total_favourites = favouritesCount;
                    const rememberMe = sessionStorage.getItem('rememberMe') === 'true';
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('user', JSON.stringify(user));
                }
            }
        }).catch(() => {});
    }

    // ============================================================
    // FETCH WITH AUTH
    // ============================================================

    async function fetchWithAuth(url, options = {}) {
        if (!isAuthenticated()) {
            if (typeof showAlert !== 'undefined') {
                showAlert.warning('Session timed out. Please login again.', { duration: 2000 });
            }
            setTimeout(() => {
                window.location.href = '/auth/auth.html';
            }, 300);
            return Promise.reject(new Error('User not authenticated'));
        }

        const defaultHeaders = {
            'X-Key-Id': X_KEY_ID,
        };

        const opts = {
            credentials: 'include',
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };

        const showSpinner = opts.showSpinner === true;
        let spinnerText = opts.spinnerText || 'Loading…';

        if (showSpinner) {
            showGlobalSpinner(spinnerText);
        }

        const makeRequest = async (retryCount = 0) => {
            try {
                let response = await fetch(url, opts);

                let body = null;
                try {
                    body = await response.clone().json();
                } catch (_) {}

                if (response.status === 429 || body?.status_code === 429) {
                    // Hide any spinner that might be showing
                    if (opts.showSpinner) {
                        hideGlobalSpinner();
                    }

                    if (retryCount < 2) {
                        const retryAfter = body?.retry_after || 30;
                        try {
                            await waitForRateLimit(retryAfter);
                            // Retry the request with incremented retry count
                            return fetchWithAuth(url, options, retryCount + 1);
                        } catch (cancelError) {
                            // User cancelled – re-throw so the caller sees the error
                            throw cancelError;
                        }
                    } else {
                        throw new Error('Too many retries due to rate limiting');
                    }
                }

                return response;

                const isUnauthorized = response.status === 401 || body?.status_code === 401;

                if (isUnauthorized && retryCount === 0 && !opts.skipRefresh) {
                    if (!isRefreshing) {
                        // Initiate refresh
                        isRefreshing = true;
                        try {
                            await refreshToken();
                            onRefreshed();
                        } catch (error) {
                            onRefreshFailed(error);
                            throw error;
                        }
                    } else {
                        // Wait for the ongoing refresh
                        await new Promise((resolve, reject) => {
                            subscribeToRefresh(resolve, reject);
                        });
                    }
                    // Retry with fresh token
                    return makeRequest(retryCount + 1);
                }

                return response;
            } catch (error) {
                throw error;
            }
        };

        try {
            const response = await makeRequest();
            // ✅ Intercept successful responses to update notification dot
            if (response.ok) {
                handleNotificationFromResponse(response);
            }
            return response;
        } catch (error) {
            throw error;
        } finally {
            if (showSpinner) {
                hideGlobalSpinner();
            }
        }
    }

    // ============================================================
    // LOGOUT USER
    // ============================================================

    async function logoutUser() {
        try {
            const response = await fetchWithAuth(`${AUTH_URL}logout-user`, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                showSpinner: true,
                skipRefresh: true,
                body: JSON.stringify({
                    platform: 'web'
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                console.warn('Logout API call failed, but clearing local session anyway.');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearUserSession();
            if (typeof showAlert !== 'undefined') {
                showAlert.info('Logged out successfully.', { duration: 1500 });
            }
            setTimeout(() => {
                window.location.href = '/auth/auth.html';
            }, 500);
        }
    }

    // ============================================================
    // REFRESH POINTS BALANCE
    // ============================================================

    async function refreshPointBalance() {
        try {
            const response = await fetchWithAuth(REFRESH_POINTS_URL, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                showSpinner: true,
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Failed to refresh dashboard');
            const result = await response.json();
            if (!result.is_success || !result.data) throw new Error(result.message || 'Invalid response');
            const newBalance = result.data.points_balance;

            const BuyPointUserPoints = document.getElementById('userPoints');
            const summaryPointsBalance = document.getElementById('summaryPointsBalance');
            const pointsBalanceDisplay = document.getElementById('pointsBalanceDisplay');

            if (pointsBalanceDisplay) pointsBalanceDisplay.innerText = newBalance;
            if (BuyPointUserPoints) BuyPointUserPoints.innerText = newBalance;
            if (summaryPointsBalance) summaryPointsBalance.innerText = newBalance;

            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    user.point_bal = newBalance;
                    const storage = sessionStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
                    storage.setItem('user', JSON.stringify(user));
                } catch (e) {}
            }

            showAlert.success('Point balance updated', { duration: 1500 });
        } catch (err) {
            console.error('Refresh error:', err);
            showAlert.fail('Failed to refresh Point balance', { duration: 1500 });
        }
    }

    // ============================================================
    // PROFILE SIDEBAR
    // ============================================================

    let profileSidebarInstance = null;
    let profileSidebarInitialized = false;

    function createProfileSidebar() {
        if (document.querySelector('.profile-sidebar-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'profile-sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const sidebar = document.createElement('div');
        sidebar.className = 'profile-sidebar';
        sidebar.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 320px;
            max-width: 85%;
            height: 100%;
            background: var(--bg-sidebar, #ffffff);
            z-index: 9999;
            box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
            transform: translateX(100%);
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            border-left: 1px solid var(--border-color, #f0f0f0);
            overflow: hidden;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px 24px 16px;
            border-bottom: 1px solid var(--border-color, #f0f0f0);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        `;
        // Determine if authenticated to show correct avatar/name
        const isAuth = isAuthenticated();
        const user = isAuth ? getUserData() : null;
        const avatarLetter = isAuth ? (user?.email?.charAt(0)?.toUpperCase() || 'S') : 'G';
        const displayName = isAuth ? (user?.email?.split('@')[0]?.charAt(0)?.toUpperCase() + user?.email?.split('@')[0]?.slice(1) || 'Student') : 'Guest';
        const emailDisplay = isAuth ? (user?.email ? '@' + user?.email?.split('@')[1] : '@student.uniben') : '@guest';

        header.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:44px;height:44px;border-radius:50%;background:var(--green-bg,#eaf9ef);color:var(--green,#0d8a3e);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;border:2px solid var(--green,#0d8a3e);flex-shrink:0;" id="profileSidebarAvatar">${avatarLetter}</div>
                <div>
                    <div style="font-size:15px;font-weight:700;color:var(--text-primary,#1a1a1a);" id="profileSidebarName">${displayName}</div>
                    <div style="font-size:12px;color:var(--text-muted,#888);" id="profileSidebarEmail">${emailDisplay}</div>
                </div>
            </div>
            <button class="profile-sidebar-close" style="background:none;border:none;font-size:24px;color:var(--text-muted2,#8e8e93);cursor:pointer;padding:4px 8px;border-radius:8px;transition:background 0.2s,color 0.2s;line-height:1;">&times;</button>
        `;

        const body = document.createElement('div');
        body.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        `;

        // ============================================================
        // MENU ITEMS – Filter based on authentication
        // ============================================================
        let menuItems = [];
        if (isAuth) {
            menuItems = [
                { icon: 'fas fa-user', label: 'View Profile', id: 'view-profile' },
                { icon: 'fas fa-coins', label: 'Buy Points', id: 'buy-point' },
                { icon: 'fas fa-id-card', label: 'Upload Student ID', id: 'upload-id' },
                { icon: 'fas fa-building', label: 'Hall Verification', id: 'hall-verified' },
                { icon: 'fas fa-eye', label: 'Change Visibility', id: 'change-visibility' },
                { icon: 'fas fa-shield-halved', label: 'Add 2FA', id: 'add-2fa' },
                { icon: 'fas fa-flag', label: 'Report Issue / Abuse', id: 'report-issue' },
                { icon: 'fas fa-lightbulb', label: 'Help us Improve', id: 'help-improve' },
                { icon: 'fas fa-info-circle', label: 'About us', id: 'about-us' },
                { icon: 'fas fa-file-contract', label: 'Terms & Conditions', id: 'term-condition' },
                { icon: 'fas fa-key', label: 'Change Password', id: 'change-password' },
                { icon: 'fas fa-right-from-bracket', label: 'Logout', id: 'logout' },
            ];
        } else {
            // Unauthenticated: only About Us and Help us Improve
            menuItems = [
                { icon: 'fas fa-lightbulb', label: 'Help us Improve', id: 'help-improve' },
                { icon: 'fas fa-info-circle', label: 'About us', id: 'about-us' },
                { icon: 'fas fa-file-contract', label: 'Terms & Conditions', id: 'term-condition' },
            ];
        }

        let itemsHTML = '';
        menuItems.forEach((item, index) => {
            const isLast = index === menuItems.length - 1;
            const isLogout = item.id === 'logout';

            let divStyle = `
                display:flex;
                align-items:center;
                gap:14px;
                padding:14px 24px;
                cursor:pointer;
                transition:background 0.2s;
                color:var(--text-primary,#1a1a1a);
            `;

            let iconStyle = `
                font-size:18px;
                width:24px;
                text-align:center;
                color:var(--text-muted2,#8e8e93);
                transition:color 0.2s;
            `;

            if (isLogout) {
                divStyle += `
                    background: linear-gradient(135deg, #ff4d4d, #cc0000);
                    color: #ffffff;
                    border-radius: 10px;
                    margin: 4px 12px 0 12px;
                    padding: 14px 20px;
                `;
                iconStyle += `
                    color: #ffffff !important;
                `;
            }

            itemsHTML += `
                <div class="profile-menu-item" data-action="${item.id}" style="${divStyle}">
                    <i class="${item.icon}" style="${iconStyle}"></i>
                    <span style="font-size:14px;font-weight:500;">${item.label}</span>
                </div>
                ${!isLast && !isLogout ? `<div style="margin:0 24px;height:1px;background:var(--border-color,#f0f0f0);"></div>` : ''}
            `;
        });

        body.innerHTML = itemsHTML;

        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 14px 24px 20px;
            border-top: 1px solid var(--border-color, #f0f0f0);
            font-size: 11px;
            color: var(--text-muted, #888);
            text-align: center;
            flex-shrink: 0;
        `;
        footer.innerHTML = `CampusHub v2.0 • <span style="color:var(--green);">NG</span>`;

        sidebar.appendChild(header);
        sidebar.appendChild(body);
        sidebar.appendChild(footer);
        overlay.appendChild(sidebar);
        document.body.appendChild(overlay);

        profileSidebarInstance = {
            overlay,
            sidebar,
            header,
            body,
            footer,
            isOpen: false,
            closeBtn: header.querySelector('.profile-sidebar-close'),
            menuItems: body.querySelectorAll('.profile-menu-item'),
            avatar: header.querySelector('#profileSidebarAvatar'),
            name: header.querySelector('#profileSidebarName'),
            email: header.querySelector('#profileSidebarEmail'),
        };

        profileSidebarInstance.closeBtn.addEventListener('click', closeProfileSidebar);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeProfileSidebar();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && profileSidebarInstance && profileSidebarInstance.isOpen) {
                closeProfileSidebar();
            }
        });

        profileSidebarInstance.menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.dataset.action;
                handleProfileAction(action);
                closeProfileSidebar();
            });
        });

        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .profile-menu-item:hover {
                background: var(--bg-input, #f3f4f6);
            }
            .profile-menu-item:hover i {
                color: var(--green, #0d8a3e);
            }
            .profile-menu-item:active {
                transform: scale(0.98);
            }
            .dark-mode .profile-menu-item:hover {
                background: var(--bg-input, #2a2a2a);
            }
            .profile-sidebar-close:hover {
                background: var(--bg-input, #f3f4f6);
                color: var(--red, #e74c3c);
            }
            .dark-mode .profile-sidebar-close:hover {
                background: var(--bg-input, #2a2a2a);
            }
            @media (max-width: 480px) {
                .profile-sidebar {
                    width: 100%;
                    max-width: 100%;
                    border-radius: 0;
                }
                .profile-menu-item {
                    padding: 12px 20px !important;
                }
                .profile-menu-item i {
                    font-size: 16px !important;
                    width: 20px !important;
                }
                .profile-menu-item span {
                    font-size: 13px !important;
                }
            }
        `;
        document.head.appendChild(styleEl);

        profileSidebarInitialized = true;
        updateHeaderUser();
    }

    function openProfileSidebar() {
        if (!profileSidebarInstance) createProfileSidebar();
        if (!profileSidebarInstance) return;

        const { overlay, sidebar } = profileSidebarInstance;
        updateHeaderUser();

        overlay.style.display = 'block';
        void overlay.offsetWidth;
        overlay.style.opacity = '1';
        sidebar.style.transform = 'translateX(0)';
        profileSidebarInstance.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function closeProfileSidebar() {
        if (!profileSidebarInstance) return;

        const { overlay, sidebar } = profileSidebarInstance;
        overlay.style.opacity = '0';
        sidebar.style.transform = 'translateX(100%)';

        setTimeout(() => {
            overlay.style.display = 'none';
            profileSidebarInstance.isOpen = false;
            document.body.style.overflow = '';
        }, 350);
    }

    function handleProfileAction(action) {
        const pageMap = {
            'view-profile': 'profile.html',
            'buy-point': 'buy-point.html',
            'upload-id': 'upload-id.html',
            'change-visibility': 'visibility.html',
            'hall-verified': 'hall-verification.html',
            'add-2fa': '2fa.html',
            'report-issue': 'report.html',
            'help-improve': 'help-improve.html',
            'about-us': 'about-us.html',
            'term-condition': 'terms-privacy.html',
            'change-password': 'change-password.html',
        };

        if (action === 'logout') {
            logoutUser();
            return;
        }

        const page = pageMap[action];
        if (page) {
            navigateWithGuard(page);
        } else {
            console.warn('Unknown action:', action);
            if (typeof showAlert !== 'undefined') {
                showAlert.warning('Action not available yet.', { duration: 2000 });
            }
        }
    }

    window.openProfileSidebar = openProfileSidebar;
    window.closeProfileSidebar = closeProfileSidebar;

    window.updateFavouriteCount = function(count) {
        const el = document.getElementById('favouriteCount');
        if (el) {
            el.textContent = count;
        }
    };

    window.setNotificationDot = function(show) {
        const el = document.getElementById('notificationBell');
        if (el) {
            el.classList.toggle('badge-dot', show);
        }
    };

    // ============================================================
    // HEADER – Hide notification bell for unauthenticated users
    // ============================================================

    function renderHeader() {
        if (document.querySelector('.app-header')) return;

        const isAuth = isAuthenticated();
        const user = isAuth ? getUserData() : null;
        const hasUnread = user ? user.has_unread_notifications : false;

        const header = document.createElement('header');
        header.className = 'app-header';
        header.innerHTML = `
            <div class="logo" id="logoContainer">
                <i class="fa-solid fa-graduation-cap"></i>
                <span>CampusHub <small>NG</small></span>
            </div>
            <div class="header-actions">
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
                    <i class="fa-regular fa-sun"></i>
                    <i class="fa-regular fa-moon"></i>
                </button>
                ${isAuth ? `<i class="fa-regular fa-bell ${hasUnread ? 'badge-dot' : ''}" id="notificationBell"></i>` : ''}
                <i class="fa-regular fa-user-circle" id="profileIcon"></i>
            </div>
        `;

        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.prepend(header);
        } else {
            document.body.prepend(header);
        }

        const logo = document.getElementById('logoContainer');
        let clickCount = 0;
        let clickTimer = null;

        if (logo) {
            logo.addEventListener('click', function(e) {
                clickCount++;

                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        if (typeof navigateWithGuard === 'function') {
                            navigateWithGuard('dashboard.html');
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                        clickCount = 0;
                        clickTimer = null;
                    }, 300); 
                } else if (clickCount >= 2) {
                    clearTimeout(clickTimer);
                    clickTimer = null;
                    clickCount = 0;

                    this.classList.add('shake-logo');
                    setTimeout(() => {
                        this.classList.remove('shake-logo');
                    }, 600);

                    if (typeof showAlert !== 'undefined') {
                        setTimeout(() => {
                            showAlert.info('👋 Hey there! CampusHub is built with ❤️ for students.', { duration: 3000 });
                        }, 800);
                    }
                }
            });
        }

        const bell = document.getElementById('notificationBell');
        if (bell) {
            bell.addEventListener('click', function() {
                navigateWithGuard('notification.html');
            });
        }

        const profileIcon = document.getElementById('profileIcon');
        if (profileIcon) {
            const newIcon = profileIcon.cloneNode(true);
            profileIcon.parentNode.replaceChild(newIcon, profileIcon);
            newIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!profileSidebarInstance) createProfileSidebar();
                openProfileSidebar();
            });
        }

        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const newToggle = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);
            newToggle.addEventListener('click', function() {
                const html = document.documentElement;
                const isDark = html.classList.toggle('dark-mode');
                localStorage.setItem('campusHubTheme', isDark ? 'dark' : 'light');
            });
        }
    }

    // ============================================================
    // DARK MODE
    // ============================================================

    function initDarkMode() {
        const html = document.documentElement;
        const stored = localStorage.getItem('campusHubTheme');
        if (stored === 'dark') {
            html.classList.add('dark-mode');
        } else if (stored === 'light') {
            html.classList.remove('dark-mode');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                html.classList.add('dark-mode');
                localStorage.setItem('campusHubTheme', 'dark');
            } else {
                localStorage.setItem('campusHubTheme', 'light');
            }
        }
    }

    // ============================================================
    // FILTER SIDEBAR
    // ============================================================

    function initFilterSidebar() {
        const filterToggle = document.getElementById('filterToggle');
        const filterClose = document.getElementById('filterClose');
        const filterOverlay = document.getElementById('filterOverlay');
        const filterSidebar = document.getElementById('filterSidebar');
        const filterReset = document.getElementById('filterReset');
        const filterApply = document.getElementById('filterApply');

        function openSidebar() {
            if (!filterSidebar) return;
            filterSidebar.classList.add('active');
            filterOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            if (!filterSidebar) return;
            filterSidebar.classList.remove('active');
            filterOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (filterToggle) filterToggle.addEventListener('click', openSidebar);
        if (filterClose) filterClose.addEventListener('click', closeSidebar);
        if (filterOverlay) filterOverlay.addEventListener('click', closeSidebar);

        if (filterReset) {
            filterReset.addEventListener('click', function() {
                const inputs = filterSidebar.querySelectorAll('input, select');
                inputs.forEach(function(input) {
                    if (input.type === 'number' || input.type === 'text') {
                        input.value = '';
                    } else if (input.type === 'date') {
                        input.value = '';
                    } else if (input.tagName === 'SELECT') {
                        input.selectedIndex = 0;
                    }
                });
            });
        }

        if (filterApply) {
            filterApply.addEventListener('click', function() {
                console.log('Filters applied!');
                closeSidebar();
                    showToast('Filters applied!', 'success');             
            });
        }
    }

    // ============================================================
    // SCROLL TO TOP
    // ============================================================

    function initScrollToTop() {
        if (document.querySelector('.scroll-top-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'scroll-top-btn';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        btn.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            background: var(--green, #0d8a3e);
            color: #ffffff;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.8);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease, background 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
        });

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(btn);

        let ticking = false;

        function updateButton() {
            const scrollY = window.scrollY;
            const shouldShow = scrollY > 300;

            if (shouldShow) {
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
                btn.style.transform = 'translateY(0) scale(1)';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
                btn.style.transform = 'translateY(20px) scale(0.8)';
            }
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    updateButton();
                });
                ticking = true;
            }
        });

        if ('ontouchstart' in window) {
            let touchTimeout;
            window.addEventListener('touchstart', function() {
                clearTimeout(touchTimeout);
                const scrollY = window.scrollY;
                if (scrollY > 300) {
                    btn.style.opacity = '1';
                    btn.style.visibility = 'visible';
                    btn.style.transform = 'translateY(0) scale(1)';
                }
                touchTimeout = setTimeout(function() {
                    if (window.scrollY > 300) {
                        btn.style.opacity = '0.4';
                    }
                }, 3000);
            });
        }

        updateButton();
    }

    // ============================================================
    // DESKTOP OVERLAY
    // ============================================================

    function initDesktopOverlay() {
        if (window.innerWidth < 1024) return;
        if (document.querySelector('.desktop-overlay')) return;
        if (sessionStorage.getItem('campusHubDismissedOverlay') === 'true') return;

        const overlay = document.createElement('div');
        overlay.className = 'desktop-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;

        const card = document.createElement('div');
        card.style.cssText = `
            background: var(--bg-card, #ffffff);
            border-radius: var(--radius-card, 24px);
            max-width: 480px;
            width: 100%;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9) translateY(20px);
            transition: transform 0.4s ease, opacity 0.4s ease;
            opacity: 0;
            border: 1px solid var(--border-card, #f0f0f0);
            position: relative;
        `;

        card.innerHTML = `
            <div style="font-size: 56px; margin-bottom: 16px;">📱</div>
            <h2 style="font-size:24px; font-weight:700; color:var(--text-primary); margin-bottom:8px;">Mobile &amp; Tablet Only</h2>
            <p style="font-size:15px; color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">
                <strong>CampusHub</strong> is designed for <strong>mobile</strong> and <strong>tablet</strong> devices.
                For the best experience, please open this page on a smaller screen.
            </p>
            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                <span style="background:var(--green-bg); color:var(--green); padding:6px 16px; border-radius:30px; font-size:13px; font-weight:600;">📱 Mobile</span>
                <span style="background:var(--green-bg); color:var(--green); padding:6px 16px; border-radius:30px; font-size:13px; font-weight:600;">💻 Tablet</span>
            </div>
            <button class="overlay-dismiss-btn" style="margin-top:28px; padding:12px 32px; border:none; border-radius:30px; background:var(--green); color:#fff; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px rgba(0,0,0,0.1);">Continue Anyway</button>
            <button class="overlay-close-icon" style="position:absolute; top:16px; right:16px; background:none; border:none; font-size:24px; color:var(--text-muted2); cursor:pointer; padding:4px 8px; border-radius:8px; transition:background 0.2s, color 0.2s; line-height:1;">&times;</button>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
        });

        function dismiss() {
            overlay.style.opacity = '0';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9) translateY(20px)';
            setTimeout(() => {
                overlay.remove();
            }, 500);
            sessionStorage.setItem('campusHubDismissedOverlay', 'true');
        }

        card.querySelector('.overlay-dismiss-btn').addEventListener('click', dismiss);
        card.querySelector('.overlay-close-icon').addEventListener('click', dismiss);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) dismiss();
        });

        window.addEventListener('resize', function() {
            if (window.innerWidth < 1024 && document.querySelector('.desktop-overlay')) {
                dismiss();
            }
        });
    }

    // ============================================================
    // FORM GUARD – Warn on unsaved changes (uses Modal class)
    // ============================================================

    let isFormDirty = false;
    let formGuardActive = true;

    function setFormDirty(dirty = true) {
        isFormDirty = dirty;
    }

    function resetFormDirty() {
        isFormDirty = false;
    }

    function getFormDirty() {
        return isFormDirty;
    }

    function showLeaveConfirmModal(onConfirm, onCancel) {
        if (typeof Modal !== 'function') {
            // fallback to browser confirm if Modal not loaded
            if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                if (typeof onConfirm === 'function') onConfirm();
            } else {
                if (typeof onCancel === 'function') onCancel();
            }
            return;
        }

        const modal = new Modal({
            title: 'Unsaved Changes',
            type: 'warning',
            body: `
                <div style="text-align:center; padding: 8px 0;">
                    <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
                    <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.6;">
                        You have unsaved changes in your form.<br>
                        If you leave now, your input will be discarded.
                    </p>
                </div>
            `,
            confirmText: 'Leave Anyway',
            cancelText: 'Stay',
            showConfirm: true,
            showCancel: true,
            closeOnOverlay: false,
            closeOnEsc: false,
            onConfirm: function() {
                if (typeof onConfirm === 'function') onConfirm();
                modal.destroy();
            },
            onCancel: function() {
                if (typeof onCancel === 'function') onCancel();
                modal.destroy();
            }
        });
        modal.open();
    }

    function navigateWithGuard(url, bypass = false) {
        if (!url) return;
        if (bypass || !isFormDirty || !formGuardActive) {
            window.location.href = url;
            return;
        }

        showLeaveConfirmModal(
            function() { // Leave
                resetFormDirty();
                window.location.href = url;
            },
            function() { // Stay – do nothing
            }
        );
    }

    function initFormGuard() {
        // ── Detect form changes ──
        document.addEventListener('input', function(e) {
            const form = e.target.closest('form');
            if (form && !form.dataset.guardDisabled) {
                isFormDirty = true;
            }
        });

        document.addEventListener('change', function(e) {
            const form = e.target.closest('form');
            if (form && !form.dataset.guardDisabled) {
                isFormDirty = true;
            }
        });

        // ── Before unload (refresh / close tab) ──
        window.addEventListener('beforeunload', function(e) {
            if (isFormDirty && formGuardActive) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });

        // ── Intercept link clicks (anchor tags) ──
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a');
            if (!target) return;
            const href = target.getAttribute('href');
            if (!href) return;
            if (href.startsWith('javascript:')) return;
            if (href.startsWith('#')) return;
            if (target.target === '_blank') return;
            if (href.startsWith('mailto:') || href.startsWith('tel:')) return;

            const url = new URL(href, window.location.origin);
            if (url.origin !== window.location.origin) return;

            if (isFormDirty && formGuardActive) {
                e.preventDefault();
                navigateWithGuard(href);
            }
        });

        // ── Intercept popstate (back/forward) ──
        let popstateIntercept = false;
        window.addEventListener('popstate', function(e) {
            if (isFormDirty && formGuardActive && !popstateIntercept) {
                popstateIntercept = true;
                history.pushState(null, '', window.location.href);
                showLeaveConfirmModal(
                    function() {
                        resetFormDirty();
                        window.history.back();
                    },
                    function() {
                        popstateIntercept = false;
                    }
                );
            } else {
                popstateIntercept = false;
            }
        });

        // ── Reset dirty on successful form submit ──
        document.addEventListener('submit', function(e) {
            const form = e.target.closest('form');
            if (form && !form.dataset.guardDisabled) {
                setTimeout(() => {
                    resetFormDirty();
                }, 300);
            }
        }, true);
    }

    // ============================================================
    // BOTTOM NAV – Unauthenticated handling
    // ============================================================

    function renderBottomNav(activePage) {
        if (document.querySelector('.bottom-nav')) return;

        const validPages = ['dashboard', 'explore', 'favourites', 'lost-item'];
        if (!activePage || !validPages.includes(activePage)) {
            const path = window.location.pathname;
            if (path.includes('explore')) activePage = 'explore';
            else if (path.includes('favourites')) activePage = 'favourites';
            else if (path.includes('lost-item')) activePage = 'lost-item';
            else activePage = 'dashboard';
        }

        const isAuth = isAuthenticated();

        const nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <div class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </div>
            <div class="nav-item ${activePage === 'explore' ? 'active' : ''}" data-page="explore">
                <i class="fa-solid fa-compass"></i>
                <span>Explore</span>
            </div>
            <div class="nav-item sell-btn">
                <i class="fa-solid fa-plus"></i>
                <span>Sell</span>
            </div>
            <div class="nav-item ${activePage === 'favourites' ? 'active' : ''}" data-page="favourites">
                <i class="fa-regular fa-heart"></i>
                <span>Favourites</span>
                <span class="nav-badge" id="favouriteCount">0</span>
            </div>
            <div class="nav-item ${activePage === 'lost-item' ? 'active' : ''}" data-page="lost-item">
                <i class="fa-regular fa-circle-question"></i>
                <span>Lost Item</span>
            </div>
        `;

        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.appendChild(nav);
        } else {
            document.body.appendChild(nav);
        }

        // ─── Nav item click handler ──────────────────────────────
        nav.querySelectorAll('.nav-item:not(.sell-btn)').forEach(function(item) {
            item.addEventListener('click', function() {
                const page = this.dataset.page;
                if (!page) return;

                if (!isAuth) {
                    // Unauthenticated: handle navigation
                    handleUnauthenticatedNav(page);
                    return;
                }

                // Authenticated: normal navigation
                navigateWithGuard(page + '.html');
            });
        });

        // ─── Sell button ──────────────────────────────────────────
        const sellBtn = nav.querySelector('.sell-btn');
        if (sellBtn) {
            sellBtn.addEventListener('click', function() {
                if (!isAuth) {
                    handleUnauthenticatedNav('sell');
                    return;
                }
                navigateWithGuard('create-listing.html');
            });
        }

        // ─── Helper to handle unauthenticated nav ────────────────────
        function handleUnauthenticatedNav(page) {
            if (page === 'explore') {
                window.location.href = 'default-explore.html';
                return;
            }

            // Otherwise, go to default.html with a message based on the page
            let message = '';
            switch (page) {
                case 'dashboard':
                    message = 'Home';
                    break;
                case 'favourites':
                    message = 'Favourites';
                    break;
                case 'lost-item':
                    message = 'Lost & Found';
                    break;
                case 'sell':
                    message = 'Sell an Item';
                    break;
                default:
                    message = 'This feature';
            }
            window.location.href = `default.html?page=${page}&message=${encodeURIComponent(message)}`;
        }
    }

    // ============================================================
    // PROTECTED PAGE CHECK – Remove about-us and help-improve
    // ============================================================

    function checkProtectedPage() {
        const protectedPages = ['dashboard.html', 'profile.html', 'favourites.html',
            'lost-item.html', 'notification.html', 'create-listing.html',
            'buy-point.html', 'upload-id.html', 'visibility.html',
            'hall-verification.html', 'device.html', '2fa.html',
            'report.html', 'change-password.html'
        ];
        // Removed: 'about-us.html', 'help-improve.html'

        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage) && !isAuthenticated()) {
            if (typeof showAlert !== 'undefined') {
                showAlert.warning('Please login to access this page.', { duration: 2000 });
            }
            setTimeout(() => {
                window.location.href = '/auth/auth.html';
            }, 300);
            return false;
        }
        return true;
    }

    // ============================================================
    // TOAST SYSTEM (Global)
    // ============================================================

    let toastElement = null;
    let toastTimer = null;

    function createToastElement() {
        if (toastElement) return toastElement;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'globalToast';
        toast.innerHTML = `
            <span class="toast-icon success"><i class="fa-regular fa-circle-check"></i></span>
            <span class="toast-message">Action completed</span>
        `;
        document.body.appendChild(toast);
        toastElement = toast;
        return toastElement;
    }

    function showToast(message, type = 'success') {
        const toast = createToastElement();
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');

        if (!toastMessage || !toastIcon) return;

        // Set message
        toastMessage.textContent = message;

        // Set icon and type
        toastIcon.className = 'toast-icon';
        if (type === 'success') {
            toastIcon.classList.add('success');
            toastIcon.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
        } else if (type === 'warning') {
            toastIcon.classList.add('warning');
            toastIcon.innerHTML = '<i class="fa-regular fa-triangle-exclamation"></i>';
        } else if (type === 'danger') {
            toastIcon.classList.add('danger');
            toastIcon.innerHTML = '<i class="fa-regular fa-circle-xmark"></i>';
        } else {
            toastIcon.classList.add('success');
            toastIcon.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
        }

        // Show toast
        toast.classList.add('visible');

        // Clear existing timer
        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }

        // Auto-hide after 3 seconds
        toastTimer = setTimeout(() => {
            toast.classList.remove('visible');
            toastTimer = null;
        }, 3000);
    }

    // ============================================================
    // INIT
    // ============================================================

    function init() {
        initDarkMode();
        checkProtectedPage();
        createProfileSidebar();
        renderHeader();
        initFilterSidebar();
        renderBottomNav();
        initScrollToTop();
        initDesktopOverlay();
        initFormGuard(); // <── form guard initialised
        updateHeaderUser();

        setTimeout(function() {
            const profileIcon = document.querySelector('#profileIcon');
            if (profileIcon) {
                const newIcon = profileIcon.cloneNode(true);
                profileIcon.parentNode.replaceChild(newIcon, profileIcon);
                newIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!profileSidebarInstance) createProfileSidebar();
                    openProfileSidebar();
                });
            }
        }, 100);
    }

    // ============================================================
    // EXPOSE GLOBALLY
    // ============================================================
    window.AUTH_URL = AUTH_URL;
    window.CAMPUS_URL = CAMPUS_URL;
    window.NOTIFICATIONS_URL = NOTIFICATIONS_URL;

    window.fetchWithAuth = fetchWithAuth;
    window.showGlobalSpinner = showGlobalSpinner;
    window.hideGlobalSpinner = hideGlobalSpinner;
    window.openProfileSidebar = openProfileSidebar;
    window.closeProfileSidebar = closeProfileSidebar;
    window.logoutUser = logoutUser;
    window.getUserData = getUserData;
    window.isAuthenticated = isAuthenticated;
    window.setUserData = setUserData;
    window.updateHeaderUser = updateHeaderUser;
    window.clearUserSession = clearUserSession;
    window.listingStatusMap = listingStatusMap;
    window.notificationTypeMap = notificationTypeMap;
    window.refreshPointBalance = refreshPointBalance;

    // Form guard exports
    window.setFormDirty = setFormDirty;
    window.resetFormDirty = resetFormDirty;
    window.getFormDirty = getFormDirty;
    window.navigateWithGuard = navigateWithGuard;
    window.showLeaveConfirmModal = showLeaveConfirmModal;

    window.showToast = showToast;

    // ============================================================
    // DOM READY
    // ============================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();