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
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('./components/header.html', 'header-component');
    loadComponent('./components/footer.html', 'footer-component');
});
