class TileManager {
    constructor() {
        this.storageKey = 'corrode_tiles';
        this.defaultTiles = [
            { id: 1, name: 'Google', url: 'https://google.com', icon: 'fab fa-google', protected: true },
            { id: 2, name: 'Games', url: 'games.html', icon: 'fas fa-gamepad', protected: true }
        ];
    }

    getAll() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                this.save(this.defaultTiles);
                return this.defaultTiles;
            }
            const tiles = JSON.parse(stored);
            
            // Filter out any deleted protected tiles
            const protectedTiles = this.defaultTiles.filter(defaultTile => 
                !tiles.some(tile => tile.id === defaultTile.id)
            );
            
            // Combine: custom tiles + protected tiles that weren't deleted
            const combinedTiles = [...tiles, ...protectedTiles];
            
            // Sort by id to maintain order
            return combinedTiles.sort((a, b) => a.id - b.id);
        } catch (e) {
            console.error('Error loading tiles:', e);
            return this.defaultTiles;
        }
    }

    save(tiles) {
        try {
            // Don't save protected tiles to localStorage
            const customTiles = tiles.filter(tile => !tile.protected);
            localStorage.setItem(this.storageKey, JSON.stringify(customTiles));
        } catch (e) {
            console.error('Error saving tiles:', e);
        }
    }

    add(name, url, icon = 'fas fa-globe') {
        const tiles = this.getAll();
        const tile = { 
            id: Date.now(), 
            name: name.trim(), 
            url: url.trim(), 
            icon: icon,
            protected: false
        };
        tiles.push(tile);
        this.save(tiles);
        return tile;
    }

    remove(id) {
        const tiles = this.getAll();
        const tile = tiles.find(t => t.id === id);
        
        if (tile && tile.protected) {
            alert('This is a default bookmark and cannot be removed.');
            return false;
        }
        
        const filtered = tiles.filter(tile => tile.id !== id);
        this.save(filtered);
        return true;
    }

    clearCustomBookmarks() {
        const tiles = this.getAll();
        const protectedTiles = tiles.filter(tile => tile.protected);
        this.save(protectedTiles);
    }

    resetToDefaults() {
        localStorage.removeItem(this.storageKey);
    }

    getGamesCount() {
        try {
            // Try multiple storage locations
            const storedCount = localStorage.getItem('corrode_display_games') || 
                               localStorage.getItem('corrode_total_games') || 
                               localStorage.getItem('corrode_available_games');
            
            if (storedCount) {
                const count = parseInt(storedCount);
                return isNaN(count) ? "∞" : count;
            }
            
            // Default fallback
            return 624; // Approximate number of games after filtering
        } catch (e) {
            return 624; // Fallback count
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const manager = new TileManager();
    const container = document.getElementById('tileCollection');
    const searchInput = document.getElementById('searchInput');
    const settingsBtn = document.getElementById('settingsBtn');
    const announcementModal = document.getElementById('announcementModal');
    const closeAnnouncement = document.getElementById('closeAnnouncement');
    const gamesCounter = document.getElementById('gamesCounter');
    const gamesCount = document.getElementById('gamesCount');

    console.log('Home page loaded');

    // Check if elements exist
    if (!container || !searchInput || !settingsBtn || !announcementModal) {
        console.error('Some required elements not found!');
        return;
    }

    // Simplified pfp image loading
    function checkPfpImage() {
        const pfpImg = document.querySelector('.announcement-credits img');
        if (pfpImg) {
            pfpImg.src = 'assests/pfp.jpg';
            
            pfpImg.onerror = function() {
                console.log('Profile image not found');
                this.style.display = 'none';
            };
            
            pfpImg.onload = function() {
                console.log('Profile image loaded');
            };
        }
    }

    // Show announcement only once per session
    function showAnnouncement() {
        // Check sessionStorage to see if announcement was shown this session
        const announcementShown = sessionStorage.getItem('announcement_shown');
        
        if (announcementShown === 'true') {
            console.log('Announcement already shown this session');
            return;
        }
        
        console.log('Showing announcement modal');
        announcementModal.style.display = 'flex';
        
        // Force reflow for animation
        announcementModal.offsetHeight;
        
        // Add animation classes
        announcementModal.style.opacity = '0';
        announcementModal.style.animation = 'fadeIn 0.5s ease forwards';
        
        const content = announcementModal.querySelector('.announcement-content');
        if (content) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(20px)';
            content.style.animation = 'slideUp 0.5s ease forwards 0.1s';
        }
        
        checkPfpImage();
        
        // Mark as shown in sessionStorage (only for this browser session)
        sessionStorage.setItem('announcement_shown', 'true');
    }

    // Show announcement after delay (only first time)
    setTimeout(() => {
        showAnnouncement();
    }, 800);

    // Close announcement
    if (closeAnnouncement) {
        closeAnnouncement.addEventListener('click', () => {
            announcementModal.style.display = 'none';
        });
    }

    // Also allow clicking outside to close
    announcementModal.addEventListener('click', (e) => {
        if (e.target === announcementModal) {
            announcementModal.style.display = 'none';
        }
    });

    // Update games counter
    function updateGamesCounter() {
        if (!gamesCounter || !gamesCount) {
            console.log('Games counter elements not found');
            return;
        }
        
        const count = manager.getGamesCount();
        console.log('Setting games count to:', count);
        gamesCount.textContent = count;
        gamesCounter.style.display = 'flex';
        gamesCounter.style.opacity = '0';
        gamesCounter.style.animation = 'fadeIn 0.5s ease forwards 0.3s';
    }

    // Render tiles
    function renderTiles() {
        console.log('Rendering tiles...');
        container.innerHTML = '';
        
        const tiles = manager.getAll();
        console.log('Found', tiles.length, 'tiles');
        
        tiles.forEach(tile => {
            const element = document.createElement('div');
            element.className = 'tile';
            
            // Only show delete button for non-protected tiles
            const deleteButton = tile.protected ? '' : 
                `<button class="delete-tile"><i class="fas fa-times"></i></button>`;
            
            element.innerHTML = `
                ${deleteButton}
                <div class="tile-icon"><i class="${tile.icon}"></i></div>
                <span class="tile-label">${tile.name}</span>
            `;
            
            // Add delete button handler if needed
            const deleteBtn = element.querySelector('.delete-tile');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${tile.name}" bookmark?`)) {
                        if (manager.remove(tile.id)) {
                            renderTiles();
                        }
                    }
                });
            }
            
            // Add click handler for tile
            element.addEventListener('click', () => {
                console.log('Clicked tile:', tile.name, tile.url);
                if (tile.url.endsWith('.html')) {
                    window.location.href = tile.url;
                } else {
                    sessionStorage.setItem('corrode_destination', tile.url);
                    window.location.href = 'proxy.html';
                }
            });
            
            container.appendChild(element);
        });

        // Add "Add Bookmark" tile
        const addTile = document.createElement('div');
        addTile.className = 'tile tile-add';
        addTile.innerHTML = `
            <div class="tile-icon"><i class="fas fa-plus"></i></div>
            <span class="tile-label">Add Bookmark</span>
        `;
        
        addTile.addEventListener('click', () => {
            const name = prompt('Enter site name:');
            if (!name) return;
            
            let url = prompt('Enter site URL:');
            if (!url) return;
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            const newTile = manager.add(name, url);
            console.log('Added new tile:', newTile);
            renderTiles();
        });
        
        container.appendChild(addTile);
        
        // Update games counter
        updateGamesCounter();
        
        console.log('Tiles rendered successfully');
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    console.log('Searching for:', query);
                    sessionStorage.setItem('corrode_query', query);
                    window.location.href = 'proxy.html';
                }
            }
        });
    }

    // Settings button - redirect to settings page
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = 'settings.html';
        });
    }

    // Periodically check for updated game count
    function checkForGameCountUpdates() {
        // Check if games page has updated the count
        const currentCount = gamesCount ? gamesCount.textContent : '0';
        const storedCount = manager.getGamesCount();
        
        if (currentCount !== storedCount.toString()) {
            updateGamesCounter();
        }
    }

    // Initial render
    renderTiles();
    
    // Check for updates every few seconds
    setInterval(checkForGameCountUpdates, 3000);
    
    console.log('Home page initialization complete');
});