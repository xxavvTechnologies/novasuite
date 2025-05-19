// Transformation Page JavaScript

// Countdown to Migration Start
document.addEventListener('DOMContentLoaded', function() {
    // Set the date for migration start - May 20, 2025
    const migrationStartDate = new Date('May 20, 2025 00:00:00').getTime();
    
    // Update the countdown every second
    const countdownTimer = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Calculate the time remaining
        const timeRemaining = migrationStartDate - now;
        
        // Calculate days, hours, minutes and seconds
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        // Display the countdown
        document.getElementById('days-counter').innerHTML = days;
        document.getElementById('hours-counter').innerHTML = hours;
        document.getElementById('minutes-counter').innerHTML = minutes;
        document.getElementById('seconds-counter').innerHTML = seconds;
        
        // If countdown is over, display a message
        if (timeRemaining < 0) {
            clearInterval(countdownTimer);
            document.getElementById('days-counter').innerHTML = '0';
            document.getElementById('hours-counter').innerHTML = '0';
            document.getElementById('minutes-counter').innerHTML = '0';
            document.getElementById('seconds-counter').innerHTML = '0';
            
            document.querySelector('.countdown-caption').innerHTML = 'Migration In Progress!';
        }
    }, 1000);

    // Animate timeline items on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => {
        item.style.opacity = 0;
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s ease-out';
        observer.observe(item);
    });
    
    // Smooth scroll to anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
