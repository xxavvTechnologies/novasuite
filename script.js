// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, {
    threshold: 0.1
});

// Observe all feature cards and showcase items
document.querySelectorAll('.feature-card, .showcase-item').forEach((el) => {
    observer.observe(el);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Parallax effect for gradient background
window.addEventListener('scroll', () => {
    const gradient = document.querySelector('.gradient-bg');
    const scrolled = window.pageYOffset;
    gradient.style.transform = `translateY(${scrolled * 0.5}px)`;
});
