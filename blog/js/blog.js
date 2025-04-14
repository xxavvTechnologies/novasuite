import { collection, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

const postsContainer = document.getElementById('posts-container');

async function loadPosts() {
    const postsRef = collection(window.db, 'posts');
    const postsQuery = query(postsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(postsQuery);

    snapshot.forEach(doc => {
        const post = doc.data();
        const postElement = createPostElement(post, doc.id);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post, id) {
    const categoryLabels = {
        'general': 'General Updates',
        'feature': 'Feature Spotlight',
        'tips': 'Tips & Tricks',
        'news': 'Product News'
    };

    const categoryColors = {
        'general': 'var(--text)',
        'feature': 'var(--nova-primary)',
        'tips': 'var(--nova-secondary)',
        'news': 'var(--astro-primary)'
    };

    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
        <div class="post-card-header">
            <span class="post-category" style="--category-color: ${categoryColors[post.category] || 'var(--nova-primary)'}">
                ${categoryLabels[post.category] || 'Update'}
            </span>
            <time class="post-date">${new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}</time>
        </div>
        ${post.featuredImage ? `<img src="${post.featuredImage}" class="post-image" alt="${post.title}">` : ''}
        <h2 class="post-title">${post.title}</h2>
        <p class="post-excerpt">${post.excerpt || post.content.substring(0, 150)}...</p>
        <div class="post-meta">
            <span class="post-author">Nova Suite Blog Team</span>
        </div>
        <a href="/blog/post.html?id=${id}" class="primary-button">Read More</a>
    `;
    return div;
}

document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelector('.pill.active').classList.remove('active');
        pill.classList.add('active');
        filterPosts(pill.textContent.toLowerCase());
    });
});

async function filterPosts(category) {
    postsContainer.innerHTML = '';
    const postsRef = collection(window.db, 'posts');
    let postsQuery;
    
    if (category !== 'all updates') {
        postsQuery = query(
            postsRef,
            where('category', '==', 
                category === 'general updates' ? 'general' :
                category === 'feature spotlights' ? 'feature' : 
                category === 'tips & tricks' ? 'tips' : 'news'
            ),
            orderBy('date', 'desc')
        );
    } else {
        postsQuery = query(postsRef, orderBy('date', 'desc'));
    }
    
    const snapshot = await getDocs(postsQuery);
    snapshot.forEach(doc => {
        const post = doc.data();
        const postElement = createPostElement(post, doc.id);
        postsContainer.appendChild(postElement);
    });
}

loadPosts();
