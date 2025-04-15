// Import needed Firestore functions
import { 
    collection, query, where, orderBy, getDocs, 
    doc, deleteDoc, updateDoc 
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

async function loadPosts() {
    if (!auth.currentUser) return;

    const postsContainer = document.getElementById('posts-list');
    const draftsContainer = document.getElementById('drafts-list');

    try {
        // Load published posts
        const publishedQuery = query(
            collection(db, 'posts'),
            where('status', '!=', 'draft'),
            orderBy('status'),
            orderBy('lastSaved', 'desc')
        );

        // Load drafts
        const draftsQuery = query(
            collection(db, 'posts'),
            where('status', '==', 'draft'),
            orderBy('lastSaved', 'desc')
        );

        const [publishedSnapshot, draftsSnapshot] = await Promise.all([
            getDocs(publishedQuery),
            getDocs(draftsQuery)
        ]);

        postsContainer.innerHTML = '';
        draftsContainer.innerHTML = '';

        publishedSnapshot.forEach(doc => {
            const post = doc.data();
            postsContainer.appendChild(createPostElement(doc.id, post));
        });

        draftsSnapshot.forEach(doc => {
            const draft = doc.data();
            draftsContainer.appendChild(createPostElement(doc.id, draft));
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function createPostElement(id, post) {
    const div = document.createElement('div');
    div.className = 'post-item';
    div.innerHTML = `
        <div class="post-item-header">
            <h3>${post.title || 'Untitled'}</h3>
            <span class="status-badge ${post.status}">${post.status}</span>
        </div>
        <div class="post-item-meta">
            <span>By ${post.author}</span>
            <span>Last updated: ${new Date(post.lastSaved).toLocaleString()}</span>
        </div>
        <div class="post-item-actions">
            <button onclick="editPost('${id}')" class="secondary-button">Edit</button>
            <button onclick="deletePost('${id}')" class="danger-button">Delete</button>
            ${post.status === 'draft' ? 
                `<button onclick="publishPost('${id}')" class="primary-button">Publish</button>` : 
                `<button onclick="unpublishPost('${id}')" class="warning-button">Unpublish</button>`
            }
        </div>
    `;
    return div;
}

async function editPost(id) {
    window.location.href = `editor.html?id=${id}`;
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        await deleteDoc(doc(db, 'posts', id));
        loadPosts();
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
    }
}

async function publishPost(id) {
    try {
        await updateDoc(doc(db, 'posts', id), {
            status: 'published',
            publishedAt: new Date().toISOString()
        });
        loadPosts();
    } catch (error) {
        console.error('Error publishing post:', error);
        alert('Error publishing post');
    }
}

async function unpublishPost(id) {
    try {
        await updateDoc(doc(db, 'posts', id), {
            status: 'draft'
        });
        loadPosts();
    } catch (error) {
        console.error('Error unpublishing post:', error);
        alert('Error unpublishing post');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            loadPosts();
        }
    });
});
