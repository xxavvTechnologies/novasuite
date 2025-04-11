import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Wait for DOM and Firebase to initialize
document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-form');
    const editorContainer = document.getElementById('post-editor');
    const googleSignInBtn = document.getElementById('google-signin');
    const publishBtn = document.getElementById('publish');

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

        if (!title || !content) {
            alert('Title and content are required');
            return;
        }
        
        try {
            await addDoc(collection(db, 'posts'), {
                title,
                content,
                category,
                featuredImage,
                excerpt,
                date: new Date().toISOString(),
                author: 'Nova Suite Blog Team',
                status: 'published'
            });
            
            alert('Post published successfully!');
            // Clear form fields
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            document.getElementById('category').value = '';
            document.getElementById('featured-image').value = '';
            document.getElementById('excerpt').value = '';
        } catch (error) {
            alert('Failed to publish: ' + error.message);
        }
    });
});
