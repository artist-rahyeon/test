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
        'common1': 'https://www.yes24.com/product/goods/169453293', // Grip 유형서 공통수학1
        'common2': 'https://www.yes24.com/product/goods/175958741', // Grip 유형서 공통수학2
        'algebra': 'https://www.yes24.com/product/goods/174267443'  // Grip 유형서 대수
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

// Custom Smooth Scroll Function
function smoothScrollTo(endY, duration) {
    const startY = window.scrollY;
    const distance = endY - startY;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function (easeInOutCubic)
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startY + (distance * ease));

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            isAutoScrolling = false; // Reset flag after animation
        }
    }

    requestAnimationFrame(animation);
}

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

    const vh = window.innerHeight;

    // Target 1: End of Workbook Text Animation (Text fully visible/shrunk)
    // Animation duration is 1.5vh.
    const target1 = subStickyContainer.offsetTop + (1.5 * vh);

    // Target 2: End of Hero Image Animation (Image fully visible/shrunk)
    const target2 = heroStickyContainer.offsetTop + (1.5 * vh);

    // Duration for slow scroll (ms)
    const scrollDuration = 2000;

    // Trigger 1: Top -> Target 1
    // Condition: User is at top (scrolled < 100px) and scrolls down a bit (> 10px from last stop?)
    // Simplified: If currentScrollY is small (> 50) and far from Target 1.
    if (currentScrollY > 50 && currentScrollY < target1 - 100) {
        isAutoScrolling = true;
        smoothScrollTo(target1, scrollDuration);
        return;
    }

    // Trigger 2: Target 1 -> Target 2
    // Condition: User has passed Target 1 (text visible) and scrolls down a bit more.
    // If currentScrollY is > Target 1 + 50 AND far from Target 2.
    if (currentScrollY > target1 + 50 && currentScrollY < target2 - 100) {
        isAutoScrolling = true;
        smoothScrollTo(target2, scrollDuration);
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
