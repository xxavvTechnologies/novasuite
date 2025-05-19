import { collection, addDoc, getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('content');
    const preview = document.getElementById('preview');
    const previewToggle = document.getElementById('preview-toggle');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const toolbar = document.querySelector('.editor-tools');
    const saveDraft = document.getElementById('save-draft');
    const wordCount = document.getElementById('wordcount');
    const autosaveStatus = document.getElementById('autosave-status');
    const tagsInput = document.getElementById('post-tags');
    const tagsPreview = document.getElementById('tags-preview');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    
    // Use marked.js for better Markdown parsing
    function convertMarkdown(text) {
        return marked.parse(text);
    }    // Word count and reading time estimation
    function updateWordCount() {
        const text = editor.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const readingTime = Math.max(1, Math.ceil(words / 200)); // Assuming 200 words per minute reading speed
        wordCount.textContent = `${words} words | ${readingTime} min read`;
    }
    
    // Live preview and word count update
    editor.addEventListener('input', () => {
        if (!preview.classList.contains('hidden')) {
            preview.innerHTML = convertMarkdown(editor.value);
        }
        updateWordCount();
        
        // Show saving indicator
        autosaveStatus.textContent = 'Saving...';
        autosaveStatus.classList.add('saving');
        autosaveStatus.classList.remove('saved');
    });

    // Toggle preview with improved UI feedback
    previewToggle.addEventListener('click', () => {
        preview.classList.toggle('hidden');
        editor.parentNode.classList.toggle('hidden');
        
        if (!preview.classList.contains('hidden')) {
            preview.innerHTML = convertMarkdown(editor.value);
            previewToggle.innerHTML = '<i class="fas fa-edit"></i> Edit';
        } else {
            previewToggle.innerHTML = '<i class="fas fa-eye"></i> Preview';
        }
    });
    
    // Fullscreen toggle
    fullscreenToggle.addEventListener('click', () => {
        const editorContainer = document.querySelector('.editor-container');
        editorContainer.classList.toggle('fullscreen-mode');
        
        if (editorContainer.classList.contains('fullscreen-mode')) {
            fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });

    // Enhanced toolbar actions
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.tool-btn');
        if (!button) return;

        const action = button.dataset.action;
        const selections = {
            h1: ['# ', ''],
            h2: ['## ', ''],
            h3: ['### ', ''],
            h4: ['#### ', ''],
            bold: ['**', '**'],
            italic: ['*', '*'],
            strike: ['~~', '~~'],
            highlight: ['==', '=='],
            link: ['[', '](url)'],
            image: ['![alt text](', ')'],
            table: ['| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n| Cell 3 | Cell 4 |', ''],
            code: ['`', '`'],
            codeblock: ['```\n', '\n```'],
            quote: ['> ', ''],
            ul: ['- ', ''],
            ol: ['1. ', ''],
            hr: ['\n---\n', '']
        };

        if (selections[action]) {
            insertText(editor, ...selections[action]);
        }
    });

    // Insert text helper
    function insertText(textarea, before, after) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selection = textarea.value.substring(start, end);
        const replacement = before + selection + after;
        
        textarea.value = textarea.value.substring(0, start) + replacement + 
                        textarea.value.substring(end);
        
        textarea.focus();
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selection.length;
    }

    // Save draft to Firestore
    saveDraft?.addEventListener('click', async () => {
        if (!auth.currentUser) return;
        
        const content = {
            title: document.getElementById('title')?.value || '',
            content: editor?.value || '',
            category: document.getElementById('category')?.value || '',
            featuredImage: document.getElementById('featured-image')?.value || '',
            excerpt: document.getElementById('excerpt')?.value || '',
            lastSaved: new Date().toISOString(),
            author: 'Nova Suite Blog Team',
            status: 'draft'
        };

        try {
            await addDoc(collection(db, 'posts'), content);
            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Error saving draft');
        }
    });    // Auto-save to localStorage with visual feedback
    let autoSaveTimeout;
    let autoSaveInterval = setInterval(() => {
        saveToLocalStorage();
    }, 30000); // Every 30 seconds

    // Auto-save when typing stops (debounced)
    editor.addEventListener('input', () => {
        clearTimeout(autoSaveTimeout);
        
        autoSaveTimeout = setTimeout(() => {
            saveToLocalStorage();
        }, 2000); // 2 seconds after typing stops
    });

    function saveToLocalStorage() {
        if (!editor) return;
        
        // Gather all tags
        const tags = [];
        if (tagsPreview) {
            tagsPreview.querySelectorAll('.tag-pill').forEach(tag => {
                // Get just the text content without the X button
                const tagText = tag.textContent.trim();
                tags.push(tagText);
            });
        }

        // Save all form data
        const content = {
            title: document.getElementById('title')?.value || '',
            content: editor.value,
            category: document.getElementById('category')?.value || '',
            tags: tags,
            featuredImage: document.getElementById('featured-image')?.value || '',
            excerpt: document.getElementById('excerpt')?.value || '',
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('nova-blog-draft', JSON.stringify(content));
        
        // Update autosave status with visual feedback
        if (autosaveStatus) {
            autosaveStatus.textContent = 'Saved';
            autosaveStatus.classList.remove('saving');
            autosaveStatus.classList.add('saved');
        }
    }

    // Load draft immediately after DOM is ready
    const savedDraft = localStorage.getItem('nova-blog-draft');
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            
            // Set simple form fields
            const fields = {
                'title': document.getElementById('title'),
                'content': editor,
                'category': document.getElementById('category'),
                'featured-image': document.getElementById('featured-image'),
                'excerpt': document.getElementById('excerpt')
            };

            // Safely set values only if elements exist
            Object.entries(fields).forEach(([key, element]) => {
                if (element && draft[key]) {
                    element.value = draft[key];
                }
            });
            
            // Handle tags if they were saved
            if (draft.tags && draft.tags.length > 0 && tagsPreview) {
                draft.tags.forEach(tag => {
                    addTag(tag);
                });
            }
            
            // Show image preview if there's a featured image
            if (draft.featuredImage && imagePreview) {
                showImagePreview(draft.featuredImage);
            }
            
            // Update word count on load
            updateWordCount();
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }

    // Initialize tags functionality
    if (tagsInput && tagsPreview) {
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === ',' || e.key === 'Enter') {
                e.preventDefault();
                const value = tagsInput.value.trim();
                if (value) {
                    addTag(value);
                    tagsInput.value = '';
                }
            }
        });

        // Process tags on blur
        tagsInput.addEventListener('blur', () => {
            const value = tagsInput.value.trim();
            if (value) {
                // Split by commas for multiple tags
                const tagValues = value.split(',');
                tagValues.forEach(tag => {
                    const trimmedTag = tag.trim();
                    if (trimmedTag) addTag(trimmedTag);
                });
                tagsInput.value = '';
            }
        });

        // Add tag function
        function addTag(text) {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-pill';
            tagElement.innerHTML = `
                ${text}
                <span class="remove-tag"><i class="fas fa-times"></i></span>
            `;
            
            // Remove tag on click
            tagElement.querySelector('.remove-tag').addEventListener('click', () => {
                tagElement.remove();
            });
            
            tagsPreview.appendChild(tagElement);
        }
    }

    // Image upload and preview
    if (imageUpload && imagePreview) {
        // Preview image from URL input
        document.getElementById('featured-image').addEventListener('change', (e) => {
            const url = e.target.value;
            if (url) {
                showImagePreview(url);
            } else {
                imagePreview.style.display = 'none';
            }
        });
        
        // Handle file upload
        imageUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                // Create a preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    showImagePreview(event.target.result);
                };
                reader.readAsDataURL(file);
                
                // Upload to Firebase Storage (we'll implement this when Firebase storage is properly set up)
                /* 
                const storage = getStorage();
                const storageRef = ref(storage, `blog-images/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                
                // Update the URL input
                document.getElementById('featured-image').value = downloadURL;
                */
                
                // For now, just show a success message
                alert('Image selected. Note: Firebase Storage implementation needed for actual uploads.');
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Error processing image');
            }
        });
        
        function showImagePreview(src) {
            imagePreview.innerHTML = `<img src="${src}" alt="Preview">`;
            imagePreview.style.display = 'block';
        }
    }

    // Add toolbar toggle functionality
    const editorTools = document.querySelector('.editor-tools');
    
    // Add a toggle button
    const toolbarToggle = document.createElement('button');
    toolbarToggle.className = 'toolbar-toggle';
    toolbarToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
    editorTools.parentNode.insertBefore(toolbarToggle, editorTools);
    
    toolbarToggle.addEventListener('click', () => {
        editorTools.classList.toggle('collapsed');
        
        if (editorTools.classList.contains('collapsed')) {
            toolbarToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            toolbarToggle.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    });
    
    // Initialize word count on page load
    updateWordCount();
});
