class ExternalGamesManager {
    constructor() {
        this.zones = [];
        this.featuredZones = [];
        this.zonesurls = [
            "https:
            "https:
            "https:
            "https:
        ];
        this.coverURL = "https:
        this.htmlURL = "https:
        this.currentZonesURL = this.zonesurls[0];
        this.gameCache = new Map();
        this.totalGamesCount = 0;
    }

    async loadGames() {
        try {
            console.log('Loading games from gn-math...');
            
            
            let sha;
            try {
                const shareponse = await fetch("https:
                if (shareponse && shareponse.status === 200) {
                    const shajson = await shareponse.json();
                    sha = shajson[0]?.['sha'];
                    if (sha) {
                        this.currentZonesURL = `https:
                        console.log('Using latest commit:', sha);
                    }
                }
            } catch (error) {
                this.currentZonesURL = this.zonesurls[Math.floor(Math.random() * this.zonesurls.length)];
            }

            
            const response = await fetch(this.currentZonesURL + "?t=" + Date.now());
            const json = await response.json();
            
            console.log('Raw game data loaded:', json.length, 'games');
            this.totalGamesCount = json.length; 
            
            
            this.zones = json.filter(zone => {
                
                if (zone.id === 0) return false;
                
                
                const name = (zone.name || '').toLowerCase();
                if (name.includes('comments') || name === 'comment') {
                    return false;
                }
                
                
                const desc = (zone.description || '').toLowerCase();
                const tags = zone.special || [];
                
                
                const aiKeywords = [
                    'ai', 'chat', 'bot', 'gpt', 'llm', 'openai', 
                    'chatgpt', 'bard', 'claude', 'assistant',
                    'artificial intelligence', 'machine learning',
                    'conversation', 'talk', 'message', 'dialog'
                ];
                
                
                const isAIGame = aiKeywords.some(keyword => 
                    name.includes(keyword) || 
                    desc.includes(keyword) ||
                    tags.some(tag => tag.toLowerCase().includes(keyword))
                );
                
                
                return !isAIGame;
            }).map(zone => {
                
                let author = 'Unknown';
                let authorLink = '#';
                
                if (typeof zone.author === 'string') {
                    author = zone.author;
                    authorLink = zone.authorLink || '#';
                } else if (zone.author && typeof zone.author === 'object') {
                    author = zone.author.name || 'Unknown';
                    authorLink = zone.author.link || '#';
                }
                
                
                let gameUrl = '';
                let type = 'local';
                
                if (zone.url.startsWith('http')) {
                    gameUrl = zone.url;
                    type = 'external';
                } else {
                    gameUrl = zone.url.replace("{HTML_URL}", this.htmlURL);
                    type = 'local';
                }
                
                
                const coverUrl = zone.cover
                    .replace("{COVER_URL}", this.coverURL)
                    .replace("{HTML_URL}", this.htmlURL);
                
                return {
                    id: zone.id,
                    name: zone.name || 'Unnamed Game',
                    author: author,
                    authorLink: authorLink,
                    url: gameUrl,
                    cover: coverUrl,
                    special: zone.special || [],
                    description: zone.description || `Game by ${author}`,
                    featured: zone.featured || false,
                    type: type,
                    isExternal: zone.url.startsWith('http'),
                    rawUrl: zone.url
                };
            });

            console.log('Games after filtering:', this.zones.length, 'out of', this.totalGamesCount);
            
            
            this.featuredZones = this.zones.filter(zone => zone.featured);
            console.log('Featured games:', this.featuredZones.length);
            
            
            this.categories = this.extractCategories();
            console.log('Categories:', this.categories);
            
            
            localStorage.setItem('corrode_total_games', this.zones.length);
            localStorage.setItem('corrode_available_games', this.zones.length);
            
            return this.zones;
        } catch (error) {
            console.error('Error loading games:', error);
            return [];
        }
    }

    extractCategories() {
        const allCategories = new Set();
        this.zones.forEach(zone => {
            if (zone.special && Array.isArray(zone.special)) {
                zone.special.forEach(cat => allCategories.add(cat));
            }
        });
        return Array.from(allCategories).sort();
    }

    getGamesByCategory(category) {
        if (category === 'all') return this.zones;
        return this.zones.filter(zone => 
            zone.special && zone.special.includes(category.toLowerCase())
        );
    }

    searchGames(query) {
        const q = query.toLowerCase();
        return this.zones.filter(zone => 
            zone.name.toLowerCase().includes(q) ||
            zone.author.toLowerCase().includes(q) ||
            (zone.description && zone.description.toLowerCase().includes(q)) ||
            (zone.special && zone.special.some(tag => tag.toLowerCase().includes(q)))
        );
    }

    getFeaturedGames() {
        return this.featuredZones;
    }

    getSortedGames() {
        const featured = this.featuredZones;
        const nonFeatured = this.zones.filter(zone => !zone.featured);
        
        nonFeatured.sort((a, b) => a.name.localeCompare(b.name));
        
        return [...featured, ...nonFeatured];
    }

    
    async downloadGameCode(game) {
        try {
            const cacheKey = `game_${game.id}`;
            if (this.gameCache.has(cacheKey)) {
                return this.gameCache.get(cacheKey);
            }

            console.log('Downloading:', game.name);
            
            
            const response = await fetch(game.url + "?t=" + Date.now());
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            
            
            const blob = new Blob([html], { type: 'text/html' });
            const blobUrl = URL.createObjectURL(blob);
            
            const gameCode = {
                blobUrl: blobUrl,
                html: html,
                gameId: game.id,
                gameName: game.name
            };
            
            this.gameCache.set(cacheKey, gameCode);
            return gameCode;
            
        } catch (error) {
            console.error('Download error:', error);
            return null;
        }
    }

    
    getTotalGamesCount() {
        return this.zones.length;
    }
}


class GamesUI {
    constructor() {
        this.gamesManager = new ExternalGamesManager();
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.grid = document.getElementById('gamesGrid');
        this.searchInput = document.getElementById('gameSearch');
        this.init();
    }

    async init() {
        this.showLoading();
        await this.gamesManager.loadGames();
        this.renderGames();
        this.setupEventListeners();
        this.updateCategoryFilters();
        this.updateGamesCounter();
    }

    showLoading() {
        this.grid.innerHTML = `
            <div class="no-games" style="grid-column: 1 / -1;">
                <div class="loading" style="margin: 2rem auto;"></div>
                <h3>Loading Games...</h3>
                <p>Fetching from gn-math repository</p>
            </div>
        `;
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', () => {
            this.currentSearch = this.searchInput.value.trim().toLowerCase();
            this.renderGames();
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentSearch = this.searchInput.value.trim().toLowerCase();
                this.renderGames();
            }
        });
    }

    filterGames(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderGames();
    }

    updateCategoryFilters() {
        const categories = this.gamesManager.categories || [];
        const controlsContainer = document.querySelector('.games-controls');
        
        if (!controlsContainer) return;
        
        const allGamesBtn = controlsContainer.querySelector('.category-filter.all');
        controlsContainer.innerHTML = '';
        controlsContainer.appendChild(allGamesBtn);
        
        const topCategories = categories.slice(0, 8);
        topCategories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-filter';
            btn.textContent = this.toTitleCase(category);
            btn.onclick = (e) => this.filterGames(category);
            controlsContainer.appendChild(btn);
        });
    }

    toTitleCase(str) {
        if (!str) return '';
        return str.replace(/\w\S*/g, txt => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    renderGames() {
        this.grid.innerHTML = '';
        
        let games = [];
        
        if (this.currentSearch) {
            games = this.gamesManager.searchGames(this.currentSearch);
        } else if (this.currentFilter !== 'all') {
            games = this.gamesManager.getGamesByCategory(this.currentFilter);
        } else {
            games = this.gamesManager.getSortedGames();
        }
        
        if (games.length === 0) {
            this.grid.innerHTML = this.createEmptyState();
            return;
        }
        
        
        if (this.currentFilter === 'all' && !this.currentSearch) {
            const featuredGames = games.filter(game => game.featured);
            const nonFeaturedGames = games.filter(game => !game.featured);
            
            if (featuredGames.length > 0) {
                const featuredSection = this.createFeaturedSection(featuredGames);
                this.grid.appendChild(featuredSection);
            }
            
            games = nonFeaturedGames;
        }
        
        
        games.forEach(game => {
            const card = this.createGameCard(game);
            this.grid.appendChild(card);
        });
        
        this.updateGamesCounter();
    }

    createFeaturedSection(featuredGames) {
        const section = document.createElement('div');
        section.className = 'featured-section';
        section.style.gridColumn = '1 / -1';
        section.style.marginBottom = '2rem';
        
        const title = document.createElement('h3');
        title.className = 'category-title';
        title.textContent = '⭐ Featured Games';
        title.style.color = '#ffd700';
        section.appendChild(title);
        
        const featuredGrid = document.createElement('div');
        featuredGrid.className = 'games-grid';
        featuredGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
        featuredGrid.style.gap = '1.5rem';
        
        featuredGames.forEach(game => {
            const card = this.createGameCard(game, true);
            featuredGrid.appendChild(card);
        });
        
        section.appendChild(featuredGrid);
        return section;
    }

    createEmptyState() {
        return `
            <div class="no-games">
                <i class="fas fa-gamepad"></i>
                <h3>No Games Found</h3>
                <p>${this.currentSearch ? 'Try a different search' : 'Try a different category'}</p>
                <button onclick="gamesUI.filterGames('all'); document.getElementById('gameSearch').value=''" 
                        style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: var(--dusk); 
                               border: 1px solid var(--shadow); border-radius: 10px; color: var(--frost); 
                               cursor: pointer;">
                    Show All Games
                </button>
            </div>
        `;
    }

    createGameCard(game, isFeatured = false) {
        const card = document.createElement('div');
        card.className = 'game-card';
        if (isFeatured) {
            card.style.border = '2px solid #ffd700';
            card.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.3)';
        }
        
        card.innerHTML = `
            ${game.featured && !isFeatured ? `<div class="game-status working">⭐ Featured</div>` : ''}
            ${game.type === 'external' ? `<div class="game-status external">External</div>` : ''}
            <img 
                class="game-image" 
                src="${game.cover}" 
                alt="${game.name}"
                loading="lazy"
                onerror="this.src='https:
            >
            <div class="game-overlay">
                <div class="game-info">
                    <div class="game-name">${game.name}</div>
                    <div class="game-category">${game.special?.[0] ? this.toTitleCase(game.special[0]) : 'Game'}</div>
                    <div class="game-author">by <strong>${game.author}</strong></div>
                    ${game.special && game.special.length > 1 ? 
                        `<div class="game-tags">${game.special.slice(1, 3).map(tag => this.toTitleCase(tag)).join(' • ')}</div>` : ''
                    }
                </div>
            </div>
            <div class="game-tooltip">
                ${game.name}<br>
                <small>by ${game.author}</small><br>
                <small>Click to play</small>
            </div>
        `;
        
        card.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.launchGame(game);
        });
        
        return card;
    }

    async launchGame(game) {
        console.log('Launching:', game.name);
        
        if (game.type === 'external') {
            window.open(game.url, '_blank');
            return;
        }
        
        
        if (window.gamePlayer && window.gamePlayer.show) {
            const loadingGame = {
                name: game.name,
                author: game.author,
                localPath: 'about:blank',
                type: 'loading'
            };
            window.gamePlayer.show(loadingGame);
            
            
            try {
                const gameCode = await this.gamesManager.downloadGameCode(game);
                
                if (gameCode && gameCode.blobUrl) {
                    
                    window.gamePlayer.close();
                    
                    setTimeout(() => {
                        const actualGame = {
                            name: game.name,
                            author: game.author,
                            localPath: gameCode.blobUrl,
                            type: 'standalone'
                        };
                        window.gamePlayer.show(actualGame);
                    }, 100);
                } else {
                    alert(`Failed to load ${game.name}`);
                    window.gamePlayer.close();
                }
            } catch (error) {
                console.error('Launch error:', error);
                alert(`Error: ${error.message}`);
                window.gamePlayer.close();
            }
        } else {
            
            alert(`Downloading ${game.name}...`);
            try {
                const gameCode = await this.gamesManager.downloadGameCode(game);
                if (gameCode && gameCode.blobUrl) {
                    window.open(gameCode.blobUrl, '_blank');
                }
            } catch (error) {
                alert(`Failed: ${error.message}`);
            }
        }
    }

    updateGamesCounter() {
        const gamesCount = document.getElementById('gamesCount');
        if (gamesCount) {
            const totalGames = this.gamesManager.zones.length;
            const filteredGames = this.currentSearch ? 
                this.gamesManager.searchGames(this.currentSearch).length :
                this.currentFilter !== 'all' ? 
                    this.gamesManager.getGamesByCategory(this.currentFilter).length :
                    totalGames;
            
            gamesCount.textContent = filteredGames;
            
            
            localStorage.setItem('corrode_display_games', totalGames);
        }
    }

    searchGames() {
        this.currentSearch = this.searchInput.value.trim().toLowerCase();
        this.renderGames();
    }

    async testAllGames() {
        const games = this.gamesManager.zones;
        const categories = this.gamesManager.categories;
        const featured = this.gamesManager.featuredZones.length;
        
        alert(`🎮 Game Library:\n\n` +
              `• Total Games: ${games.length}\n` +
              `• Featured: ${featured}\n` +
              `• Categories: ${categories.length}\n` +
              `• Sample: ${categories.slice(0, 5).join(', ')}${categories.length > 5 ? '...' : ''}\n\n` +
              `Discord and chatbot games have been filtered out.`);
    }

    addCustomGame() {
        alert('Custom games not available for external repository.');
    }
}


function filterGames(category) {
    gamesUI.filterGames(category);
}

function searchGames() {
    gamesUI.searchGames();
}

function testAllGames() {
    gamesUI.testAllGames();
}

function addCustomGame() {
    gamesUI.addCustomGame();
}


let gamesUI;
document.addEventListener('DOMContentLoaded', () => {
    gamesUI = new GamesUI();
    window.gamesUI = gamesUI;
});
