    // ============================================================
    // global.js – Shared functionality for all pages
    // Includes: header, dark mode, filter sidebar, bottom nav, scroll to top, desktop overlay, profile sidebar
    // ============================================================

    (function() {
        'use strict';

        // ============================================================
        // GLOBAL SPINNER & FETCH WITH AUTH
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

        async function fetchWithAuth(url, options = {}) {
            const opts = {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            if (opts.includeAuth) {
                const token = localStorage.getItem('authToken');
                if (token) {
                    opts.headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const showSpinner = opts.showSpinner === true;
            let spinnerText = opts.spinnerText || 'Loading…';

            if (showSpinner) {
                showGlobalSpinner(spinnerText);
            }

            try {
                const response = await fetch(url, opts);
                return response;
            } catch (error) {
                throw error;
            } finally {
                if (showSpinner) {
                    hideGlobalSpinner();
                }
            }
        }

        window.fetchWithAuth = fetchWithAuth;
        window.showGlobalSpinner = showGlobalSpinner;
        window.hideGlobalSpinner = hideGlobalSpinner;

        // ============================================================
        // PROFILE SIDEBAR
        // ============================================================

        let profileSidebarInstance = null;
        let profileSidebarInitialized = false;

        function createProfileSidebar() {
            if (document.querySelector('.profile-sidebar-overlay')) return;

            // ─── Overlay ──────────────────────────────────────────────
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

            // ─── Sidebar ──────────────────────────────────────────────
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

            // ─── Header ──────────────────────────────────────────────
            const header = document.createElement('div');
            header.style.cssText = `
                    padding: 20px 24px 16px;
                    border-bottom: 1px solid var(--border-color, #f0f0f0);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                `;
            header.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:44px;height:44px;border-radius:50%;background:var(--green-bg,#eaf9ef);color:var(--green,#0d8a3e);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;border:2px solid var(--green,#0d8a3e);flex-shrink:0;" id="profileSidebarAvatar">S</div>
                        <div>
                            <div style="font-size:15px;font-weight:700;color:var(--text-primary,#1a1a1a);" id="profileSidebarName">Student</div>
                            <div style="font-size:12px;color:var(--text-muted,#888);">@student.uniben</div>
                        </div>
                    </div>
                    <button class="profile-sidebar-close" style="background:none;border:none;font-size:24px;color:var(--text-muted2,#8e8e93);cursor:pointer;padding:4px 8px;border-radius:8px;transition:background 0.2s,color 0.2s;line-height:1;">&times;</button>
                `;

            // ─── Body ──────────────────────────────────────────────────
            const body = document.createElement('div');
            body.style.cssText = `
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                `;

            const menuItems = [
                { icon: 'fa-regular fa-user', label: 'View Profile', id: 'view-profile' },
                { icon: 'fa-regular fa-id-card', label: 'Upload Student ID', id: 'upload-id' },
                { icon: 'fa-regular fa-eye', label: 'Change Visibility', id: 'change-visibility' },
                { icon: 'fa-regular fa-laptop', label: 'Device', id: 'device' },
                { icon: 'fa-regular fa-shield-halved', label: 'Add 2FA', id: 'add-2fa' },
                { icon: 'fa-regular fa-flag', label: 'Report Issue / Abuse', id: 'report-issue' },
                { icon: 'fa-regular fa-key', label: 'Change Password', id: 'change-password' },
                { icon: 'fa-regular fa-right-from-bracket', label: 'Logout', id: 'logout' },
            ];

            let itemsHTML = '';
            menuItems.forEach((item, index) => {
                const isLast = index === menuItems.length - 1;
                itemsHTML += `
                        <div class="profile-menu-item" data-action="${item.id}" style="display:flex;align-items:center;gap:14px;padding:14px 24px;cursor:pointer;transition:background 0.2s;color:var(--text-primary,#1a1a1a);">
                            <i class="${item.icon}" style="font-size:18px;width:24px;text-align:center;color:var(--text-muted2,#8e8e93);transition:color 0.2s;"></i>
                            <span style="font-size:14px;font-weight:500;">${item.label}</span>
                        </div>
                        ${!isLast ? `<div style="margin:0 24px;height:1px;background:var(--border-color,#f0f0f0);"></div>` : ''}
                    `;
            });

            body.innerHTML = itemsHTML;

            // ─── Footer ──────────────────────────────────────────────
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

            // ─── Assemble ─────────────────────────────────────────────
            sidebar.appendChild(header);
            sidebar.appendChild(body);
            sidebar.appendChild(footer);
            overlay.appendChild(sidebar);
            document.body.appendChild(overlay);

            // ─── Store refs ───────────────────────────────────────────
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
            };

            // ─── Event listeners ──────────────────────────────────────
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

            // ─── Styles ──────────────────────────────────────────────
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
        }

        function openProfileSidebar() {
            if (!profileSidebarInstance) createProfileSidebar();
            if (!profileSidebarInstance) return;

            const { overlay, sidebar } = profileSidebarInstance;

            // Update avatar and name from DOM
            const headerName = document.querySelector('.logo span')?.textContent?.trim() || 'Student';

            if (profileSidebarInstance.avatar) {
                const firstLetter = headerName.charAt(0).toUpperCase() || 'S';
                profileSidebarInstance.avatar.textContent = firstLetter;
            }
            if (profileSidebarInstance.name) {
                profileSidebarInstance.name.textContent = headerName;
            }

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
            const messages = {
                'view-profile': '📋 Navigating to profile page…',
                'upload-id': '📤 Opening student ID upload…',
                'change-visibility': '👁️ Toggling visibility settings…',
                'device': '📱 Device management…',
                'add-2fa': '🔐 Setting up 2-factor authentication…',
                'report-issue': '🚩 Reporting issue / abuse…',
                'change-password': '🔑 Changing password…',
                'logout': '👋 Logging out…',
            };

            const msg = messages[action] || `Action: ${action}`;

            if (action === 'logout') {
                if (typeof showAlert !== 'undefined') {
                    showAlert.info('Logging out…', { duration: 2000 });
                } else {
                    alert('Logging out…');
                }
                return;
            }

            if (typeof showAlert !== 'undefined') {
                showAlert.info(msg, { duration: 2000 });
            } else {
                alert(msg);
            }

            console.log(`📌 Profile action: ${action}`);
        }

        window.openProfileSidebar = openProfileSidebar;
        window.closeProfileSidebar = closeProfileSidebar;

        // ============================================================
        // HEADER
        // ============================================================

        function renderHeader() {
            if (document.querySelector('.app-header')) return;

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
                        <i class="fa-regular fa-bell badge-dot" id="notificationBell"></i>
                        <i class="fa-regular fa-user-circle" id="profileIcon"></i>
                    </div>
                `;

            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.prepend(header);
            } else {
                document.body.prepend(header);
            }

            // ─── Logo double-click shake ─────────────────────────────
            const logo = document.getElementById('logoContainer');
            let clickCount = 0;
            let clickTimer = null;
            if (logo) {
                logo.addEventListener('click', function(e) {
                    clickCount++;
                    if (clickCount === 1) {
                        clickTimer = setTimeout(() => {
                            clickCount = 0;
                        }, 400);
                    } else if (clickCount >= 2) {
                        clearTimeout(clickTimer);
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

            // ─── Notification bell ──────────────────────────────────
            const bell = document.getElementById('notificationBell');
            if (bell) {
                bell.addEventListener('click', function() {
                    window.location.href = 'notification.html';
                });
            }

            // ─── Profile icon ────────────────────────────────────────
            const profileIcon = document.getElementById('profileIcon');
            if (profileIcon) {
                // Remove any existing listeners by cloning
                const newIcon = profileIcon.cloneNode(true);
                profileIcon.parentNode.replaceChild(newIcon, profileIcon);
                newIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    // Create sidebar if not yet created
                    if (!profileSidebarInstance) createProfileSidebar();
                    openProfileSidebar();
                });
            }

            // ─── Theme toggle ────────────────────────────────────────
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
                    if (typeof showAlert !== 'undefined') {
                        showAlert.success('Filters applied!');
                    } else {
                        alert('Filters applied! (This is a demo)');
                    }
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
        // BOTTOM NAV
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
                        <span>favourites</span>
                        <span class="nav-badge">3</span>
                    </div>
                    <div class="nav-item ${activePage === 'lost-item' ? 'active' : ''}" data-page="lost-item">
                        <i class="fa-regular fa-user"></i>
                        <span>Lost Item</span>
                    </div>
                `;

            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.appendChild(nav);
            } else {
                document.body.appendChild(nav);
            }

            nav.querySelectorAll('.nav-item:not(.sell-btn)').forEach(function(item) {
                item.addEventListener('click', function() {
                    const page = this.dataset.page;
                    if (page) {
                        window.location.href = '' + page + '.html';
                    }
                });
            });

            const sellBtn = nav.querySelector('.sell-btn');
            if (sellBtn) {
                sellBtn.addEventListener('click', function() {
                    if (typeof showAlert !== 'undefined') {
                        showAlert.info('Sell page coming soon!');
                    } else if (typeof Modal !== 'undefined') {
                        const modal = new Modal({
                            title: '📦 Sell Your Item',
                            body: '<p>The sell feature is under development. Check back soon!</p>',
                            type: 'info',
                            confirmText: 'Got it',
                            showCancel: false
                        });
                        modal.open();
                    } else {
                        alert('Sell page coming soon!');
                    }
                });
            }
        }

        // ============================================================
        // INIT
        // ============================================================

        function init() {
            initDarkMode();

            // Create profile sidebar DOM early
            createProfileSidebar();

            renderHeader();
            initFilterSidebar();
            renderBottomNav();
            initScrollToTop();
            initDesktopOverlay();

            // Ensure profile icon listener is attached after header render
            setTimeout(function() {
                const profileIcon = document.querySelector('#profileIcon');
                if (profileIcon) {
                    // Check if it already has our listener (by checking if it has a click listener that opens the sidebar)
                    // We'll just re-attach safely by cloning
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

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

    })();
