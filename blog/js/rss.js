import { collection, query, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { writeFile } from 'fs/promises';

async function generateRSS() {
    const postsRef = collection(window.db, 'posts');
    const postsQuery = query(postsRef, orderBy('date', 'desc'));
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
                <guid>https://novasuite.one/blog/post.html?id=${doc.id}</guid>
                <category>${post.category || 'Updates'}</category>
                ${post.featuredImage ? `<enclosure url="${post.featuredImage}" type="image/jpeg"/>` : ''}
            </item>
        `);
    });

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
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

    await writeFile('../feed.xml', rss);
}

function escapeXML(text) {
    return text.replace(/[<>&'"]/g, c => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;'
    }[c]));
}

export { generateRSS };
