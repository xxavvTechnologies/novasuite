/**
 * Nova Suite Homepage JavaScript
 * Created: May 18, 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    // App category filtering
    initCategoryTabs();
    
    // Testimonials slider
    initTestimonialsSlider();
    
    // Tour modal functionality
    initTourModal();
    
    // Scroll animations
    initScrollAnimations();
    
    // Initialize new sections
    initIntegrations();
    initDashboardPreview();
    
    // Blog posts loading - delay slightly to ensure Firebase is initialized
    setTimeout(() => {
        loadBlogPreviews();
    }, 100);
});

/**
 * Initialize category tabs for app filtering
 */
function initCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const appCards = document.querySelectorAll('.app-card');
    
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const selectedCategory = tab.dataset.category;
            
            // Filter apps based on category
            appCards.forEach(card => {
                if (selectedCategory === 'all') {
                    card.style.display = 'flex';
                    return;
                }
                
                const cardCategories = card.dataset.categories.split(',');
                if (cardCategories.includes(selectedCategory)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Initialize testimonials slider
 */
function initTestimonialsSlider() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentSlide = 0;
    
    // Show first slide by default on mobile
    if (window.innerWidth <= 768) {
        updateSlider();
    }
    
    // Handle navigation dots
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
        });
    });
    
    // Auto advance slides every 8 seconds
    setInterval(() => {
        if (window.innerWidth <= 768) {
            currentSlide = (currentSlide + 1) % testimonialCards.length;
            updateSlider();
        }
    }, 8000);
    
    function updateSlider() {
        if (window.innerWidth <= 768) {
            // Mobile behavior - only show current slide
            testimonialCards.forEach((card, index) => {
                card.style.display = index === currentSlide ? 'flex' : 'none';
            });
        }
        
        // Update active dot
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Update slider layout on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            updateSlider();
        } else {
            // Restore all cards in desktop view
            testimonialCards.forEach(card => {
                card.style.display = 'flex';
            });
        }
    });
}

/**
 * Initialize tour modal functionality
 */
function initTourModal() {
    const tourButtons = document.querySelectorAll('.tour-button');
    const tourModal = document.getElementById('tour-modal');
    const closeButton = document.querySelector('.close-tour');
    const tourPlaceholder = document.querySelector('.tour-placeholder');
    
    // Open tour modal
    tourButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            tourModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
    
    // Close tour modal
    function closeTourModal() {
        tourModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    closeButton.addEventListener('click', closeTourModal);
    
    // Close modal when clicking outside content
    tourModal.addEventListener('click', (e) => {
        if (e.target === tourModal) {
            closeTourModal();
        }
    });
    
    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tourModal.style.display === 'flex') {
            closeTourModal();
        }
    });
    
    // Play video when placeholder is clicked
    tourPlaceholder.addEventListener('click', () => {
        const tourVideo = document.querySelector('.tour-video');
        
        // Replace placeholder with actual video embed
        tourVideo.innerHTML = `
            <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Nova Suite Tour" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
            </iframe>
        `;
    });
}

/**
 * Load blog post previews dynamically from Firebase
 */
