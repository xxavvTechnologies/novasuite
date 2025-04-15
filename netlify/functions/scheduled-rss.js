import { schedule } from '@netlify/functions';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import escapeHtml from 'escape-html';

const firebaseConfig = {
    apiKey: "AIzaSyDy0AE6ew6K3DEqjkZhM4CRpbt2bD-0t5I",
    authDomain: "novasuite1a.firebaseapp.com",
    projectId: "novasuite1a",
    storageBucket: "novasuite1a.firebasestorage.app",
    messagingSenderId: "372384559285",
    appId: "1:372384559285:web:56252eb9dd86b624a44efc"
};

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

// Separate the RSS generation logic
async function generateRSSFeed(db) {
    const postsRef = collection(db, 'posts');
    const postsQuery = query(
        postsRef,
        where('status', '==', 'published'),
        orderBy('date', 'desc')
    );
    const snapshot = await getDocs(postsQuery);

    const items = [];
    snapshot.forEach(doc => {
        const post = doc.data();
        items.push(`
            <item>
                <title>${escapeXML(post.title)}</title>
                <link>https://novasuite.one/blog/post.html?id=${doc.id}</link>
                <description>${escapeXML(post.excerpt || post.content.substring(0, 150) + '...')}</description>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>
                <guid isPermaLink="true">https://novasuite.one/blog/post.html?id=${doc.id}</guid>
                <category>${escapeXML(post.category || 'Updates')}</category>
                ${post.featuredImage ? `<enclosure url="${escapeXML(post.featuredImage)}" type="image/jpeg"/>` : ''}
            </item>
        `);
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Nova Suite Blog</title>
        <link>https://novasuite.one/blog</link>
        <description>Latest features, tips, and Nova Suite insider updates</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items.join('')}
    </channel>
</rss>`;
}

// Main handler function
async function handler(event, context) {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const rss = await generateRSSFeed(db);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=21600',
                'Access-Control-Allow-Origin': '*'
            },
            body: rss
        };
    } catch (error) {
        console.error('Error generating RSS feed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error generating RSS feed' })
        };
    }
}

// Export both scheduled and direct handler
export const scheduledHandler = schedule('0 */6 * * *', handler);
export { handler };