// Game Player Controller with Full Screen UI Hide
class GamePlayer {
    constructor() {
        this.overlay = null;
        this.gameFrame = null;
        this.currentGame = null;
        this.isFullscreen = false;
        this.uiHidden = false;
        this.controlsBar = null;
        this.init();
    }

    init() {
        this.createOverlay();
        this.setupEventListeners();
    }

    createOverlay() {
        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.className = 'game-player-overlay';
        this.overlay.style.display = 'none';
        
        this.overlay.innerHTML = `
            <!-- Game Content -->
            <div class="game-player-content">
                <div class="game-frame-container">
                    <iframe class="game-frame" id="gameFrame" 
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                    
                    <!-- Loading Overlay -->
                    <div class="game-loading-overlay" id="gameLoadingOverlay">
                        <div class="game-loading-animation"></div>
                        <div class="loading-message">Loading Game...</div>
                        <div class="loading-details" id="loadingDetails"></div>
                    </div>
                    
                    <!-- Error Overlay -->
                    <div class="game-error-overlay" id="gameErrorOverlay" style="display: none;">
                        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <div class="error-title">Game Failed to Load</div>
                        <div class="error-message" id="errorMessage"></div>
                        <div class="error-actions">
                            <button class="error-btn" id="retryBtn">Retry</button>
                            <button class="error-btn" id="closeErrorBtn">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Controls Bar -->
            <div class="game-controls-bar" id="gameControlsBar">
                <div class="game-info-left">
                    <button class="game-control-btn" id="gameBackBtn" title="Back to Games">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="game-name-display" id="gameNameDisplay">Game Title</div>
                    <div class="game-author-display" id="gameAuthorDisplay"></div>
                    <div class="game-status-indicator" id="gameStatus">
                        <i class="fas fa-circle"></i>
                        <span>Loading...</span>
                    </div>
                </div>
                
                <div class="game-controls-right">
                    <button class="game-control-btn" id="gameRefreshBtn" title="Refresh Game">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="game-control-btn" id="gameFullscreenBtn" title="Fullscreen (Hides UI)">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="game-control-btn" id="gamePopoutBtn" title="Open in New Tab">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        this.gameFrame = document.getElementById('gameFrame');
        this.controlsBar = document.getElementById('gameControlsBar');
        this.setupControls();
    }

    setupControls() {
        // Get control elements
        this.backBtn = document.getElementById('gameBackBtn');
        this.refreshBtn = document.getElementById('gameRefreshBtn');
        this.fullscreenBtn = document.getElementById('gameFullscreenBtn');
        this.popoutBtn = document.getElementById('gamePopoutBtn');
        this.gameNameDisplay = document.getElementById('gameNameDisplay');
        this.gameAuthorDisplay = document.getElementById('gameAuthorDisplay');
        this.gameStatus = document.getElementById('gameStatus');
        this.loadingOverlay = document.getElementById('gameLoadingOverlay');
        this.errorOverlay = document.getElementById('gameErrorOverlay');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.closeErrorBtn = document.getElementById('closeErrorBtn');
    }

    setupEventListeners() {
        // Control button event listeners
        this.backBtn.addEventListener('click', () => this.close());
        this.refreshBtn.addEventListener('click', () => this.refreshGame());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.popoutBtn.addEventListener('click', () => this.openInNewTab());
        
        // Error handling
        this.retryBtn.addEventListener('click', () => this.retryGame());
        this.closeErrorBtn.addEventListener('click', () => this.hideError());
        
        // Game frame events
        this.gameFrame.addEventListener('load', () => {
            console.log('Game frame loaded');
            this.hideLoading();
            this.updateStatus('connected', 'Ready');
            
            try {
                this.gameFrame.contentWindow.focus();
            } catch (e) {
                console.log('Could not focus iframe:', e);
            }
        });
        
        this.gameFrame.addEventListener('error', (e) => {
            console.error('Game frame error:', e);
            this.showError('Failed to load game. The game file may be missing or corrupted.');
        });
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible()) return;
            
            switch(e.key) {
                case 'Escape':
                    if (this.isFullscreen) {
                        this.toggleFullscreen();
                    } else {
                        this.close();
                    }
                    break;
                case 'F5':
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.refreshGame();
                    }
                    break;
                case 'f':
                    if (e.ctrlKey || e.key === 'F11') {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                case 'h':
                    if (e.ctrlKey && this.isFullscreen) {
                        e.preventDefault();
                        this.toggleUI();
                    }
                    break;
            }
        });
        
        // Show UI on mouse move in fullscreen
        this.overlay.addEventListener('mousemove', (e) => {
            if (this.isFullscreen && this.uiHidden) {
                this.showUI();
                
                // Hide UI again after 3 seconds
                clearTimeout(this.uiHideTimeout);
                this.uiHideTimeout = setTimeout(() => {
                    if (this.isFullscreen && this.isVisible()) {
                        this.hideUI();
                    }
                }, 3000);
            }
        });
    }

    handleFullscreenChange() {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
        
        if (isFullscreen) {
            this.isFullscreen = true;
            this.hideUI(); // Hide UI when entering fullscreen
        } else {
            this.isFullscreen = false;
            this.showUI(); // Show UI when exiting fullscreen
        }
        
        this.updateFullscreenIcon();
    }

    show(game) {
        console.log('GamePlayer.show called with:', game);
        
        if (!game || !game.localPath) {
            console.error('Invalid game data:', game);
            this.showError('Invalid game data provided');
            return;
        }
        
        this.currentGame = game;
        this.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Make sure UI is visible when starting
        this.showUI();
        
        // Update UI
        this.gameNameDisplay.textContent = game.name;
        if (game.author) {
            this.gameAuthorDisplay.textContent = `by ${game.author}`;
            this.gameAuthorDisplay.style.display = 'block';
        }
        
        // Show loading
        this.showLoading();
        this.updateStatus('loading', 'Loading game...');
        
        // Load game
        console.log('Loading game URL:', game.localPath);
        this.gameFrame.src = game.localPath;
        
        // Add timeout for loading
        setTimeout(() => {
            if (this.loadingOverlay.style.display !== 'none') {
                this.updateStatus('loading', 'Still loading...');
            }
        }, 5000);
    }

    close() {
        console.log('Closing game player');
        this.overlay.style.display = 'none';
        document.body.style.overflow = '';
        
        // Clear iframe source
        this.gameFrame.src = 'about:blank';
        
        // Revoke blob URLs
        if (this.currentGame && this.currentGame.localPath && this.currentGame.localPath.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(this.currentGame.localPath);
            } catch (e) {
                console.log('Could not revoke blob URL:', e);
            }
        }
        
        this.currentGame = null;
        this.uiHidden = false;
    }

    refreshGame() {
        if (!this.currentGame) return;
        
        console.log('Refreshing game');
        this.showLoading();
        this.updateStatus('loading', 'Refreshing...');
        
        // Force reload
        this.gameFrame.src = this.gameFrame.src;
    }

    toggleFullscreen() {
        const container = this.overlay;
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            this.isFullscreen = true;
            this.hideUI(); // Hide UI when entering fullscreen
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
            this.showUI(); // Show UI when exiting
        }
    }

    hideUI() {
        if (this.controlsBar) {
            this.controlsBar.style.display = 'none';
            this.uiHidden = true;
            console.log('UI hidden');
        }
    }

    showUI() {
        if (this.controlsBar) {
            this.controlsBar.style.display = 'flex';
            this.uiHidden = false;
            console.log('UI shown');
        }
    }

    toggleUI() {
        if (this.uiHidden) {
            this.showUI();
        } else {
            this.hideUI();
        }
    }

    updateFullscreenIcon() {
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
        
        const icon = this.fullscreenBtn.querySelector('i');
        if (isFullscreen) {
            icon.className = 'fas fa-compress';
            this.fullscreenBtn.title = 'Exit Fullscreen (Shows UI)';
        } else {
            icon.className = 'fas fa-expand';
            this.fullscreenBtn.title = 'Fullscreen (Hides UI)';
        }
    }

    openInNewTab() {
        if (!this.currentGame) return;
        
        console.log('Opening game in new tab:', this.currentGame.localPath);
        window.open(this.currentGame.localPath, '_blank');
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
        this.errorOverlay.style.display = 'none';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showError(message) {
        console.error('Game error:', message);
        this.errorMessage.textContent = message;
        this.errorOverlay.style.display = 'flex';
        this.loadingOverlay.style.display = 'none';
        this.updateStatus('error', 'Failed to load');
    }

    hideError() {
        this.errorOverlay.style.display = 'none';
    }

    retryGame() {
        console.log('Retrying game');
        this.hideError();
        this.refreshGame();
    }

    updateStatus(type, message) {
        this.gameStatus.className = `game-status-indicator ${type}`;
        this.gameStatus.querySelector('span').textContent = message;
        
        const icon = this.gameStatus.querySelector('i');
        switch (type) {
            case 'connected':
                icon.className = 'fas fa-check-circle';
                break;
            case 'loading':
                icon.className = 'fas fa-sync fa-spin';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                break;
        }
    }

    isVisible() {
        return this.overlay.style.display === 'flex';
    }
}

// Global game player instance
let gamePlayer;

// Initialize game player
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - initializing GamePlayer');
    gamePlayer = new GamePlayer();
    window.gamePlayer = gamePlayer;
    console.log('GamePlayer initialized');
});

// Global function to launch game
window.launchGame = function(game) {
    console.log('Global launchGame called with:', game);
    
    if (!gamePlayer) {
        console.log('Creating new GamePlayer instance');
        gamePlayer = new GamePlayer();
        window.gamePlayer = gamePlayer;
    }
    
    const gameData = {
        name: game.name || 'Game',
        author: game.author || 'Unknown',
        localPath: game.url || game.localPath,
        type: game.type || 'external'
    };
    
    console.log('Passing to gamePlayer.show:', gameData);
    gamePlayer.show(gameData);
};

// Test function
window.testGamePlayer = function() {
    console.log('Testing game player...');
    const testGame = {
        name: 'Test Game',
        author: 'Test Author',
        localPath: 'https://example.com',
        type: 'test'
    };
    
    if (window.launchGame) {
        window.launchGame(testGame);
        return true;
    }
    return false;
};
