// Intersection Observer for Fade-up animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: unobserve if you want it to animate only once
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
});


// Scroll Reveal Animation for Hero Image
const heroStickyContainer = document.querySelector('.hero-sticky-container');
const heroShowcase = document.querySelector('#hero-showcase');

if (heroStickyContainer && heroShowcase) {
    window.addEventListener('scroll', () => {
        const containerRect = heroStickyContainer.getBoundingClientRect();
        const containerTop = containerRect.top;
        const windowHeight = window.innerHeight;

        // Calculate progress: 0 when container enters viewport, 1 when it leaves/finishes
        // specialized for sticky: we want animation to happen as we scroll INTO the sticky part.

        // Start animation when container top hits 0 (or slightly before)
        // The container is 300vh. Sticky part is 100vh. 
        // We want the image to be fully visible after scrolling about 100vh into the container.

        // Distance scrolled FROM the top of the container
        const scrolled = -containerTop;

        // Normalize progress: 0 to 1 over the first windowHeight (viewport height) of scrolling
        // Adjust divider to control speed. windowHeight means 100vh scroll completes animation.
        let progress = scrolled / (0.1 * windowHeight);

        // Clamp progress
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        // Map progress to properties
        // Opacity: 0 -> 1
        const opacity = 4 * progress + 0.1;

        // Scale: 0.9 -> 1.0
        const scale = 0.9 + (0.1 * progress);

        // Apply styles
        heroShowcase.style.opacity = opacity;
        heroShowcase.style.transform = `scale(${scale})`;
    });
}