import { doc, getDoc, collection, query, where, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Set up marked.js with highlight.js integration
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (e) {}
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// Global post data for use in various functions
let currentPost = null;
let relatedPosts = [];

async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        window.location.href = '/blog';
        return;
    }
    
    // Show loading state
    document.querySelector('.blog-post').classList.add('loading');

    try {
        const docRef = doc(window.db, 'posts', postId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            window.location.href = '/blog';
            return;
        }        currentPost = { ...docSnap.data(), id: postId };
        const pageUrl = window.location.href;
        const defaultImage = 'https://static.wixstatic.com/media/5f23d5_a503b0a04edf497fbb164b8f179d8bff~mv2.png';
        const readingTime = Math.ceil(currentPost.content.split(' ').length / 200); // Assuming 200 words per minute
        const shortDescription = currentPost.excerpt || currentPost.content.substring(0, 160).trim() + '...';        // Update page title and meta tags
        document.title = `${currentPost.title} - Nova Suite Blog`;
          // Update OpenGraph meta tags
        document.getElementById('og-title').setAttribute('content', currentPost.title);
        document.getElementById('og-description').setAttribute('content', shortDescription);
        document.getElementById('og-image').setAttribute('content', currentPost.featuredImage || defaultImage);
        document.getElementById('og-url').setAttribute('content', pageUrl);
        document.getElementById('og-section').setAttribute('content', currentPost.category || 'Updates');
        document.getElementById('og-published-time').setAttribute('content', new Date(currentPost.date).toISOString());
        
        // Update Twitter Card meta tags
        document.getElementById('twitter-title').setAttribute('content', currentPost.title);
        document.getElementById('twitter-description').setAttribute('content', shortDescription);
        document.getElementById('twitter-image').setAttribute('content', currentPost.featuredImage || defaultImage);
        document.getElementById('twitter-reading-time').setAttribute('value', `${readingTime} minutes`);
        
        // Update author meta
        document.getElementById('meta-author').setAttribute('content', currentPost.author || 'Nova Suite Blog Team');
        document.getElementById('meta-published').setAttribute('content', new Date(currentPost.date).toISOString());
        document.getElementById('meta-modified').setAttribute('content', currentPost.lastSaved || currentPost.date);

        const categoryLabels = {
            'general': 'General Updates',
            'feature': 'Feature Spotlight',
            'tips': 'Tips & Tricks',
            'news': 'Product News'
        };        // Set post content and metadata
        document.getElementById('post-category').textContent = categoryLabels[currentPost.category] || 'Update';
        document.getElementById('post-category').style.setProperty('--category-color', 
            currentPost.category === 'general' ? 'var(--text)' :
            currentPost.category === 'feature' ? 'var(--nova-primary)' :
            currentPost.category === 'tips' ? 'var(--nova-secondary)' :
            'var(--astro-primary)'
        );
        
        document.getElementById('post-date').textContent = new Date(currentPost.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('minutes').textContent = readingTime;
        document.getElementById('post-title').textContent = currentPost.title;
        document.getElementById('post-author').textContent = currentPost.author || 'Nova Suite Team';
        document.getElementById('author-name').textContent = currentPost.author || 'Nova Suite Team';
        
        if (currentPost.featuredImage) {
            const img = document.getElementById('post-image');
            img.src = currentPost.featuredImage;
            img.alt = currentPost.title;
        } else {
            document.querySelector('.post-featured-image').style.display = 'none';
        }
        
        // Render content with Marked.js
        const content = marked.parse(currentPost.content);
        document.getElementById('post-content').innerHTML = content;
          // Process code blocks to add language indicators
        processCodeBlocks();
        
        // Generate table of contents
        generateTableOfContents();
          // Add reading time to headings
        addReadingTimeToHeadings();
        
        // Set up section progress tracking
        setupSectionProgress();// Set up tags if they exist
        if (currentPost.tags && currentPost.tags.length > 0) {
            const tagsContainer = document.getElementById('post-tags');
            currentPost.tags.forEach(tag => {
                const tagElement = document.createElement('a');
                tagElement.href = `/blog/index.html?tag=${encodeURIComponent(tag)}`;
                tagElement.className = 'post-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
        
        // Initialize social sharing
        setupSocialSharing(pageUrl, currentPost.title);
        
        // Load related posts
        await loadRelatedPosts(currentPost.category, currentPost.id);
        
        // Remove loading state
        document.querySelector('.blog-post').classList.remove('loading');
        
    } catch (error) {
        console.error('Error loading post:', error);
        window.location.href = '/blog';
    }
}

// Process code blocks to add language indicators and copy button
function processCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // Apply syntax highlighting
        hljs.highlightElement(block);
        
        // Get language if it exists
        const language = block.className.replace('language-', '').replace('hljs ', '');
        
        // Find parent pre element
        const preElement = block.parentElement;
        if (preElement && preElement.tagName === 'PRE') {
            // Set relative positioning for badge placement
            preElement.style.position = 'relative';
            
            // Create toolbar for the code block
            const toolbar = document.createElement('div');
            toolbar.className = 'code-toolbar';
            
            // Add language badge if applicable
            if (language && language !== 'hljs') {
                const badge = document.createElement('span');
                badge.className = 'code-badge';
                badge.textContent = language;
                toolbar.appendChild(badge);
            }
            
            // Add copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.innerHTML = '<i class="far fa-copy"></i>';
            copyButton.title = 'Copy code';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent)
                    .then(() => {
                        copyButton.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyButton.innerHTML = '<i class="far fa-copy"></i>';
                        }, 2000);
                    })
                    .catch(err => console.error('Failed to copy code: ', err));
            });
            
            toolbar.appendChild(copyButton);
            preElement.appendChild(toolbar);
        }
    });
}

