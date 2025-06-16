// Sitemap Generator for Nova Suite Blog
// This generates an XML sitemap for all published blog posts

import { collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

class SitemapGenerator {
    constructor() {
        this.baseUrl = 'https://novasuite.one';
    }

    async generateBlogSitemap() {
        try {
            const postsRef = collection(window.db, 'posts');
            const postsQuery = query(
                postsRef,
                where('status', '==', 'published'),
                orderBy('date', 'desc')
            );
            
            const snapshot = await getDocs(postsQuery);
            const urls = [];
            
            // Add blog index
            urls.push({
                url: `${this.baseUrl}/blog/`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.8'
            });
            
            // Add individual blog posts
            snapshot.forEach(doc => {
                const post = doc.data();
                urls.push({
                    url: `${this.baseUrl}/blog/post.html?id=${doc.id}`,
                    lastmod: new Date(post.lastSaved || post.date).toISOString().split('T')[0],
                    changefreq: 'monthly',
                    priority: '0.7'
                });
            });
            
            return this.generateXML(urls);
        } catch (error) {
            console.error('Error generating blog sitemap:', error);
            return null;
        }
    }

    generateXML(urls) {
        const urlElements = urls.map(url => `
        <url>
            <loc>${this.escapeXML(url.url)}</loc>
            <lastmod>${url.lastmod}</lastmod>
            <changefreq>${url.changefreq}</changefreq>
            <priority>${url.priority}</priority>
        </url>`).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlElements}
</urlset>`;
    }

    escapeXML(text) {
        return text.replace(/[<>&'"]/g, c => ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            "'": '&apos;',
            '"': '&quot;'
        }[c]));
    }

    async updateSitemap() {
        const sitemapXML = await this.generateBlogSitemap();
        if (sitemapXML) {
            // Store in localStorage for development
            localStorage.setItem('nova-blog-sitemap', sitemapXML);
            console.log('Blog sitemap generated:', sitemapXML);
            return sitemapXML;
        }
        return null;
    }
}

// Initialize and export
const sitemapGenerator = new SitemapGenerator();
window.sitemapGenerator = sitemapGenerator;

export { SitemapGenerator };
