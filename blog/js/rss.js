// RSS Feed Generator for Nova Suite Blog
import { collection, query, where, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

async function generateRSS() {
    try {
        const postsRef = collection(window.db, 'posts');
        const postsQuery = query(
            postsRef, 
            where('status', '==', 'published'),
            orderBy('date', 'desc'),
            limit(20) // Limit to most recent 20 posts
        );
        const snapshot = await getDocs(postsQuery);

        const items = [];
        snapshot.forEach(doc => {
            const post = doc.data();
            const pubDate = new Date(post.date).toUTCString();
            const description = post.excerpt || post.content.substring(0, 200) + '...';
            
            items.push(`
            <item>
                <title>${escapeXML(post.title)}</title>
                <link>https://novasuite.one/blog/post.html?id=${doc.id}</link>
                <description>${escapeXML(description)}</description>
                <pubDate>${pubDate}</pubDate>
                <guid isPermaLink="true">https://novasuite.one/blog/post.html?id=${doc.id}</guid>
                <category>${escapeXML(post.category || 'Updates')}</category>
                <author>blog@novasuite.one (Nova Suite Blog Team)</author>
                ${post.featuredImage ? `<enclosure url="${escapeXML(post.featuredImage)}" type="image/jpeg"/>` : ''}
                <source url="https://novasuite.one/blog/feed.xml">Nova Suite Blog</source>
            </item>`);
        });

        const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Nova Suite Blog</title>
        <link>https://novasuite.one/blog</link>
        <description>Latest features, tips, and Nova Suite insider updates</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <managingEditor>blog@novasuite.one (Nova Suite Blog Team)</managingEditor>
        <webMaster>support@novasuite.one (Nova Suite Support)</webMaster>
        <generator>Nova Suite Blog System</generator>
        <image>
            <url>https://static.wixstatic.com/media/5f23d5_a503b0a04edf497fbb164b8f179d8bff~mv2.png</url>
            <title>Nova Suite Blog</title>
            <link>https://novasuite.one/blog</link>
        </image>
        <atom:link href="https://novasuite.one/blog/feed.xml" rel="self" type="application/rss+xml" />
        ${items.join('')}
    </channel>
</rss>`;

        return rss;
    } catch (error) {
        console.error('Error generating RSS:', error);
        return null;
    }
}

function escapeXML(text) {
    if (!text) return '';
    return text.replace(/[<>&'"]/g, c => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;'
    }[c]));
}

// Function to update RSS feed (can be called when new posts are published)
async function updateRSSFeed() {
    const rssContent = await generateRSS();
    if (rssContent) {
        // In a real implementation, this would save to feed.xml
        // For now, we'll log it or store in localStorage for development
        console.log('RSS Feed Generated:', rssContent);
        localStorage.setItem('nova-blog-rss', rssContent);
        return rssContent;
    }
    return null;
}

// Export functions for use elsewhere
window.generateRSS = generateRSS;
window.updateRSSFeed = updateRSSFeed;

export { generateRSS, updateRSSFeed };
