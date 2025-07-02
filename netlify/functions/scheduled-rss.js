const { schedule } = require('@netlify/functions');
const firebase = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, getDocs } = require('firebase/firestore');
const escapeHtml = require('escape-html');

const firebaseConfig = {
    apiKey: "AIzaSyDy0AE6ew6K3DEqjkZhM4CRpbt2bD-0t5I",
    authDomain: "novasuite1a.firebaseapp.com",
    projectId: "novasuite1a",
    storageBucket: "novasuite1a.firebasestorage.app",
    messagingSenderId: "372384559285",
    appId: "1:372384559285:web:56252eb9dd86b624a44efc"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

const handler = async (event, context) => {
    try {
        // Get published posts
        const postsRef = collection(db, 'posts');
        const postsQuery = query(
            postsRef,
            where('status', '==', 'published'),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(postsQuery);

        // Generate RSS items
        const items = [];
        snapshot.forEach(doc => {
            const post = doc.data();
            items.push(`
                <item>
                    <title>${escapeHtml(post.title)}</title>
                    <link>https://blog.novasuite.one/post/${doc.id}</link>
                    <description>${escapeHtml(post.excerpt || post.content.substring(0, 150) + '...')}</description>
                    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
                    <guid isPermaLink="true">https://blog.novasuite.one/post/${doc.id}</guid>
                    <category>${escapeHtml(post.category || 'Updates')}</category>
                    ${post.featuredImage ? `<enclosure url="${escapeHtml(post.featuredImage)}" type="image/jpeg"/>` : ''}
                </item>
            `);
        });

        const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Nova Suite Blog</title>
        <link>https://blog.novasuite.one</link>
        <description>Latest features, tips, and Nova Suite insider updates</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items.join('')}
    </channel>
</rss>`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=1800'
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
};

// Export the scheduled handler (runs every 30 minutes)
module.exports.handler = schedule('*/30 * * * *', handler);