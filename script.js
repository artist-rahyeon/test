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


// Reusable Scroll Animation Function (Apple-like Sticky + Shrink)
function applyStickyAnimation(containerSelector, targetSelector) {
    const container = document.querySelector(containerSelector);
    const target = document.querySelector(targetSelector);

    if (!container || !target) return;

    // 간단한 ease (애플처럼 초반은 천천히, 중반 가속, 끝에서 감속)
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    let ticking = false;

    const update = () => {
        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;

        // 컨테이너 안으로 들어온 거리 (컨테이너 top이 0을 지나 위로 올라갈수록 증가)
        const navH = document.querySelector('.global-nav')?.offsetHeight || 0;
        const scrolledInto = -(rect.top - navH);

        // 애니메이션이 진행될 스크롤 구간 길이(뷰포트 기준). 
        // 1.5vh ~ 2vh 구간 동안 애니메이션 완료, 그 이후는 정지 상태로 보여줌
        const duration = 1.5 * vh;

        // 0~1로 정규화
        let t = scrolledInto / duration;

        // Lock Logic: t가 1을 넘어가면 애니메이션 종료 상태로 고정
        if (t < 0) t = 0;
        if (t > 1) t = 1;

        // easing 적용
        const p = easeOutCubic(t);

        // 애플 스타일: 'Shrink-to-Fit' (큰 이미지 -> 화면에 맞게 축소)
        const startScale = 3.0;
        const endScale = 1.0;

        const scale = startScale + (endScale - startScale) * p;

        // opacity: 항상 1
        const opacity = 1;

        // Panning Effect (Top -> Center)
        // startScale이 3.0이면 이미지가 커져서 위아래가 잘림.
        // Top이 보이려면 이미지를 아래로 내려야 함 (translateY > 0).
        // 정확히 얼마나 내려야 Top이 보일까?
        // 이미지 높이가 대략 vh이고, scale이 3.0이면 실제 높이는 3vh.
        // 화면 높이는 1vh. 위아래로 1vh씩 잘림.
        // 따라서 1vh (window.innerHeight) 만큼 내리면 Top이 화면 상단에 옴.

        const startY = (startScale - 1) * vh / 2; // (3-1)/2 * vh = 100vh
        const endY = 0;
        const translateY = startY + (endY - startY) * p;

        target.style.opacity = opacity;
        target.style.transform = `translateY(${translateY}px) scale(${scale})`;

        ticking = false;
    };

    window.addEventListener(
        'scroll',
        () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        },
        { passive: true }
    );

    // 최초 1회 세팅(새로고침 직후 위치 반영)
    update();
}

// Apply animations
applyStickyAnimation('.hero-sticky-container', '#hero-showcase');
applyStickyAnimation('.sub-sticky-container', '#sub-showcase');



// Modal Logic
const modal = document.getElementById('purchase-modal');
const modalTitle = document.getElementById('modal-title');
const openModalBtns = document.querySelectorAll('.open-modal-btn');
const closeBtn = document.querySelector('.close-btn');

// Links Configuration
const bookLinks = {
    'concept': {
        'common1': 'https://www.yes24.com/product/goods/169453294',
        'common2': 'https://www.yes24.com/product/goods/175957529',
        'algebra': 'https://www.yes24.com/product/goods/174267441'
    },
    'type': {
        'common1': '#', // Placeholder for Type Book
        'common2': '#', // Placeholder for Type Book
        'algebra': '#'  // Placeholder for Type Book
    }
};

const linkCommon1 = document.getElementById('link-common1');
const linkCommon2 = document.getElementById('link-common2');
const linkAlgebra = document.getElementById('link-algebra');

