const { schedule } = require('@netlify/functions');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, collection, query, where, orderBy, getDocs } = require('firebase-admin/firestore');
const escapeXML = require('escape-html');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const handler = async function(event, context) {
  try {
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
        // Only include published posts
        items.push(`
            <item>
                <title>${escapeXML(post.title)}</title>
                <link>https://novasuite.one/blog/post.html?id=${doc.id}</link>
                <description>${escapeXML(post.excerpt || post.content.substring(0, 150) + '...')}</description>
                <pubDate>${new Date(post.date).toUTCString()}</pubDate>
                <guid isPermaLink="true">https://novasuite.one/blog/post.html?id=${doc.id}</guid>
                <category>${post.category || 'Updates'}</category>
                ${post.featuredImage ? `<enclosure url="${post.featuredImage}" type="image/jpeg"/>` : ''}
            </item>
        `);
    });

    const rss = `
        <rss version="2.0">
            <channel>
                <title>Novasuite Blog</title>
                <link>https://novasuite.one/blog</link>
                <description>Latest updates and news from Novasuite</description>
                <language>en-us</language>
                ${items.join('')}
            </channel>
        </rss>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/rss+xml'
      },
      body: rss
    };
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};

module.exports.handler = schedule('@daily', handler);