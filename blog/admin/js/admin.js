import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Wait for DOM and Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-form');
    const editorContainer = document.getElementById('post-editor');
    const googleSignInBtn = document.getElementById('google-signin');
    const publishBtn = document.getElementById('publish');
    const tagsPreview = document.getElementById('tags-preview');

    auth.onAuthStateChanged(user => {
        if (user) {
            loginContainer.classList.add('hidden');
            editorContainer.classList.remove('hidden');
        } else {
            loginContainer.classList.remove('hidden');
            editorContainer.classList.add('hidden');
        }
    });

    googleSignInBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    publishBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Check if elements exist before accessing value
        const title = document.getElementById('title')?.value;
        const content = document.getElementById('content')?.value;
        const category = document.getElementById('category')?.value;
        const featuredImage = document.getElementById('featured-image')?.value;
        const excerpt = document.getElementById('excerpt')?.value;
        
        // Collect tags if they exist
        const tags = [];
        if (tagsPreview) {
            tagsPreview.querySelectorAll('.tag-pill').forEach(tag => {
                // Get just the text content without the X button
                const tagText = tag.textContent.trim();
                tags.push(tagText);
            });
        }

        if (!title || !content) {
            alert('Title and content are required');
            return;
        }
        
        // Show publishing status
        const originalBtnText = publishBtn.innerHTML;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        publishBtn.disabled = true;
        
        try {
            await addDoc(collection(db, 'posts'), {
                title,
                content,
                category,
                tags,
                featuredImage,
                excerpt,
                date: new Date().toISOString(),
                author: 'Nova Suite Blog Team',
                status: 'published',
                wordCount: content.split(/\s+/).length,
                readingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
            });
            
            // Clear localStorage draft after successful publish
            localStorage.removeItem('nova-blog-draft');
            
            // Reset form
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            document.getElementById('category').value = '';
            document.getElementById('featured-image').value = '';
            document.getElementById('excerpt').value = '';
            
            // Clear tags
            if (tagsPreview) {
                tagsPreview.innerHTML = '';
            }
            
            // Clear image preview
            const imagePreview = document.getElementById('image-preview');
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.innerHTML = '';
            }
            
            // Update word count
            const wordCount = document.getElementById('wordcount');
            if (wordCount) {
                wordCount.textContent = '0 words | 0 min read';
            }
            
            alert('Post published successfully!');
        } catch (error) {
            alert('Failed to publish: ' + error.message);
        } finally {
            publishBtn.innerHTML = originalBtnText;
            publishBtn.disabled = false;
        }
    });
});
