import { collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

async function loadBlogPreview() {
    const postsContainer = document.querySelector('.blog-posts-preview');
    if (!postsContainer) return;

    try {
        const postsQuery = query(
            collection(window.db, 'posts'),
            where('status', '==', 'published'),
            orderBy('date', 'desc'),
            limit(3)
        );

        const snapshot = await getDocs(postsQuery);
        
        // Clear existing content
        postsContainer.innerHTML = '';
        
        if (snapshot.empty) {
            postsContainer.innerHTML = '<div class="no-preview-posts">No recent blog posts available.</div>';
            return;
        }
        
        snapshot.forEach(doc => {
            const post = doc.data();
            const postElement = createPreviewElement(post, doc.id);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading blog preview:', error);
        // Show fallback content or hide the section
        postsContainer.innerHTML = '<div class="error-preview-posts">Unable to load recent posts.</div>';
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
