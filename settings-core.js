class SettingsManager {
    constructor() {
        this.storageKey = 'corrode_settings';
        this.defaultSettings = {
            theme: 'dark',
            autoBlobCloak: false,
            autoAboutBlankCloak: false,
            tabTitle: 'Corrode',
            tabIcon: 'favicon.png',
            customTitle: '',
            customIcon: '',
            enableAnimations: true,
            compactMode: false,
            showGamesCounter: true,
            proxyMode: 'wisp',
            cloakMethod: 'none',
            announcementEnabled: true
        };
        
        this.settings = { ...this.defaultSettings };
        this.tabCloakPresets = [
            {
                name: 'Google Drive',
                title: 'Google Drive',
                icon: 'https://www.google.com/favicon.ico',
                iconClass: 'fab fa-google-drive'
            },
            {
                name: 'Google Docs',
                title: 'Google Docs',
                icon: 'https://docs.google.com/favicon.ico',
                iconClass: 'fas fa-file-word'
            },
            {
                name: 'Gmail',
                title: 'Gmail',
                icon: 'https://mail.google.com/favicon.ico',
                iconClass: 'fas fa-envelope'
            },
            {
                name: 'Classroom',
                title: 'Google Classroom',
                icon: 'https://classroom.google.com/favicon.ico',
                iconClass: 'fas fa-chalkboard-teacher'
            },
            {
                name: 'Canvas',
                title: 'Canvas',
                icon: 'https://www.instructure.com/favicon.ico',
                iconClass: 'fas fa-university'
            },
            {
                name: 'Calculator',
                title: 'Calculator',
                icon: 'https://www.calculator.net/favicon.ico',
                iconClass: 'fas fa-calculator'
            },
            {
                name: 'Wikipedia',
                title: 'Wikipedia',
                icon: 'https://www.wikipedia.org/favicon.ico',
                iconClass: 'fab fa-wikipedia-w'
            },
            {
                name: 'YouTube',
                title: 'YouTube',
                icon: 'https://www.youtube.com/favicon.ico',
                iconClass: 'fab fa-youtube'
            },
            {
                name: 'Zoom',
                title: 'Zoom',
                icon: 'https://zoom.us/favicon.ico',
                iconClass: 'fas fa-video'
            },
            {
                name: 'Default',
                title: 'Corrode',
                icon: 'favicon.png',
                iconClass: 'fas fa-ghost'
            }
        ];
        
        this.cloakApplied = false;
        this.init();
    }

    init() {
        this.loadSettings();
        this.applyAllSettings();
        this.setupUI();
        this.setupEventListeners();
        this.updateStats();
        this.checkCurrentCloak();
        setTimeout(() => this.autoCloak(), 1500);
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.defaultSettings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            this.showStatus('Settings saved!', 'success');
            this.updateStats();
            window.dispatchEvent(new CustomEvent('settingsUpdated', { 
                detail: this.settings 
            }));
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings!', 'error');
        }
    }

    updateSetting(key, value) {
        const oldValue = this.settings[key];
        this.settings[key] = value;
        this.saveSettings();
        this.applyAllSettings();
        this.updateUI();

        if ((key === 'autoBlobCloak' || key === 'autoAboutBlankCloak') && oldValue !== value) {
            this.autoCloak();
        }

        if (key === 'announcementEnabled') {
            this.handleAnnouncementSetting();
        }

        if (key === 'showGamesCounter') {
            this.applyGamesCounter(true);
        }
    }

    applyAllSettings() {
        this.applyTheme(this.settings.theme);
        this.applyTabCloak();
        this.applyAnimations();
        this.applyCompactMode();
        this.applyGamesCounter(true);
        this.handleAnnouncementSetting();
        this.updateActiveCloakButton();
    }

    applyTheme(theme) {
        document.body.classList.remove(
            'theme-dark', 'theme-blue', 'theme-purple', 
            'theme-green', 'theme-red'
        );
        document.body.classList.add(`theme-${theme}`);
        
        this.updateCSSVariables(theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeStat = document.getElementById('currentTheme');
        if (themeStat) {
            const themeNames = {
                'dark': 'Dark',
                'blue': 'Blue',
                'purple': 'Purple',
                'green': 'Green',
                'red': 'Red'
            };
            themeStat.textContent = themeNames[theme] || 'Dark';
        }
        
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: theme } 
        }));
    }

    updateCSSVariables(theme) {
        const themes = {
            dark: {
                '--void': '#000000',
                '--abyss': '#0a0a0a',
                '--midnight': '#111111',
                '--shadow': '#222222',
                '--dusk': '#333333'
            },
            blue: {
                '--void': '#000c1a',
                '--abyss': '#0a1a2a',
                '--midnight': '#112a3a',
                '--shadow': '#223a4a',
                '--dusk': '#334a5a'
            },
            purple: {
                '--void': '#0a001a',
                '--abyss': '#1a0a2a',
                '--midnight': '#2a1a3a',
                '--shadow': '#3a2a4a',
                '--dusk': '#4a3a5a'
            },
            green: {
                '--void': '#001a0a',
                '--abyss': '#0a2a1a',
                '--midnight': '#1a3a2a',
                '--shadow': '#2a4a3a',
                '--dusk': '#3a5a4a'
            },
            red: {
                '--void': '#1a0000',
                '--abyss': '#2a0a0a',
                '--midnight': '#3a1a1a',
                '--shadow': '#4a2a2a',
                '--dusk': '#5a3a3a'
            }
        };
        
        const themeVars = themes[theme] || themes.dark;
        Object.entries(themeVars).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }

    applyAnimations() {
        const enableAnimations = this.settings.enableAnimations;
        if (enableAnimations) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
    }

    applyCompactMode() {
        if (this.settings.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }

    applyGamesCounter(force = false) {
        const showGamesCounter = this.settings.showGamesCounter;
        const gamesCounters = document.querySelectorAll('#gamesCounter, .games-counter, [data-games-counter]');
        
        gamesCounters.forEach(counter => {
            if (showGamesCounter) {
                counter.style.display = 'flex';
                counter.style.visibility = 'visible';
                counter.style.opacity = '1';
            } else {
                counter.style.display = 'none';
                counter.style.visibility = 'hidden';
                counter.style.opacity = '0';
            }
        });
        
        this.updateStats();
    }

    applyTabCloak() {
        const title = this.settings.customTitle || this.settings.tabTitle;
        const icon = this.settings.customIcon || this.settings.tabIcon;
        
        document.title = title;
        
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = icon;
        
        const cloakStat = document.getElementById('currentCloak');
        if (cloakStat) {
            cloakStat.textContent = this.settings.cloakMethod === 'none' ? 'None' : 
                                   this.settings.cloakMethod.charAt(0).toUpperCase() + 
                                   this.settings.cloakMethod.slice(1);
        }
    }

    handleAnnouncementSetting() {
        if (!this.settings.announcementEnabled) {
            sessionStorage.removeItem('announcement_shown');
            const announcementModal = document.getElementById('announcementModal');
            if (announcementModal) {
                announcementModal.style.display = 'none';
            }
        }
    }

    updateActiveCloakButton() {
        document.querySelectorAll('.cloak-action-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.cloak === this.settings.cloakMethod) {
                btn.classList.add('active');
            }
        });
    }

    setupUI() {
        document.querySelectorAll('.theme-selector').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.theme === this.settings.theme) {
                card.classList.add('active');
            }
        });
        
        this.updateAllToggleSwitches();
        
        const titleInput = document.getElementById('tabTitleInput');
        const iconInput = document.getElementById('tabIconInput');
        
        if (titleInput) titleInput.value = this.settings.customTitle || '';
        if (iconInput) iconInput.value = this.settings.customIcon || '';
        
        this.setupTabCloakPresets();
        this.updateActiveCloakButton();
    }

    updateAllToggleSwitches() {
        const toggleSwitches = [
            { id: 'autoBlobCloak', setting: 'autoBlobCloak' },
            { id: 'autoAboutBlankCloak', setting: 'autoAboutBlankCloak' },
            { id: 'enableAnimations', setting: 'enableAnimations' },
            { id: 'compactMode', setting: 'compactMode' },
            { id: 'showGamesCounter', setting: 'showGamesCounter' },
            { id: 'announcementEnabled', setting: 'announcementEnabled' }
        ];
        
        toggleSwitches.forEach(item => {
            const checkbox = document.getElementById(item.id);
            if (checkbox) {
                checkbox.checked = this.settings[item.setting];
            }
        });
    }

    setupTabCloakPresets() {
        const presetsContainer = document.getElementById('cloakPresets');
        if (!presetsContainer) return;
        
        presetsContainer.innerHTML = '';
        
        this.tabCloakPresets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.innerHTML = `<i class="${preset.iconClass}"></i> ${preset.name}`;
            btn.title = `Set title to "${preset.title}" and icon to ${preset.icon}`;
            btn.dataset.presetTitle = preset.title;
            btn.dataset.presetIcon = preset.icon;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                this.updateSetting('customTitle', preset.title);
                this.updateSetting('customIcon', preset.icon);
                
                const titleInput = document.getElementById('tabTitleInput');
                const iconInput = document.getElementById('tabIconInput');
                if (titleInput) titleInput.value = preset.title;
                if (iconInput) iconInput.value = preset.icon;
                
                this.showStatus(`${preset.name} preset applied!`, 'success');
            });
            
            presetsContainer.appendChild(btn);
        });
    }

    updateUI() {
        this.setupUI();
    }

    updateStats() {
        const gamesCountStat = document.getElementById('gamesCountStat');
        if (gamesCountStat) {
            try {
                const gamesCount = localStorage.getItem('corrode_display_games') || 
                                  localStorage.getItem('corrode_total_games') || 
                                  '0';
                gamesCountStat.textContent = gamesCount;
            } catch (e) {
                gamesCountStat.textContent = '0';
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const themeSelector = e.target.closest('.theme-selector');
            if (themeSelector) {
                const theme = themeSelector.dataset.theme;
                this.updateSetting('theme', theme);
            }
        });
        
        this.setupToggleListeners();
        
        document.querySelectorAll('.cloak-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = btn.dataset.cloak;
                
                if (method === 'none') {
                    if (confirm('Remove cloak and reload page?')) {
                        this.removeCloak();
                    }
                } else {
                    if (confirm(`Apply ${method} cloak? This will reload the page.`)) {
                        this.quickCloak(method);
                    }
                }
            });
        });
        
        const setTitleBtn = document.getElementById('setTabTitle');
        if (setTitleBtn) {
            setTitleBtn.addEventListener('click', () => {
                const titleInput = document.getElementById('tabTitleInput');
                if (titleInput) {
                    const title = titleInput.value.trim();
                    if (title) {
                        this.updateSetting('customTitle', title);
                        this.showStatus('Tab title updated!', 'success');
                    }
                }
            });
        }
        
        const setIconBtn = document.getElementById('setTabIcon');
        if (setIconBtn) {
            setIconBtn.addEventListener('click', () => {
                const iconInput = document.getElementById('tabIconInput');
                if (iconInput) {
                    const icon = iconInput.value.trim();
                    if (icon) {
                        this.updateSetting('customIcon', icon);
                        this.showStatus('Tab icon updated!', 'success');
                    }
                }
            });
        }
        
        const resetTabCloakBtn = document.getElementById('resetTabCloak');
        if (resetTabCloakBtn) {
            resetTabCloakBtn.addEventListener('click', () => {
                if (confirm('Reset tab cloak to defaults?')) {
                    this.updateSetting('customTitle', '');
                    this.updateSetting('customIcon', '');
                    
                    const titleInput = document.getElementById('tabTitleInput');
                    const iconInput = document.getElementById('tabIconInput');
                    if (titleInput) titleInput.value = '';
                    if (iconInput) iconInput.value = '';
                    
                    this.showStatus('Tab cloak reset!', 'success');
                }
            });
        }
        
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        const applyBtn = document.getElementById('applySettings');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyAllSettings();
                this.showStatus('Settings applied!', 'success');
            });
        }
        
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all settings to defaults?')) {
                    localStorage.removeItem(this.storageKey);
                    this.loadSettings();
                    this.applyAllSettings();
                    this.setupUI();
                    this.updateStats();
                    this.showStatus('Settings reset to defaults!', 'success');
                }
            });
        }
        
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (e.target.id === 'tabTitleInput') {
                    document.getElementById('setTabTitle')?.click();
                } else if (e.target.id === 'tabIconInput') {
                    document.getElementById('setTabIcon')?.click();
                }
            }
        });
    }
    
    setupToggleListeners() {
        const toggleIds = [
            'autoBlobCloak',
            'autoAboutBlankCloak', 
            'enableAnimations',
            'compactMode',
            'showGamesCounter',
            'announcementEnabled'
        ];
        
        toggleIds.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                const newCheckbox = checkbox.cloneNode(true);
                checkbox.parentNode.replaceChild(newCheckbox, checkbox);
                const freshCheckbox = document.getElementById(id);
                
                freshCheckbox.addEventListener('change', (e) => {
                    this.updateSetting(id, e.target.checked);
                });
                
                freshCheckbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('settingStatus');
        if (!statusEl) return;
        
        statusEl.textContent = message;
        statusEl.className = 'setting-status';
        statusEl.classList.add(type);
        
        clearTimeout(this.statusTimeout);
        this.statusTimeout = setTimeout(() => {
            statusEl.textContent = 'Settings will be saved automatically';
            statusEl.className = 'setting-status';
        }, 3000);
    }

    checkCurrentCloak() {
        if (window.location.protocol === 'blob:') {
            this.settings.cloakMethod = 'blob';
            this.cloakApplied = true;
        }
        
        if (window.location.href === 'about:blank' || 
            window.parent !== window || 
            window !== window.top) {
            this.settings.cloakMethod = 'about-blank';
            this.cloakApplied = true;
        }
    }
    
    autoCloak() {
        if (this.cloakApplied) {
            return;
        }
        
        const isMainPage = window.location.protocol !== 'blob:' && 
                          window.location.href !== 'about:blank' &&
                          window === window.top;
        
        if (!isMainPage) {
            return;
        }
        
        if (this.settings.autoBlobCloak && !this.cloakApplied) {
            this.cloakApplied = true;
            setTimeout(() => {
                if (!this.cloakInterrupted) {
                    this.blobCloak();
                }
            }, 1000);
        } else if (this.settings.autoAboutBlankCloak && !this.cloakApplied) {
            this.cloakApplied = true;
            setTimeout(() => {
                if (!this.cloakInterrupted) {
                    this.aboutBlankCloak();
                }
            }, 1000);
        }
    }

    blobCloak() {
        if (window.location.protocol === 'blob:') {
            return;
        }
        
        const currentUrl = window.location.href;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>New Tab</title>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: #000; 
                        overflow: hidden;
                    }
                    iframe { 
                        position: fixed; 
                        top: 0; 
                        left: 0; 
                        width: 100%; 
                        height: 100%; 
                        border: none; 
                    }
                </style>
            </head>
            <body class="theme-${this.settings.theme}">
                <iframe src="${currentUrl}" id="corrodeFrame"></iframe>
                <script>
                    try {
                        localStorage.setItem('corrode_cloak_active', 'blob');
                        sessionStorage.setItem('corrode_in_cloak', 'true');
                    } catch(e) {}
                    
                    try {
                        window.history.replaceState(null, null, 'about:blank');
                    } catch(e) {}
                    
                    if (window.frameElement && window.parent !== window) {
                        console.log('Already in iframe, stopping');
                    }
                </script>
            </body>
            </html>
        `;
        
        try {
            const blob = new Blob([html], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            this.settings.cloakMethod = 'blob';
            this.saveSettings();
            this.cloakApplied = true;
            
            window.location.href = blobUrl;
        } catch (error) {
            console.error('Blob cloak failed:', error);
            this.cloakApplied = false;
            this.showStatus('Blob cloak failed!', 'error');
        }
    }

    aboutBlankCloak() {
        if (window !== window.top || window.frameElement) {
            return;
        }
        
        const currentUrl = window.location.href;
        
        try {
            const newWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
            
            if (newWindow && !newWindow.closed) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>New Tab</title>
                        <style>
                            body { 
                                margin: 0; 
                                padding: 0; 
                                background: #000; 
                                overflow: hidden;
                            }
                            iframe { 
                                position: fixed; 
                                top: 0; 
                                left: 0; 
                                width: 100%; 
                                height: 100%; 
                                border: none; 
                            }
                        </style>
                    </head>
                    <body class="theme-${this.settings.theme}">
                        <iframe src="${currentUrl}" id="corrodeFrame"></iframe>
                        <script>
                            try {
                                localStorage.setItem('corrode_cloak_active', 'about-blank');
                                sessionStorage.setItem('corrode_in_cloak', 'true');
                            } catch(e) {}
                            
                            try {
                                if (window.opener) {
                                    window.opener.sessionStorage.setItem('corrode_cloak_complete', 'true');
                                }
                            } catch(e) {}
                        </script>
                    </body>
                    </html>
                `);
                newWindow.document.close();
                
                this.settings.cloakMethod = 'about-blank';
                this.saveSettings();
                this.cloakApplied = true;
                
                sessionStorage.setItem('corrode_cloak_complete', 'true');
                
                setTimeout(() => {
                    if (!window.closed && newWindow && !newWindow.closed) {
                        try {
                            window.close();
                        } catch (e) {
                            console.log('Could not close window:', e);
                        }
                    }
                }, 500);
            } else {
                throw new Error('Popup blocked or failed to open');
            }
        } catch (error) {
            console.error('About:blank cloak failed:', error);
            this.cloakApplied = false;
            this.showStatus('About:blank cloak failed (popup may be blocked)', 'error');
            
            if (confirm('About:blank cloak failed. Try blob cloak instead?')) {
                this.blobCloak();
            }
        }
    }

    removeCloak() {
        this.cloakApplied = false;
        this.settings.cloakMethod = 'none';
        this.saveSettings();
        
        sessionStorage.removeItem('corrode_in_cloak');
        sessionStorage.removeItem('corrode_cloak_complete');
        localStorage.removeItem('corrode_cloak_active');
        
        let targetUrl = window.location.href;
        
        if (window.location.protocol === 'blob:') {
            try {
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.src) {
                    targetUrl = iframe.src;
                }
            } catch (e) {
                targetUrl = window.location.origin || 'index.html';
            }
        }
        else if (window.location.href === 'about:blank' && window.opener) {
            try {
                targetUrl = window.opener.location.href;
            } catch (e) {
                targetUrl = 'index.html';
            }
        }
        
        if (window === window.top) {
            window.location.href = targetUrl;
        } else {
            window.top.location.reload();
        }
    }

    quickCloak(method) {
        if (method === 'blob') {
            this.blobCloak();
        } else if (method === 'about-blank') {
            this.aboutBlankCloak();
        } else {
            this.removeCloak();
        }
    }

    getSettings() {
        return { ...this.settings };
    }
}

let settingsManager;
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
    window.settingsManager = settingsManager;
    
    const cloakComplete = sessionStorage.getItem('corrode_cloak_complete');
    if (cloakComplete === 'true') {
        sessionStorage.removeItem('corrode_cloak_complete');
    }
    
    setTimeout(() => {
        if (settingsManager) {
            settingsManager.applyAllSettings();
            if (settingsManager.setupToggleListeners) {
                settingsManager.setupToggleListeners();
            }
        }
    }, 300);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (settingsManager && settingsManager.setupToggleListeners) {
                settingsManager.setupToggleListeners();
            }
        }, 500);
    });
});