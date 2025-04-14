import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        window.location.href = '/blog';
        return;
    }

    try {
        const docRef = doc(window.db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            window.location.href = '/blog';
            return;
        }

        const post = docSnap.data();
        const pageUrl = window.location.href;
        const defaultImage = 'https://static.wixstatic.com/media/5f23d5_a503b0a04edf497fbb164b8f179d8bff~mv2.png';
        const readingTime = Math.ceil(post.content.split(' ').length / 200); // Assuming 200 words per minute
        
        // Update page title and meta tags
        document.title = `${post.title} - Nova Suite Blog`;
        
        // Update OpenGraph meta tags
        document.getElementById('og-title').content = post.title;
        document.getElementById('og-description').content = post.excerpt || post.content.substring(0, 160);
        document.getElementById('og-image').content = post.featuredImage || defaultImage;
        document.getElementById('og-url').content = pageUrl;
        document.getElementById('og-section').content = post.category || 'Updates';
        document.getElementById('og-published-time').content = post.date;
        
        // Update Twitter Card meta tags
        document.getElementById('twitter-title').content = post.title;
        document.getElementById('twitter-description').content = post.excerpt || post.content.substring(0, 160);
        document.getElementById('twitter-image').content = post.featuredImage || defaultImage;
        document.getElementById('twitter-reading-time').content = `${readingTime} minutes`;
        
        // Update author meta
        document.getElementById('meta-author').content = post.author || 'Nova Suite Blog Team';

        const categoryLabels = {
            'general': 'General Updates',
            'feature': 'Feature Spotlight',
            'tips': 'Tips & Tricks',
            'news': 'Product News'
        };

        document.title = `${post.title} - Nova Suite Blog`;
        
        // Set post content
        document.getElementById('post-category').textContent = categoryLabels[post.category] || 'Update';
        document.getElementById('post-category').style.setProperty('--category-color', 
            post.category === 'general' ? 'var(--text)' :
            post.category === 'feature' ? 'var(--nova-primary)' :
            post.category === 'tips' ? 'var(--nova-secondary)' :
            'var(--astro-primary)'
        );
        
        document.getElementById('post-date').textContent = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-author').textContent = post.author;
        
        if (post.featuredImage) {
            const img = document.getElementById('post-image');
            img.src = post.featuredImage;
            img.alt = post.title;
        } else {
            document.querySelector('.post-featured-image').style.display = 'none';
        }
        
        document.getElementById('post-content').innerHTML = convertMarkdown(post.content);
    } catch (error) {
        console.error('Error loading post:', error);
        window.location.href = '/blog';
    }
}

function convertMarkdown(text) {
    return text
        .replace(/#{3}\s(.+)/g, '<h3>$1</h3>')
        .replace(/#{2}\s(.+)/g, '<h2>$1</h2>')
        .replace(/#{1}\s(.+)/g, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^\s*>\s*(.+)/gm, '<blockquote>$1</blockquote>')
        .replace(/^\s*-\s*(.+)/gm, '<li>$1</li>')
        .split('\n\n').map(block => {
            return block.startsWith('<') ? block : `<p>${block}</p>`;
        }).join('\n');
}

loadPost();
