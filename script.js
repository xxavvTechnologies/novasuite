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

// Add event handler for demo video click
document.addEventListener('DOMContentLoaded', function() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', function() {
            // Replace placeholder with actual embedded video
            const videoContainer = document.querySelector('.video-container');
            videoContainer.innerHTML = `
                <div class="responsive-video">
                    <iframe width="100%" height="100%" 
                        src="https://www.youtube-nocookie.com/embed/demo-video-id?autoplay=1" 
                        title="Astro v3.1.0 Demo" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <p class="video-caption">Watch our product team demonstrate the powerful new features in Astro v3.1.0</p>
            `;
            
            // Add styling for responsive video
            const style = document.createElement('style');
            style.textContent = `
                .responsive-video {
                    position: relative;
                    width: 100%;
                    height: 0;
                    padding-bottom: 56.25%;
                    overflow: hidden;
                    border-radius: 12px;
                }
                .responsive-video iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
            `;
            document.head.appendChild(style);
        });
    }
});