// Generate table of contents from headings
function generateTableOfContents() {
    const headings = document.querySelectorAll('.post-content h2, .post-content h3');
    if (headings.length === 0) return;
    
    const toc = document.getElementById('table-of-contents');
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        // Add ID to heading if missing
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
        
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent;
        link.className = `toc-${heading.tagName.toLowerCase()}`;
        link.dataset.target = heading.id;
        
        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });
    
    toc.appendChild(tocList);
    
    // Add scroll tracking to highlight current section
    setupScrollSpy();
}

// Setup scroll spy for table of contents
function setupScrollSpy() {
    const headings = document.querySelectorAll('.post-content h2, .post-content h3');
    const tocLinks = document.querySelectorAll('.table-of-contents a');
    const progressBar = document.getElementById('reading-progress');
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        // Calculate scroll position for progress bar
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
        
        // Show/hide back to top button
        if (winScroll > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
        
        // Find current heading
        let currentHeadingIndex = 0;
        headings.forEach((heading, index) => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 100) {
                currentHeadingIndex = index;
            }
        });
        
        // Update active TOC link
        tocLinks.forEach(link => link.classList.remove('active'));
        if (tocLinks[currentHeadingIndex]) {
            tocLinks[currentHeadingIndex].classList.add('active');
        }
    });
    
    // Set up back to top button
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Smooth scrolling for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Track section reading progress
function setupSectionProgress() {
    const sections = document.querySelectorAll('.post-content h2, .post-content h3');
    if (sections.length === 0) return;
    
    // Create section progress tracking
    sections.forEach(section => {
        // Get next section element or end of content
        let nextSection = section.nextElementSibling;
        while (nextSection && !['H2', 'H3'].includes(nextSection.tagName)) {
            nextSection = nextSection.nextElementSibling;
        }
        
        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'section-progress-container';
        const progressBar = document.createElement('div');
        progressBar.className = 'section-progress-bar';
        progressContainer.appendChild(progressBar);
        
        // Insert after heading
        if (section.nextElementSibling) {
            section.parentNode.insertBefore(progressContainer, section.nextElementSibling);
        }
    });
    
    // Update progress on scroll
    window.addEventListener('scroll', () => {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const windowHeight = window.innerHeight;
            
            // Find progress bar for this section
            const progressContainer = section.nextElementSibling;
            if (progressContainer && progressContainer.classList.contains('section-progress-container')) {
                const progressBar = progressContainer.querySelector('.section-progress-bar');
                
                // Calculate progress percentage
                if (sectionTop < windowHeight * 0.8) {
                    // Section is in view
                    let progress = Math.min(1, (windowHeight * 0.8 - sectionTop) / (windowHeight * 0.6));
                    progress = Math.max(0, progress);
                    progressBar.style.width = `${progress * 100}%`;
                    
                    if (progress > 0.95) {
                        progressContainer.classList.add('completed');
                    } else {
                        progressContainer.classList.remove('completed');
                    }
                }
            }
        });
    });
}

