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
        this.cloakApplied = false;
        this.init();
    }

    init() {
        this.loadSettings();
        this.applySettings();
        this.setupEventListeners();
        
        
        this.checkUrlForCloak();
        
        
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
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    updateSetting(key, value) {
        const oldValue = this.settings[key];
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
        
        
        if ((key === 'autoBlobCloak' || key === 'autoAboutBlankCloak') && oldValue !== value) {
            this.autoCloak();
        }
        
        
        if (key === 'announcementEnabled') {
            this.handleAnnouncementSetting();
        }
        
        
        if (key === 'showGamesCounter') {
            this.applyGamesCounter();
        }
    }

    applySettings() {
        
        this.applyTheme(this.settings.theme);
        
        
        this.applyTabCloak();
        
        
        document.body.style.animation = this.settings.enableAnimations ? '' : 'none';
        
        
        if (this.settings.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
        
        
        this.applyGamesCounter();
        
        
        this.handleAnnouncementSetting();
    }
    
    applyGamesCounter() {
        const gamesCounter = document.getElementById('gamesCounter');
        if (gamesCounter) {
            if (this.settings.showGamesCounter) {
                gamesCounter.style.display = 'flex';
                gamesCounter.style.visibility = 'visible';
                gamesCounter.style.opacity = '1';
            } else {
                gamesCounter.style.display = 'none';
                gamesCounter.style.visibility = 'hidden';
                gamesCounter.style.opacity = '0';
            }
        }
    }

    applyTheme(theme) {
        
        document.body.classList.remove(
            'theme-dark', 'theme-blue', 'theme-purple', 
            'theme-green', 'theme-red'
        );
        
        
        document.body.classList.add(`theme-${theme}`);
        
        
        this.updateThemeVariables(theme);
    }

    updateThemeVariables(theme) {
        const root = document.documentElement;
        
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
            root.style.setProperty(key, value);
        });
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
    }

    handleAnnouncementSetting() {
        
        if (!this.settings.announcementEnabled) {
            const announcementModal = document.getElementById('announcementModal');
            if (announcementModal) {
                announcementModal.style.display = 'none';
            }
            
            sessionStorage.removeItem('announcement_shown');
        }
    }

    setupEventListeners() {
        
    }
    
    checkUrlForCloak() {
        
        const urlParams = new URLSearchParams(window.location.search);
        const shouldCloak = urlParams.get('cloak');
        const cloakType = urlParams.get('cloakType');
        
        if (shouldCloak === 'true' && !this.cloakApplied) {
            if (cloakType === 'blob' && this.settings.autoBlobCloak) {
                setTimeout(() => this.blobCloak(), 1000);
            } else if (cloakType === 'about-blank' && this.settings.autoAboutBlankCloak) {
                setTimeout(() => this.aboutBlankCloak(), 1000);
            }
        }
    }

    
    
    autoCloak() {
        
        if (this.cloakApplied) {
            console.log('Cloak already applied, skipping auto cloak');
            return;
        }
        
        
        if (window.location.protocol === 'blob:' || window.location.href === 'about:blank') {
            this.cloakApplied = true;
            return;
        }
        
        console.log('Auto cloak check:', {
            autoBlobCloak: this.settings.autoBlobCloak,
            autoAboutBlankCloak: this.settings.autoAboutBlankCloak,
            currentUrl: window.location.href
        });
        
        if (this.settings.autoBlobCloak && !this.cloakApplied) {
            this.cloakApplied = true;
            setTimeout(() => this.blobCloak(), 500);
        } else if (this.settings.autoAboutBlankCloak && !this.cloakApplied) {
            this.cloakApplied = true;
            setTimeout(() => this.aboutBlankCloak(), 500);
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
                    body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                    iframe { 
                        position: fixed; 
                        top: 0; left: 0; 
                        width: 100%; height: 100%; 
                        border: none; 
                    }
                </style>
            </head>
            <body>
                <iframe src="${currentUrl}" id="corrodeFrame"></iframe>
                <script>
                    
                    try {
                        sessionStorage.setItem('corrode_in_cloak', 'true');
                    } catch(e) {}
                    
                    
                    try {
                        window.history.replaceState(null, null, 'about:blank');
                    } catch(e) {}
                </script>
            </body>
            </html>
        `;
        
        try {
            const blob = new Blob([html], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            this.settings.cloakMethod = 'blob';
            this.saveSettings();
            
            window.location.href = blobUrl;
        } catch (error) {
            console.error('Blob cloak failed:', error);
            this.cloakApplied = false;
        }
    }

    aboutBlankCloak() {
        
        if (window !== window.top) {
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
                            body { margin: 0; padding: 0; background: #000; overflow: hidden; }
                            iframe { 
                                position: fixed; 
                                top: 0; left: 0; 
                                width: 100%; height: 100%; 
                                border: none; 
                            }
                        </style>
                    </head>
                    <body>
                        <iframe src="${currentUrl}" id="corrodeFrame"></iframe>
                        <script>
                            
                            try {
                                sessionStorage.setItem('corrode_cloak_complete', 'true');
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
                    try {
                        window.close();
                    } catch (e) {
                        console.log('Could not close window');
                    }
                }, 500);
            }
        } catch (error) {
            console.error('About:blank cloak failed:', error);
            this.cloakApplied = false;
            
            
            if (confirm('About:blank failed. Try blob cloak?')) {
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
        } else if (window.location.href === 'about:blank' && window.opener) {
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

    
    setTabTitle(title) {
        this.updateSetting('customTitle', title);
        this.applyTabCloak();
    }

    setTabIcon(iconUrl) {
        this.updateSetting('customIcon', iconUrl);
        this.applyTabCloak();
    }

    resetTabCloak() {
        this.updateSetting('customTitle', '');
        this.updateSetting('customIcon', '');
        this.applyTabCloak();
    }

    
    getSettings() {
        return { ...this.settings };
    }
}


class SettingsUI {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.updateFooterSettingsButton();
        this.setupEventListeners();
    }

    createModal() {
        
        const modalHTML = `
            <div class="settings-modal" id="settingsModal">
                <div class="settings-content">
                    <div class="settings-header">
                        <h2>Settings</h2>
                        <button class="settings-close" id="settingsClose">×</button>
                    </div>
                    <div class="settings-body">
                        <!-- Theme Section -->
                        <div class="settings-section">
                            <h3>Theme</h3>
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Theme Color</div>
                                    <div class="setting-description">Change the color scheme</div>
                                </div>
                                <div class="color-picker-container" id="themePicker">
                                    <div class="color-option theme-dark" data-theme="dark" title="Dark"></div>
                                    <div class="color-option theme-blue" data-theme="blue" title="Blue"></div>
                                    <div class="color-option theme-purple" data-theme="purple" title="Purple"></div>
                                    <div class="color-option theme-green" data-theme="green" title="Green"></div>
                                    <div class="color-option theme-red" data-theme="red" title="Red"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Cloaking Section -->
                        <div class="settings-section">
                            <h3>Cloaking</h3>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Auto Blob Cloak</div>
                                    <div class="setting-description">Automatically cloak site with blob URL on load</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autoBlobCloak">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Auto About:Blank Cloak</div>
                                    <div class="setting-description">Automatically cloak site with about:blank on load</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="autoAboutBlankCloak">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Quick Cloak</div>
                                    <div class="setting-description">Apply cloaking immediately</div>
                                </div>
                                <div>
                                    <select class="setting-select" id="quickCloakSelect">
                                        <option value="none">No Cloak</option>
                                        <option value="blob">Blob Cloak</option>
                                        <option value="about-blank">About:Blank Cloak</option>
                                    </select>
                                    <button class="cloak-btn" id="applyQuickCloak">Apply</button>
                                </div>
                            </div>
                        </div>

                        <!-- Tab Cloaking Section -->
                        <div class="settings-section">
                            <h3>Tab Cloaking</h3>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Tab Title</div>
                                    <div class="setting-description">Custom tab title</div>
                                </div>
                                <div class="cloak-input-group">
                                    <input type="text" class="cloak-input" id="tabTitleInput" placeholder="Custom title...">
                                    <button class="cloak-btn" id="setTabTitle">Set</button>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Tab Icon</div>
                                    <div class="setting-description">Custom tab favicon URL</div>
                                </div>
                                <div class="cloak-input-group">
                                    <input type="text" class="cloak-input" id="tabIconInput" placeholder="Icon URL...">
                                    <button class="cloak-btn" id="setTabIcon">Set</button>
                                </div>
                            </div>
                            
                            <button class="settings-btn" id="resetTabCloak">Reset Tab Cloak</button>
                        </div>

                        <!-- Interface Section -->
                        <div class="settings-section">
                            <h3>Interface</h3>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Enable Animations</div>
                                    <div class="setting-description">Show page animations and transitions</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="enableAnimations">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Compact Mode</div>
                                    <div class="setting-description">Use compact interface</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="compactMode">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Show Games Counter</div>
                                    <div class="setting-description">Display games count on home page</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="showGamesCounter">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                            
                            <div class="setting-item">
                                <div>
                                    <div class="setting-label">Show Announcement</div>
                                    <div class="setting-description">Show welcome announcement on first visit</div>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="announcementEnabled">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Actions Section -->
                        <div class="settings-section">
                            <h3>Actions</h3>
                            <div class="setting-buttons">
                                <button class="settings-btn" id="saveSettings">Save Settings</button>
                                <button class="settings-btn primary" id="applySettings">Apply Now</button>
                                <button class="settings-btn" id="resetSettings">Reset to Defaults</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('settingsModal');
        
        
        this.loadSettingsToUI();
    }

    updateFooterSettingsButton() {
        
        const footerCluster = document.querySelector('.footer-cluster');
        if (footerCluster) {
            
            const existingSettings = footerCluster.querySelector('.settings-quick-btn');
            if (existingSettings) {
                existingSettings.remove();
            }
            
            
            const links = footerCluster.querySelectorAll('.footer-link');
            if (links.length >= 5) {
                links[4].remove();
            }
            
            
            const settingsBtn = document.createElement('a');
            settingsBtn.className = 'footer-link settings-quick-btn';
            settingsBtn.title = 'Settings';
            settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
            settingsBtn.href = '#';
            settingsBtn.onclick = (e) => {
                e.preventDefault();
                this.show();
            };
            
            footerCluster.appendChild(settingsBtn);
        }
    }

    loadSettingsToUI() {
        const settings = this.settingsManager.getSettings();
        
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === settings.theme) {
                option.classList.add('active');
            }
        });
        
        
        document.getElementById('autoBlobCloak').checked = settings.autoBlobCloak;
        document.getElementById('autoAboutBlankCloak').checked = settings.autoAboutBlankCloak;
        document.getElementById('enableAnimations').checked = settings.enableAnimations;
        document.getElementById('compactMode').checked = settings.compactMode;
        document.getElementById('showGamesCounter').checked = settings.showGamesCounter;
        document.getElementById('announcementEnabled').checked = settings.announcementEnabled;
        
        
        document.getElementById('quickCloakSelect').value = settings.cloakMethod;
        
        
        document.getElementById('tabTitleInput').value = settings.customTitle;
        document.getElementById('tabIconInput').value = settings.customIcon;
    }

    saveSettingsFromUI() {
        
        const settings = {
            theme: document.querySelector('.color-option.active')?.dataset.theme || 'dark',
            autoBlobCloak: document.getElementById('autoBlobCloak').checked,
            autoAboutBlankCloak: document.getElementById('autoAboutBlankCloak').checked,
            enableAnimations: document.getElementById('enableAnimations').checked,
            compactMode: document.getElementById('compactMode').checked,
            showGamesCounter: document.getElementById('showGamesCounter').checked,
            announcementEnabled: document.getElementById('announcementEnabled').checked,
            cloakMethod: document.getElementById('quickCloakSelect').value
        };
        
        
        Object.entries(settings).forEach(([key, value]) => {
            this.settingsManager.updateSetting(key, value);
        });
    }

    setupEventListeners() {
        
        document.getElementById('settingsClose').addEventListener('click', () => this.hide());
        
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.settingsManager.updateSetting('theme', option.dataset.theme);
            });
        });
        
        
        document.getElementById('applyQuickCloak').addEventListener('click', () => {
            const method = document.getElementById('quickCloakSelect').value;
            if (method !== 'none') {
                if (confirm(`Apply ${method} cloak? This will reload the page.`)) {
                    this.settingsManager.quickCloak(method);
                }
            } else {
                if (confirm('Remove cloak and reload page?')) {
                    this.settingsManager.removeCloak();
                }
            }
        });
        
        
        document.getElementById('setTabTitle').addEventListener('click', () => {
            const title = document.getElementById('tabTitleInput').value.trim();
            if (title) {
                this.settingsManager.setTabTitle(title);
                alert('Tab title updated!');
            }
        });
        
        document.getElementById('setTabIcon').addEventListener('click', () => {
            const icon = document.getElementById('tabIconInput').value.trim();
            if (icon) {
                this.settingsManager.setTabIcon(icon);
                alert('Tab icon updated!');
            }
        });
        
        document.getElementById('resetTabCloak').addEventListener('click', () => {
            this.settingsManager.resetTabCloak();
            document.getElementById('tabTitleInput').value = '';
            document.getElementById('tabIconInput').value = '';
            alert('Tab cloak reset!');
        });
        
        
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettingsFromUI();
            this.hide();
        });
        
        document.getElementById('applySettings').addEventListener('click', () => {
            this.saveSettingsFromUI();
            alert('Settings applied!');
        });
        
        document.getElementById('resetSettings').addEventListener('click', () => {
            if (confirm('Reset all settings to defaults?')) {
                localStorage.removeItem('corrode_settings');
                this.settingsManager.loadSettings();
                this.settingsManager.applySettings();
                this.loadSettingsToUI();
                alert('Settings reset to defaults!');
            }
        });
        
        
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                this.show();
            }
            
            
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.hide();
            }
        });
        
        
        this.setupToggleListeners();
    }
    
    setupToggleListeners() {
        console.log('Setting up toggle listeners...');
        
        
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
                console.log(`Found toggle: ${id}`);
                
                
                const newCheckbox = checkbox.cloneNode(true);
                checkbox.parentNode.replaceChild(newCheckbox, checkbox);
                
                
                const freshCheckbox = document.getElementById(id);
                
                
                freshCheckbox.addEventListener('change', (e) => {
                    console.log(`${id} changed to:`, e.target.checked);
                    this.settingsManager.updateSetting(id, e.target.checked);
                });
                
                
                freshCheckbox.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                });
            } else {
                console.warn(`Toggle not found: ${id}`);
            }
        });
    }

    show() {
        this.loadSettingsToUI();
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}


let settingsManager, settingsUI;
document.addEventListener('DOMContentLoaded', () => {
    settingsManager = new SettingsManager();
    settingsUI = new SettingsUI(settingsManager);
    window.settingsManager = settingsManager;
    window.settingsUI = settingsUI;
    
    
    settingsManager.applySettings();
    
    
    setTimeout(() => {
        if (settingsUI && settingsUI.setupToggleListeners) {
            settingsUI.setupToggleListeners();
        }
    }, 300);
});
