import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

async function loadBlogPreview() {
    const postsContainer = document.querySelector('.blog-posts-preview');
    if (!postsContainer) return;

    try {
        const postsQuery = query(
            collection(window.db, 'posts'),
            orderBy('date', 'desc'),
            limit(3)
        );

        const snapshot = await getDocs(postsQuery);
        snapshot.forEach(doc => {
            const post = doc.data();
            const postElement = createPreviewElement(post, doc.id);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading blog preview:', error);
    }
}

function createPreviewElement(post, id) {
    const div = document.createElement('div');
    div.className = 'preview-post-card';
    div.innerHTML = `
        <a href="/blog/post.html?id=${id}" class="preview-post-link">
            ${post.featuredImage ? 
                `<img src="${post.featuredImage}" class="preview-post-image" alt="${post.title}">` : 
                '<div class="preview-post-image-placeholder"></div>'
            }
            <div class="preview-post-content">
                <h3>${post.title}</h3>
                <p>${post.excerpt || post.content.substring(0, 120)}...</p>
            </div>
        </a>
    `;
    return div;
}

// Initialize when Firebase is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.db) {
        loadBlogPreview();
    }
});