if (modal && openModalBtns.length > 0) {
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const bookTitle = btn.getAttribute('data-book-title');
            const bookType = btn.getAttribute('data-book-type'); // 'concept' or 'type'

            // Set modal title depending on which book was clicked
            modalTitle.textContent = `${bookTitle} 구매하기`;

            // Update Links based on book type
            if (bookLinks[bookType]) {
                linkCommon1.href = bookLinks[bookType].common1;
                linkCommon2.href = bookLinks[bookType].common2;
                linkAlgebra.href = bookLinks[bookType].algebra;
            } else {
                // Fallback / Reset
                linkCommon1.href = '#';
                linkCommon2.href = '#';
                linkAlgebra.href = '#';
            }

            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

// Auto-Scroll Logic (Snap to Next Section)
let isAutoScrolling = false;
let lastScrollY = window.scrollY;

function handleAutoScroll() {
    if (isAutoScrolling) return;

    const currentScrollY = window.scrollY;
    const direction = currentScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = currentScrollY;

    // Only trigger on downward scroll
    if (direction !== 'down') return;

    const subStickyContainer = document.querySelector('.sub-sticky-container');
    const heroStickyContainer = document.querySelector('.hero-sticky-container');

    if (!subStickyContainer || !heroStickyContainer) return;

    const subRect = subStickyContainer.getBoundingClientRect();
    const heroRect = heroStickyContainer.getBoundingClientRect();
    const vh = window.innerHeight;
    const triggerDistance = 100; // px

    // 1. Initial Scroll -> Snap to Workbook Text
    // Logic: If user has scrolled past the very top but hasn't reached the workbook text fully
    // We want to snap when the user starts scrolling down from the top area.
    // However, the 'sub-sticky-container' is right after the hero-sticky (Text intro).
    // Wait, let's check index.html structure.
    // 1. .hero-sticky (Text: SEEN NOTHING...)
    // 2. .sub-sticky-container (Workbook Text)
    // 3. .hero-sticky-container (Main Image)

    // Scenario 1: Snap to Workbook Text
    // If we are at the top (scrollY < vh) and user scrolls down a bit.
    // The top section (.hero-sticky) is 100vh.
    // If user scrolls > 50px, snap to .sub-sticky-container top.

    if (currentScrollY > 50 && currentScrollY < vh - 100) {
        // Snap to Sub Sticky
        const targetTop = subStickyContainer.offsetTop;
        // Only snap if we are not already close
        if (Math.abs(currentScrollY - targetTop) > 50) {
            isAutoScrolling = true;
            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            setTimeout(() => { isAutoScrolling = false; }, 1000); // Debounce
            return;
        }
    }

    // Scenario 2: Snap to Hero Image
    // If we are within the workbook text section, and scroll down a bit.
    // .sub-sticky-container is 250vh tall.
    // Best moment to snap is probably after the animation finishes?
    // Or maybe just from the start of the next section?
    // User wants: "little scroll -> workbook", then "little scroll -> image".

    // Let's refine:
    // "Workbook Text" starts at offsetTop of .sub-sticky-container.
    // If user is at Workbook Text Start + small amount, snap to... wait.
    // Usually snap points are:
    // 1. Top -> Workbook Text Setup (Start of animation)
    // 2. Workbook Text -> Main Image Setup (Start of animation)

    // Let's try to snap to the Main Image container when user is somewhat past the Workbook start.
    // But Workbook text needs to stay pinned for a while.
    // Maybe user means "Start the animation automatically"?
    // The request says: "Automatically go down to data... text screen, then automatically go down to grip_main.png".
    // This sounds like skipping the "boring" scroll parts.

    // Let's implement a trigger that if you are in the "static" phase of the previous section, it snaps to the next.

    // Simpler approach for "Little Scroll":
    // 1. From Top (0): Scroll > 50px -> Go to .sub-sticky-container
    // 2. From .sub-sticky-container Start: Scroll > 50px (inside it) -> Go to .hero-sticky-container??
    // No, that would skip the text animation.
    // User likely means: "Make it easy to reach the start of the animation".

    // Let's implement:
    // 1. Top -> .sub-sticky-container (Start of Text Animation)
    // 2. End of Text Animation -> .hero-sticky-container (Start of Image Animation)

    // Calculation:
    // Text Animation Duration is approx 1.5vh (based on script).
    // .sub-sticky-container top is where animation starts.

    const subTop = subStickyContainer.offsetTop;
    const heroTop = heroStickyContainer.offsetTop;

    // Trigger 1: Top -> Workbook Text
    if (currentScrollY < subTop && currentScrollY > 50) {
        isAutoScrolling = true;
        window.scrollTo({ top: subTop, behavior: 'smooth' });
        setTimeout(() => { isAutoScrolling = false; }, 800);
        return;
    }

    // Trigger 2: Workbook Text -> Hero Image
    // If user has seen the text animation (scrolled past duration), snap to image?
    // Or just help them get to the image?
    // Let's say if they are past the text animation "active" phase.
    // The container is 250vh. Animation is 1.5vh (window height).
    // So 1.5 * window.innerHeight is the animation length.
    // Let's snap to the next section if they are comfortably past the animation start.

    // Adjust logic: If user is "done" with text (e.g. at 200vh into the container), snap to next?
    // Or maybe user implies "Scroll a little" = "Show me the next thing".
    // Let's allow manual scroll for the animation itself, but 'snap' to the start of the next container if we are close?

    // Let's try:
    // If currentScrollY is within [subTop + 100, heroTop - 100], and user stops scrolling?
    // Auto-scroll on 'scroll' event is tricky without "scrollend".

    // Re-reading user request: "Scroll a little -> automatically go down to text screen".
    // "Scroll a little more -> automatically go down to image".

    // This implies a "Snap Scroll" behavior.
    // Let's assume:
    // 1. Top Area -> Snap to Sub Sticky Top
    // 2. Sub Sticky Area (after some scroll) -> Snap to Hero Sticky Top

    // To avoid being annoying, only snap TO the start of sections.

    // Snap to Hero Image Container
    // If we are inside Sub Sticky, and closer to end than beginning? 
    // Or just if we scroll past a certain point.

    // Let's set a trigger point: 
    // If (scrollY > subTop + (1.5 * vh) + 100) -> Snap to heroTop?
    // This skips the "static pinned" phase.
    // If container is 250vh, and animation is 1.5vh (150vh).
    // Remaining 100vh is static.
    // If user scrolls into that static zone, snap to next section.

    const animationEnd = subTop + (1.5 * vh);
    if (currentScrollY > animationEnd && currentScrollY < heroTop - 50) {
        isAutoScrolling = true;
        window.scrollTo({ top: heroTop, behavior: 'smooth' });
        setTimeout(() => { isAutoScrolling = false; }, 800);
        return;
    }
}

// Throttle scroll event for performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            handleAutoScroll();
            scrollTimeout = null;
        }, 50); // Check every 50ms
    }
}, { passive: true });