async function loadBlogPreviews() {
    const blogPostsContainer = document.querySelector('.blog-grid');
    if (!blogPostsContainer) return;
    
    try {
        // Make sure Firebase has been initialized
        if (!window.db) {
            console.error('Firebase DB not available');
            loadFallbackPosts(blogPostsContainer);
            return;
        }
        
        // Import Firebase modules dynamically
        const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js');
        
        // Query the 3 most recent blog posts
        const postsQuery = query(
            collection(window.db, 'posts'),
            orderBy('date', 'desc'),
            limit(3)
        );
        
        // Clear loading placeholder
        blogPostsContainer.innerHTML = '';
        
        const snapshot = await getDocs(postsQuery);
        
        // If no posts found, use fallback
        if (snapshot.empty) {
            loadFallbackPosts(blogPostsContainer);
            return;
        }
        
        // Generate blog post preview cards
        snapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            
            const blogCard = document.createElement('a');
            blogCard.href = `blog/post.html?id=${postId}`;
            blogCard.className = 'blog-card';
            
            // Format the date
            const postDate = post.date ? new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'Recent';
            
            // Get category label
            const categoryLabels = {
                'general': 'General Updates',
                'feature': 'Feature Spotlight',
                'tips': 'Tips & Tricks',
                'news': 'Product News'
            };
            
            const category = categoryLabels[post.category] || 'Update';
            
            blogCard.innerHTML = `
                <div class="blog-image">
                    <img src="${post.featuredImage || ''}" alt="${post.title}" 
                         onerror="this.src='https://via.placeholder.com/350x200?text=Nova+Blog'">
                    <span class="blog-category">${category}</span>
                </div>
                <div class="blog-content">
                    <h3>${post.title}</h3>
                    <div class="blog-meta">
                        <span>${postDate}</span> • <span>${post.author || 'Nova Suite Team'}</span>
                    </div>
                    <p class="blog-excerpt">${post.excerpt || post.content?.substring(0, 150) + '...' || 'Read more about this update on our blog.'}</p>
                </div>
                <div class="blog-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
            `;
            
            blogPostsContainer.appendChild(blogCard);
        });
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        loadFallbackPosts(blogPostsContainer);
    }
}

/**
 * Load fallback post data if Firebase fails
 */
