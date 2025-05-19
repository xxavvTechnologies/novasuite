/**
 * Nova Suite Get Started Page JavaScript
 * Created: May 18, 2025
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize category tabs for app filtering
    initCategoryTabs();
    
    // Initialize FAQ accordion
    initFaqAccordion();
    
    // Initialize animation on scroll
    initScrollAnimations();
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
                    // Add animation class
                    card.classList.add('fade-in');
                    setTimeout(() => {
                        card.classList.remove('fade-in');
                    }, 500);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Initialize FAQ accordion functionality
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Check if this item is already active
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items first
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // If the clicked item wasn't active, make it active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    // Elements to animate on scroll
    const animatedElements = document.querySelectorAll('.step-card, .app-card, .faq-item, .section-header');
    
    // Observer options
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);
    
    // Observe each element
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // Add smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}
