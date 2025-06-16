// Blog System Initialization and Error Handling
// This file ensures proper loading and SEO functionality for the Nova Suite Blog

class BlogManager {
    constructor() {
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.initTimeout = null;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Wait for Firebase to be available
            await this.waitForFirebase();
            
            // Initialize based on page type
            const path = window.location.pathname;
            
            if (path.includes('/blog/post.html')) {
                await this.initBlogPost();
            } else if (path.includes('/blog/index.html') || path.includes('/blog/')) {
                await this.initBlogListing();
            } else if (path === '/' || path.includes('index.html')) {
                await this.initBlogPreview();
            }
            
            this.initialized = true;
            console.log('Blog system initialized successfully');
            
        } catch (error) {
            console.error('Blog initialization failed:', error);
            this.handleInitError(error);
        }
    }

    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            const checkFirebase = () => {
                if (window.db) {
                    resolve();
                } else if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    setTimeout(checkFirebase, 1000);
                } else {
                    reject(new Error('Firebase not available after retries'));
                }
            };
            checkFirebase();
        });
    }

    async initBlogPost() {
        // Ensure post.js is loaded and executed
        if (typeof loadPost === 'function') {
            await loadPost();
        } else {
            // Fallback: show error message
            this.showPostError();
        }
    }

    async initBlogListing() {
        // Load blog listing
        const { loadPosts } = await import('./blog.js');
        await loadPosts();
    }

    async initBlogPreview() {
        // Load blog preview for home page
        const { loadBlogPreviews } = await import('../js/home.js');
        await loadBlogPreviews();
    }

    showPostError() {
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = `
                <div class="post-error">
                    <h2>Unable to Load Post</h2>
                    <p>We're having trouble loading this blog post. Please try refreshing the page or <a href="/blog">return to the blog</a>.</p>
                </div>
            `;
        }
    }

    handleInitError(error) {
        console.error('Blog system error:', error);
        
        // Show user-friendly error message
        const container = document.querySelector('.blog-grid, #posts-container, .post-content');
        if (container) {
            container.innerHTML = `
                <div class="system-error">
                    <h3>Temporarily Unavailable</h3>
                    <p>Our blog system is temporarily unavailable. Please try again in a few moments.</p>
                    <button onclick="window.location.reload()" class="secondary-button">Retry</button>
                </div>
            `;
        }
    }

    // SEO Enhancement Methods
    updatePageSEO(data) {
        if (data.title) {
            document.title = data.title;
            this.updateMetaTag('og:title', data.title);
            this.updateMetaTag('twitter:title', data.title);
        }
        
        if (data.description) {
            this.updateMetaTag('description', data.description);
            this.updateMetaTag('og:description', data.description);
            this.updateMetaTag('twitter:description', data.description);
        }
        
        if (data.image) {
            this.updateMetaTag('og:image', data.image);
            this.updateMetaTag('twitter:image', data.image);
        }
        
        if (data.url) {
            this.updateMetaTag('og:url', data.url);
            this.updateCanonical(data.url);
        }
        
        if (data.structuredData) {
            this.updateStructuredData(data.structuredData);
        }
    }

    updateMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"], meta[name="${property}"], meta[id*="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            if (property.startsWith('og:') || property.startsWith('article:')) {
                meta.setAttribute('property', property);
            } else {
                meta.setAttribute('name', property);
            }
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    updateCanonical(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
    }

    updateStructuredData(data) {
        let script = document.getElementById('article-schema');
        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'article-schema';
            document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(data);
    }

    // Debug mode for developers
    enableDebugMode() {
        const debugPanel = document.createElement('div');
        debugPanel.className = 'debug-meta show';
        debugPanel.innerHTML = `
            <h4>SEO Debug Info</h4>
            <div id="debug-content"></div>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(debugPanel);
        
        this.updateDebugInfo();
    }

    updateDebugInfo() {
        const debugContent = document.getElementById('debug-content');
        if (!debugContent) return;
        
        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.content || 'Not set';
        const ogImage = document.querySelector('meta[property="og:image"]')?.content || 'Not set';
        
        debugContent.innerHTML = `
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Description:</strong> ${description.substring(0, 50)}...</p>
            <p><strong>OG Image:</strong> ${ogImage.includes('http') ? '✓ Set' : '✗ Missing'}</p>
            <p><strong>Structured Data:</strong> ${document.getElementById('article-schema') ? '✓ Present' : '✗ Missing'}</p>
        `;
    }
}

// Initialize blog manager
const blogManager = new BlogManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    blogManager.init();
});

// Enable debug mode with URL parameter
if (window.location.search.includes('debug=seo')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => blogManager.enableDebugMode(), 1000);
    });
}

// Export for global access
window.blogManager = blogManager;
