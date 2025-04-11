import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('content');
    const preview = document.getElementById('preview');
    const previewToggle = document.getElementById('preview-toggle');
    const toolbar = document.querySelector('.editor-tools');
    const saveDraft = document.getElementById('save-draft');
    
    // Markdown conversion helper (you might want to use a library like marked.js)
    function convertMarkdown(text) {
        // Basic markdown conversion (expand this)
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

    // Live preview
    editor.addEventListener('input', () => {
        if (!preview.classList.contains('hidden')) {
            preview.innerHTML = convertMarkdown(editor.value);
        }
    });

    // Toggle preview
    previewToggle.addEventListener('click', () => {
        preview.classList.toggle('hidden');
        editor.classList.toggle('hidden');
        if (!preview.classList.contains('hidden')) {
            preview.innerHTML = convertMarkdown(editor.value);
        }
    });

    // Toolbar actions
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.tool-btn');
        if (!button) return;

        const action = button.dataset.action;
        const selections = {
            h1: ['# ', ''],
            h2: ['## ', ''],
            h3: ['### ', ''],
            bold: ['**', '**'],
            italic: ['*', '*'],
            strike: ['~~', '~~'],
            link: ['[', '](url)'],
            image: ['![alt text](', ')'],
            code: ['`', '`'],
            quote: ['> ', ''],
            list: ['- ', ''],
            hr: ['---\n', '']
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
    });

    // Auto-save to localStorage every 30 seconds
    let autoSaveInterval = setInterval(() => {
        if (!editor) return;

        const content = {
            title: document.getElementById('title')?.value || '',
            content: editor.value,
            category: document.getElementById('category')?.value || '',
            featuredImage: document.getElementById('featured-image')?.value || '',
            excerpt: document.getElementById('excerpt')?.value || '',
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('nova-blog-draft', JSON.stringify(content));
    }, 30000);

    // Load draft immediately after DOM is ready
    const savedDraft = localStorage.getItem('nova-blog-draft');
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
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
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
});
