// Custom Scramjet proxy integration with Wisp support
class ScramjetProxy {
    constructor() {
        this.wispUrl = "wss://webmath.help/wisp/";
        this.proxyUrl = "https://webmath.help/wisp/";
    }

    getProxiedUrl(url) {
        // Remove any existing protocol
        let cleanUrl = url.replace(/^https?:\/\//, '');
        
        // Construct the proxied URL with the correct format
        const proxied = `${this.proxyUrl}${encodeURIComponent(cleanUrl)}`;
        return proxied;
    }

    async fetchViaProxy(url) {
        try {
            // For Scramjet with Wisp, we need to use the iframe approach
            // The proxy.html already handles this
            return null; // Navigation is handled by iframe src
        } catch (error) {
            console.error('Proxy fetch error:', error);
            return null;
        }
    }
}

// Initialize global Scramjet
if (typeof window !== 'undefined') {
    window.ScramjetProxy = new ScramjetProxy();
}