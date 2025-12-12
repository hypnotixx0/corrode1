// theme-engine.js - COMPLETE VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme Engine: Initializing...');
    
    // Apply theme from settings
    function applyTheme() {
        try {
            const saved = localStorage.getItem('corrode_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                const theme = settings.theme || 'dark';
                
                console.log('Theme Engine: Applying theme:', theme);
                
                // Remove all theme classes
                document.body.classList.remove(
                    'theme-dark', 'theme-blue', 'theme-purple', 
                    'theme-green', 'theme-red'
                );
                
                // Add current theme
                document.body.classList.add(`theme-${theme}`);
                
                // Update CSS variables
                updateCSSVariables(theme);
                
                // Apply theme to specific elements
                applyThemeToElements(theme);
                
                console.log('Theme Engine: Theme applied successfully');
            } else {
                console.log('Theme Engine: No settings found, using default');
                document.body.classList.add('theme-dark');
            }
        } catch (error) {
            console.error('Theme Engine: Error applying theme:', error);
            // Fallback to dark theme
            document.body.classList.add('theme-dark');
        }
    }
    
    // Update CSS variables based on theme
    function updateCSSVariables(theme) {
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
    
    // Apply theme to specific elements
    function applyThemeToElements(theme) {
        // Apply to game player
        const gamePlayer = document.querySelector('.game-player-overlay');
        if (gamePlayer) {
            gamePlayer.classList.remove(
                'theme-dark', 'theme-blue', 'theme-purple', 
                'theme-green', 'theme-red'
            );
            gamePlayer.classList.add(`theme-${theme}`);
        }
        
        // Apply to proxy interface
        const proxyInterface = document.querySelector('.proxy-interface');
        if (proxyInterface) {
            proxyInterface.classList.remove(
                'theme-dark', 'theme-blue', 'theme-purple', 
                'theme-green', 'theme-red'
            );
            proxyInterface.classList.add(`theme-${theme}`);
        }
        
        // Apply to announcement modal
        const announcementModal = document.getElementById('announcementModal');
        if (announcementModal) {
            announcementModal.classList.remove(
                'theme-dark', 'theme-blue', 'theme-purple', 
                'theme-green', 'theme-red'
            );
            announcementModal.classList.add(`theme-${theme}`);
        }
        
        // Apply to settings modal
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.classList.remove(
                'theme-dark', 'theme-blue', 'theme-purple', 
                'theme-green', 'theme-red'
            );
            settingsModal.classList.add(`theme-${theme}`);
        }
        
        // Apply to all containers with theme classes
        document.querySelectorAll('.central-container, .games-header, .browsing-surface, .grid-canvas').forEach(el => {
            el.classList.remove(
                'theme-dark', 'theme-blue', 'theme-purple', 
                'theme-green', 'theme-red'
            );
            el.classList.add(`theme-${theme}`);
        });
    }
    
    // Listen for theme changes from settings page
    function setupThemeListeners() {
        // Listen for storage changes (when settings are updated on another page)
        window.addEventListener('storage', function(e) {
            if (e.key === 'corrode_settings') {
                console.log('Theme Engine: Settings changed in another tab');
                applyTheme();
            }
        });
        
        // Listen for custom theme change event
        window.addEventListener('settingsUpdated', function(e) {
            console.log('Theme Engine: Received settingsUpdated event');
            applyTheme();
        });
        
        // Listen for direct theme change event
        window.addEventListener('themeChanged', function(e) {
            console.log('Theme Engine: Received themeChanged event:', e.detail);
            if (e.detail && e.detail.theme) {
                document.body.classList.remove(
                    'theme-dark', 'theme-blue', 'theme-purple', 
                    'theme-green', 'theme-red'
                );
                document.body.classList.add(`theme-${e.detail.theme}`);
                updateCSSVariables(e.detail.theme);
                applyThemeToElements(e.detail.theme);
            }
        });
        
        // Also check periodically for theme changes (fallback)
        setInterval(() => {
            applyTheme();
        }, 2000);
    }
    
    // Initialize
    applyTheme();
    setupThemeListeners();
    
    console.log('Theme Engine: Initialized successfully');
});