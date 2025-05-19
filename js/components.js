// Add path resolution helper
function getComponentPath(path) {
    // Get current page directory depth
    const pathDepth = window.location.pathname.split('/').length - 2;
    const prefix = pathDepth > 0 ? '../'.repeat(pathDepth) : './';
    return prefix + path;
}

// Update component loading function
async function loadComponent(path, targetId) {
    try {
        const response = await fetch(getComponentPath(path));
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
        
        // Initialize mobile menu after header loads
        if (targetId === 'header-component') {
            initMobileMenu();
        }
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    const mobileBackdrop = document.querySelector('.mobile-backdrop');
    
    if (menuToggle) {
        // Toggle menu when hamburger is clicked
        menuToggle.addEventListener('click', () => {
            // Toggle the mobile menu
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
        
        // Handle submenu toggles on mobile
        const submenuToggles = document.querySelectorAll('.submenu-toggle');
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.closest('.has-submenu');
                parent.classList.toggle('submenu-active');
            });
        });
        
        // Close menu when clicking on a link
        const mobileNavLinks = navLinks.querySelectorAll('a:not(.has-submenu > a)');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking on backdrop
        if (mobileBackdrop) {
            mobileBackdrop.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            });
        }
        
        // Add close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('./components/header.html', 'header-component');
    loadComponent('./components/footer.html', 'footer-component');
});
