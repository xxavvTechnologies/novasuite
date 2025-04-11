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
        const categoryLabels = {
            'feature': 'Feature Spotlight',
            'tips': 'Tips & Tricks',
            'news': 'Product News'
        };

        document.title = `${post.title} - Nova Suite Blog`;
        
        // Set post content
        document.getElementById('post-category').textContent = categoryLabels[post.category] || 'Update';
        document.getElementById('post-category').style.setProperty('--category-color', 
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