// Set up social sharing functionality
function setupSocialSharing(pageUrl, title) {
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(title);
    
    // Twitter share
    document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    
    // Facebook share
    document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    // LinkedIn share
    document.getElementById('share-linkedin').href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;
    
    // Copy link button
    document.getElementById('share-copy').addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(pageUrl)
            .then(() => {
                const originalText = e.target.innerHTML;
                e.target.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    e.target.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => console.error('Failed to copy: ', err));
    });
}

// Load related posts based on category
async function loadRelatedPosts(category, currentPostId) {
    try {
        // Query for posts in the same category
        const postsRef = collection(window.db, 'posts');
        const q = query(
            postsRef,
            where('category', '==', category),
            where('status', '==', 'published'),
            limit(4)
        );
        
        const querySnapshot = await getDocs(q);
        const relatedPostsContainer = document.getElementById('related-posts-container');
        relatedPostsContainer.innerHTML = '';
        
        let postsCount = 0;
        
        // Process related posts
        querySnapshot.forEach(doc => {
            // Skip current post
            if (doc.id === currentPostId) return;
            if (postsCount >= 3) return; // Limit to 3 related posts
            
            const post = doc.data();
            const date = new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const postCard = document.createElement('a');
            postCard.href = `post.html?id=${doc.id}`;
            postCard.className = 'related-post-card';
            postCard.innerHTML = `
                ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="related-post-img">` : ''}
                <h4 class="related-post-title">${post.title}</h4>
                <span class="related-post-date">${date}</span>
            `;
            
            relatedPostsContainer.appendChild(postCard);
            postsCount++;
        });
        
        // Hide related posts section if none found
        const relatedPostsSection = document.querySelector('.related-posts');
        if (postsCount === 0) {
            relatedPostsSection.style.display = 'none';
        } else {
            relatedPostsSection.style.display = 'block';
        }
    } catch (error) {
        console.error("Error fetching related posts:", error);
    }
}

// Set up theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('nova-blog-theme');
    
    // Set initial theme based on stored preference or system preference
    if (storedTheme) {
        document.body.classList.toggle('light-theme', storedTheme === 'light');
    } else {
        // Use system preference as default
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-theme', !prefersDark);
    }
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        const isLightTheme = document.body.classList.toggle('light-theme');
        localStorage.setItem('nova-blog-theme', isLightTheme ? 'light' : 'dark');
    });
}

// Add estimated reading time to headings
function addReadingTimeToHeadings() {
    const headings = document.querySelectorAll('.post-content h2');
    headings.forEach(heading => {
        // Calculate reading time for section (from this heading to next heading)
        let wordCount = 0;
        let node = heading.nextElementSibling;
        
        while (node && !['H1', 'H2'].includes(node.tagName)) {
            if (node.textContent) {
                wordCount += node.textContent.trim().split(/\s+/).length;
            }
            node = node.nextElementSibling;
        }
        
        // Add reading time indicator if section is substantial
        if (wordCount > 50) {
            const readingTime = Math.ceil(wordCount / 200);
            const timeIndicator = document.createElement('span');
            timeIndicator.className = 'heading-reading-time';
            timeIndicator.innerHTML = `<i class="far fa-clock"></i> ${readingTime} min`;
            heading.appendChild(timeIndicator);
        }
    });
}

// Document ready - set up all page enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Set up theme toggle
    setupThemeToggle();
});

// Initialize the post
loadPost();
