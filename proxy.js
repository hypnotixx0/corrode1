class NavigationManager {
    constructor() {
        this.stack = [];
        this.position = -1;
        this.surface = document.getElementById('browsingFrame');
        this.searchBar = document.getElementById('searchBar');
        this.historyKey = 'corrode_history';
        this.bookmarkKey = 'corrode_bookmarks';
        
        
        this.wispServers = [
            'https:
            'https:
            'https:
            'https:
        ];
        
        this.currentServerIndex = 0;
        this.init();
    }

    init() {
        
        this.loadHistory();
        this.updateInterface();
        this.updateBookmarkState();
        this.renderBookmarks();
        
        
        this.setupFullscreen();
        
        this.addGamesButton();
    }

    addGamesButton() {
        const btn = document.createElement('button');
        btn.className = 'nav-button';
        btn.id = 'gamesButton';
        btn.innerHTML = '<i class="fas fa-gamepad"></i>';
        btn.title = 'Games';
        btn.addEventListener('click', () => {
            window.location.href = 'games.html';
        });
        
        
        const refreshBtn = document.getElementById('refreshButton');
        refreshBtn.parentNode.insertBefore(btn, refreshBtn.nextSibling);
    }

    getCurrentServer() {
        return this.wispServers[this.currentServerIndex];
    }

    rotateServer() {
        this.currentServerIndex = (this.currentServerIndex + 1) % this.wispServers.length;
        this.updateServerStatus();
    }

    getProxiedUrl(url) {
        
        let targetUrl = url.trim();
        
        if (!targetUrl.startsWith('http:
            if (targetUrl.includes(' ') || !targetUrl.includes('.')) {
                targetUrl = 'https:
            } else {
                targetUrl = 'https:
            }
        }
        
        const server = this.getCurrentServer();
        return server + targetUrl;
    }

    navigate(destination) {
        if (!destination || destination.trim() === '') return;

        const originalUrl = this.formatUrl(destination);
        const proxiedUrl = this.getProxiedUrl(originalUrl);
        
        console.log('Navigating to:', originalUrl);
        console.log('Using proxy:', proxiedUrl);
        
        
        this.surface.src = proxiedUrl;
        
        
        this.stack = this.stack.slice(0, this.position + 1);
        this.stack.push(originalUrl);
        this.position = this.stack.length - 1;
        
        this.updateInterface();
        this.saveHistory();
        this.searchBar.value = originalUrl;
        this.updateBookmarkState();
        this.updateServerStatus();
    }

    formatUrl(url) {
        let formatted = url.trim();
        if (!formatted.startsWith('http:
            if (formatted.includes(' ') || !formatted.includes('.')) {
                return `https:
            } else {
                return `https:
            }
        }
        return formatted;
    }

    goBack() {
        if (this.position > 0) {
            this.position--;
            const url = this.stack[this.position];
            this.surface.src = this.getProxiedUrl(url);
            this.searchBar.value = url;
            this.updateInterface();
            this.saveHistory();
            this.updateBookmarkState();
        }
    }

    goForward() {
        if (this.position < this.stack.length - 1) {
            this.position++;
            const url = this.stack[this.position];
            this.surface.src = this.getProxiedUrl(url);
            this.searchBar.value = url;
            this.updateInterface();
            this.saveHistory();
            this.updateBookmarkState();
        }
    }

    refresh() {
        if (this.position >= 0) {
            const url = this.stack[this.position];
            this.surface.src = this.getProxiedUrl(url);
        }
    }

    updateInterface() {
        document.getElementById('backButton').disabled = this.position <= 0;
        document.getElementById('forwardButton').disabled = this.position >= this.stack.length - 1;
    }

    saveHistory() {
        const history = this.stack.slice(-50);
        localStorage.setItem(this.historyKey, JSON.stringify({
            stack: history,
            position: this.position
        }));
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem(this.historyKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.stack = data.stack || [];
                this.position = data.position || -1;
                
                if (this.stack.length > 0 && this.position >= 0 && this.position < this.stack.length) {
                    const url = this.stack[this.position];
                    this.surface.src = this.getProxiedUrl(url);
                    this.searchBar.value = url;
                }
            }
        } catch (e) {
            console.error('Error loading history:', e);
        }
    }

    getBookmarks() {
        try {
            return JSON.parse(localStorage.getItem(this.bookmarkKey) || '[]');
        } catch (e) {
            return [];
        }
    }

    saveBookmarks(bookmarks) {
        localStorage.setItem(this.bookmarkKey, JSON.stringify(bookmarks));
    }

    toggleBookmark() {
        const currentUrl = this.stack[this.position];
        if (!currentUrl) return;

        const bookmarks = this.getBookmarks();
        const existingIndex = bookmarks.findIndex(b => b.url === currentUrl);

        if (existingIndex > -1) {
            bookmarks.splice(existingIndex, 1);
        } else {
            const title = currentUrl.replace(/^https?:\/\
            bookmarks.push({
                url: currentUrl,
                title: title,
                timestamp: Date.now()
            });
        }

        this.saveBookmarks(bookmarks);
        this.updateBookmarkState();
        this.renderBookmarks();
    }

    updateBookmarkState() {
        const currentUrl = this.stack[this.position];
        const bookmarks = this.getBookmarks();
        const isBookmarked = bookmarks.some(b => b.url === currentUrl);
        const btn = document.getElementById('bookmarkToggle');
        
        btn.innerHTML = isBookmarked ? 
            '<i class="fas fa-bookmark"></i>' : 
            '<i class="far fa-bookmark"></i>';
        btn.classList.toggle('active', isBookmarked);
    }

    renderHistory() {
        const list = document.getElementById('historyList');
        list.innerHTML = '';
        
        this.stack.forEach((url, idx) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.textContent = url.length > 50 ? url.substring(0, 50) + '...' : url;
            li.title = url;
            
            li.addEventListener('click', () => {
                this.navigate(url);
                document.getElementById('historyPanel').classList.remove('active');
            });
            
            list.appendChild(li);
        });
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarkList');
        container.innerHTML = '';
        
        const bookmarks = this.getBookmarks();
        
        if (bookmarks.length === 0) {
            container.innerHTML = '<p style="color: var(--dust); padding: 2rem; text-align: center;">No bookmarks</p>';
            return;
        }
        
        bookmarks.forEach(bookmark => {
            const div = document.createElement('div');
            div.className = 'bookmark-item';
            
            const title = document.createElement('span');
            title.textContent = bookmark.title;
            title.title = bookmark.url;
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-bookmark';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove';
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const updated = this.getBookmarks().filter(b => b.url !== bookmark.url);
                this.saveBookmarks(updated);
                this.renderBookmarks();
                this.updateBookmarkState();
            });
            
            div.appendChild(title);
            div.appendChild(removeBtn);
            
            div.addEventListener('click', () => {
                this.navigate(bookmark.url);
                document.getElementById('bookmarkPanel').classList.remove('active');
            });
            
            container.appendChild(div);
        });
    }

    clearHistory() {
        this.stack = [];
        this.position = -1;
        this.updateInterface();
        localStorage.removeItem(this.historyKey);
        this.renderHistory();
    }

    updateServerStatus() {
        let statusIndicator = document.getElementById('serverStatus');
        if (!statusIndicator) {
            statusIndicator = document.createElement('div');
            statusIndicator.id = 'serverStatus';
            statusIndicator.className = 'server-status';
            document.querySelector('.navigation-panel').appendChild(statusIndicator);
        }
        
        const serverUrl = new URL(this.getCurrentServer());
        statusIndicator.innerHTML = `<i class="fas fa-server"></i> ${serverUrl.hostname}`;
    }

    setupFullscreen() {
        const btn = document.createElement('button');
        btn.className = 'nav-button';
        btn.id = 'fullscreenButton';
        btn.innerHTML = '<i class="fas fa-expand"></i>';
        btn.title = 'Fullscreen';
        btn.addEventListener('click', this.toggleFullscreen.bind(this));
        
        document.querySelector('.navigation-panel').appendChild(btn);
        
        
        document.addEventListener('fullscreenchange', this.updateFullscreenIcon.bind(this));
        document.addEventListener('webkitfullscreenchange', this.updateFullscreenIcon.bind(this));
        document.addEventListener('mozfullscreenchange', this.updateFullscreenIcon.bind(this));
        document.addEventListener('MSFullscreenChange', this.updateFullscreenIcon.bind(this));
    }

    toggleFullscreen() {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    updateFullscreenIcon() {
        const btn = document.getElementById('fullscreenButton');
        if (!btn) return;
        
        const isFullscreen = document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement;
        
        btn.innerHTML = isFullscreen ? 
            '<i class="fas fa-compress"></i>' : 
            '<i class="fas fa-expand"></i>';
        btn.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const manager = new NavigationManager();
    
    
    document.getElementById('homeButton').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('backButton').addEventListener('click', () => manager.goBack());
    document.getElementById('forwardButton').addEventListener('click', () => manager.goForward());
    document.getElementById('refreshButton').addEventListener('click', () => manager.refresh());
    
    
    const searchBar = document.getElementById('searchBar');
    const searchExecute = document.getElementById('searchExecute');
    
    function executeSearch() {
        const query = searchBar.value.trim();
        if (query) {
            manager.navigate(query);
        }
    }
    
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executeSearch();
    });
    
    searchExecute.addEventListener('click', executeSearch);
    
    
    document.getElementById('bookmarkToggle').addEventListener('click', () => manager.toggleBookmark());
    
    
    document.getElementById('historyToggle').addEventListener('click', () => {
        manager.renderHistory();
        document.getElementById('historyPanel').classList.add('active');
    });
    
    document.getElementById('historyClose').addEventListener('click', () => {
        document.getElementById('historyPanel').classList.remove('active');
    });
    
    document.getElementById('bookmarkClose').addEventListener('click', () => {
        document.getElementById('bookmarkPanel').classList.remove('active');
    });
    
    document.getElementById('clearHistory').addEventListener('click', () => {
        manager.clearHistory();
    });
    
    
    const destination = sessionStorage.getItem('corrode_destination');
    const query = sessionStorage.getItem('corrode_query');
    
    if (destination) {
        manager.navigate(destination);
        sessionStorage.removeItem('corrode_destination');
    } else if (query) {
        manager.navigate(query);
        sessionStorage.removeItem('corrode_query');
    } else if (manager.stack.length === 0) {
        
        manager.navigate('https:
    }
});