function loadFallbackPosts(container) {
    // Fallback posts if Firebase data isn't available
    const fallbackPosts = [
        {
            title: "Introducing Astro v3.1.0 with ModelA 8-Pro",
            date: "May 15, 2025",
            author: "Nova Team",
            excerpt: "We're excited to announce the release of Astro v3.1.0, now powered by our most advanced AI model yet: ModelA 8-Pro.",
            image: "images/astro-v3-demo-thumbnail.png",
            url: "blog/post.html?title=astro-v3-release"
        },
        {
            title: "Moving to React: Our Transformation Journey",
            date: "May 10, 2025",
            author: "Dev Team",
            excerpt: "Why we're transitioning Nova Suite to React architecture and what this means for our users.",
            image: "images/react-transformation.jpg",
            url: "transformation.html"
        },
        {
            title: "Building a More Collaborative Workspace",
            date: "May 3, 2025",
            author: "Product Team",
            excerpt: "Preview our upcoming Workspace app and how it will transform project management for teams.",
            image: "images/workspace-preview.jpg",
            url: "blog/post.html?title=workspace-preview"
        }
    ];
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Generate fallback blog post cards
    fallbackPosts.forEach(post => {
        const blogCard = document.createElement('a');
        blogCard.href = post.url;
        blogCard.className = 'blog-card';
        
        blogCard.innerHTML = `
            <div class="blog-image">
                <img src="${post.image}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/350x200?text=Nova+Blog'">
                <span class="blog-category">Feature Spotlight</span>
            </div>
            <div class="blog-content">
                <h3>${post.title}</h3>
                <div class="blog-meta">
                    <span>${post.date}</span> • <span>${post.author}</span>
                </div>
                <p class="blog-excerpt">${post.excerpt}</p>
            </div>
            <div class="blog-arrow">
                <i class="fas fa-arrow-right"></i>
            </div>
        `;
        
        container.appendChild(blogCard);
    });
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    // Elements to animate when they come into view
    const animateElements = document.querySelectorAll('.feature-card, .app-card, .spotlight-feature, .id-feature');
    
    // Options for the Intersection Observer
    const options = {
        root: null, // use the viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };
    
    // Create observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add fade-in-up animation class
                entry.target.classList.add('fade-in-up');
                // Stop observing the element once it's animated
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    // Start observing elements
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Skip tour modal link
            if (this.classList.contains('tour-button')) return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for header height
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Add CSS styling for blog cards that's added dynamically
 */
function addBlogCardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .blog-card {
            background: rgba(30, 30, 50, 0.3);
            border-radius: 12px;
            overflow: hidden;
            text-decoration: none;
            color: var(--text);
            display: flex;
            flex-direction: column;
            height: 100%;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .blog-card:hover {
            transform: translateY(-5px);
            background: rgba(30, 30, 50, 0.5);
            border-color: var(--nova-primary);
        }
        
        .blog-image {
            width: 100%;
            height: 200px;
            overflow: hidden;
        }
        
        .blog-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        
        .blog-card:hover .blog-image img {
            transform: scale(1.05);
        }
        
        .blog-content {
            padding: 1.5rem;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .blog-card h3 {
            margin-bottom: 0.75rem;
            font-size: 1.2rem;
            line-height: 1.4;
        }
        
        .blog-meta {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }
        
        .blog-excerpt {
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.6;
        }
        
        .blog-arrow {
            margin-top: auto;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: flex-end;
            color: var(--nova-primary);
            background: rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .blog-card:hover .blog-arrow {
            background: rgba(0, 46, 255, 0.1);
        }
        
        .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Initialize integration logo hover effects
 */
function initIntegrations() {
    const integrationLogos = document.querySelectorAll('.integration-logo:not(.coming-soon)');
    
    integrationLogos.forEach(logo => {
        logo.addEventListener('mouseenter', () => {
            // Add subtle pulse effect on hover
            logo.style.boxShadow = `0 0 20px ${getRandomColor(0.5)}`;
        });
        
        logo.addEventListener('mouseleave', () => {
            // Remove effect on mouse leave
            logo.style.boxShadow = '';
        });
    });
    
    // Helper function to generate random colors for integration logos
    function getRandomColor(opacity) {
        const colors = [
            `rgba(0, 46, 255, ${opacity})`, // Nova primary
            `rgba(158, 0, 255, ${opacity})`, // Astro primary
            `rgba(255, 191, 0, ${opacity})` // Nova secondary
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * Initialize dashboard preview interactions
 */
function initDashboardPreview() {
    // Simulate a realistic dashboard experience with dynamic content
    const dashboardUI = document.querySelector('.dashboard-floating-ui');
    if (!dashboardUI) return;
    
    // Update greeting based on time of day
    const greetingElement = document.querySelector('.dashboard-greeting');
    if (greetingElement) {
        const currentHour = new Date().getHours();
        let greeting = 'Good morning';
        
        if (currentHour >= 12 && currentHour < 18) {
            greeting = 'Good afternoon';
        } else if (currentHour >= 18) {
            greeting = 'Good evening';
        }
        
        greetingElement.textContent = `${greeting}, Sam`;
    }
    
    // Update date
    const dateElement = document.querySelector('.dashboard-date');
    if (dateElement) {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
    
    // Add click interaction for dashboard buttons
    const dashboardButtons = document.querySelectorAll('.dashboard-button, .widget-action');
    dashboardButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            button.classList.add('button-clicked');
            
            // Remove class after animation completes
            setTimeout(() => {
                button.classList.remove('button-clicked');
            }, 300);
        });
    });
    
    // Add some animated content to widgets
    addDashboardWidgetStyles();
    populateWidgetContent();
}

/**
 * Add CSS styling for dashboard widget animations
 */
function addDashboardWidgetStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .button-clicked {
            transform: scale(0.9);
            background: rgba(255, 255, 255, 0.2);
        }
        
        .widget-content {
            position: relative;
        }
        
        .widget-item {
            padding: 0.8rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .widget-item:last-child {
            border-bottom: none;
        }
        
        .widget-item-icon {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
        
        .widget-item-text {
            font-size: 0.85rem;
            flex: 1;
        }
        
        .widget-item-meta {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }
        
        .calendar-event {
            display: flex;
            padding: 0.6rem 0.8rem;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .event-time {
            font-size: 0.75rem;
            font-weight: 500;
            margin-right: 0.75rem;
            color: var(--nova-primary);
        }
        
        .event-info {
            flex: 1;
        }
        
        .event-title {
            font-size: 0.85rem;
            margin-bottom: 0.2rem;
        }
        
        .event-details {
            font-size: 0.75rem;
            color: var(--text-secondary);
        }
        
        .astro-suggestion {
            padding: 0.8rem;
            font-size: 0.85rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .astro-prompt {
            background: rgba(158, 0, 255, 0.15);
            border-radius: 6px;
            padding: 0.6rem;
            margin-top: 0.5rem;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }
        
        .astro-prompt i {
            color: var(--astro-primary);
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Populate dashboard widget content with sample data
 */
function populateWidgetContent() {
    // Recent Documents Widget
    const recentDocsWidget = document.querySelector('.dashboard-widget.recent-docs .widget-content');
    if (recentDocsWidget) {
        recentDocsWidget.innerHTML = `
            <div class="widget-item">
                <div class="widget-item-icon" style="background: #4285f4; color: #fff;">D</div>
                <div class="widget-item-text">Q2 Marketing Strategy</div>
                <div class="widget-item-meta">2h ago</div>
            </div>
            <div class="widget-item">
                <div class="widget-item-icon" style="background: #34a853; color: #fff;">S</div>
                <div class="widget-item-text">Product Launch Timeline</div>
                <div class="widget-item-meta">Yesterday</div>
            </div>
            <div class="widget-item">
                <div class="widget-item-icon" style="background: #ea4335; color: #fff;">P</div>
                <div class="widget-item-text">Team Presentation</div>
                <div class="widget-item-meta">May 16</div>
            </div>
        `;
    }
    
    // Calendar Widget
    const calendarWidget = document.querySelector('.dashboard-widget.calendar .widget-content');
    if (calendarWidget) {
        calendarWidget.innerHTML = `
            <div style="padding: 0.8rem;">
                <div class="calendar-event">
                    <div class="event-time">10:00 AM</div>
                    <div class="event-info">
                        <div class="event-title">Team Standup</div>
                        <div class="event-details">Comm Meeting Room 3</div>
                    </div>
                </div>
                <div class="calendar-event">
                    <div class="event-time">2:30 PM</div>
                    <div class="event-info">
                        <div class="event-title">Client Presentation</div>
                        <div class="event-details">External Zoom Link</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Astro Widget
    const astroWidget = document.querySelector('.dashboard-widget.astro .widget-content');
    if (astroWidget) {
        astroWidget.innerHTML = `
            <div class="astro-suggestion">
                Based on your recent work, you might want to:
                <div class="astro-prompt">
                    <i class="fas fa-robot"></i>
                    <span>Generate Q2 performance summary from marketing data</span>
                </div>
            </div>
            <div class="astro-suggestion">
                You have similar content across multiple documents:
                <div class="astro-prompt">
                    <i class="fas fa-robot"></i>
                    <span>Consolidate product descriptions from 3 documents</span>
                </div>
            </div>
        `;
        
        // Add hover effect to Astro prompts
        const astroPrompts = document.querySelectorAll('.astro-prompt');
        astroPrompts.forEach(prompt => {
            prompt.addEventListener('mouseenter', () => {
                prompt.style.background = 'rgba(158, 0, 255, 0.25)';
            });
            
            prompt.addEventListener('mouseleave', () => {
                prompt.style.background = 'rgba(158, 0, 255, 0.15)';
            });
            
            prompt.addEventListener('click', () => {
                prompt.innerHTML = '<i class="fas fa-check-circle"></i><span>Starting this task in Astro...</span>';
                prompt.style.background = 'rgba(158, 0, 255, 0.3)';
                setTimeout(() => {
                    prompt.innerHTML = '<i class="fas fa-robot"></i><span>Task started in Astro</span>';
                }, 1500);
            });
        });
    }
}

// Add blog card styles when the document is loaded
document.addEventListener('DOMContentLoaded', addBlogCardStyles);
