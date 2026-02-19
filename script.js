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