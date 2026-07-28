



window.addEventListener('load', () => {
    hideLoader();
});

// 네트워크 지연으로 로딩이 너무 길어질 때를 대비한 안전장치 (예: 최대 4초)
const fallbackTimer = setTimeout(() => {
    hideLoader();
}, 4000);

function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader && !loader.classList.contains('is-hidden')) {
        loader.classList.add('is-hidden');
        clearTimeout(fallbackTimer);
    }
}








// =========================================================================================================
// sec01 02 통합



/* ════════════════════════════════════════════════════════════════
   SEC01 통합 환경 설정 (원하는 수치 및 소스 경로를 변경하세요)
════════════════════════════════════════════════════════════════ */
const SEC01_CONFIG = {
  breakpoint: 1024, // PC / 모바일 분기 기준px

  // PC 설정 (1024px 이상)
  desktop: {
    videoSrc: 'https://richdivine-vcc.com/static2026/sec01_vid1.mp4',
    videoPoster: 'https://richdivine-vcc.com/static2026/sec01_vid1_poster.jpg',
    videoScrubHeight: 400, // 1차 스크롤 길이 (vh 단위, 예: 400vh = 화면 높이의 4배)
    cardsScrubHeight: 400, // 2차 스크롤 길이 (vh 단위)
    bgImage: 'https://richdivine-vcc.com/static2026/sec02_back.png',
    cards: [
      'https://richdivine-vcc.com/static2026/sec02_card1_rr.png',
      'https://richdivine-vcc.com/static2026/sec02_card2_rr.png',
      'https://richdivine-vcc.com/static2026/sec02_card3_rr.png'
    ]
  },

  // 모바일 설정 (1024px 미만)
  mobile: {
    videoSrc: 'https://richdivine-vcc.com/static2026/sec01_vid2.mp4', // 별도 모바일용 세로 영상이 있다면 변경 가능 (없으면 원본 지정)
    videoPoster: 'https://richdivine-vcc.com/static2026/sec01_vid2_poster.jpg',
    videoScrubHeight: 350,
    cardsScrubHeight: 450,
    bgImage: 'https://richdivine-vcc.com/static2026/sec02_back.png',
    cards: [
      'https://richdivine-vcc.com/static2026/sec02_card1_rr.png',
      'https://richdivine-vcc.com/static2026/sec02_card2_rr.png',
      'https://richdivine-vcc.com/static2026/sec02_card3_rr.png'
    ]
  },

  // 1차 스크롤 영상 타이밍 설정 (0.0 = 섹션 시작, 1.0 = 섹션 끝)
  videoTimeline: {
    // 첫 번째 텍스트 (VVIP CONFERENCE)
    text1: { inStart: 0.0, inEnd: 0.0, outStart: 0.2, outEnd: 0.3 },
    // 두 번째 텍스트
    text2: { inStart: 0.32, inEnd: 0.5, outStart: 0.6, outEnd: 0.85 }
  }
};

/* ════════════════════════════════════════════════════════════════
   SEC01 스크립트 로직 (수정 불필요)
════════════════════════════════════════════════════════════════ */
(function() {
  // DOM Elements
  const videoSection = document.getElementById('sec01_videoSection');
  const videoEl = document.getElementById('sec01_videoEl');
  const vidText1 = document.getElementById('sec01_vidText1');
  const vidText2 = document.getElementById('sec01_vidText2');

  const cardsSection = document.getElementById('sec01_cardsSection');
  const bgLayer = document.getElementById('sec01_bgLayer');
  const card1 = document.getElementById('sec01_card1');
  const card2 = document.getElementById('sec01_card2');
  const card3 = document.getElementById('sec01_card3');
  const finalText = document.getElementById('sec01_finalText');

  // State Variables
  let isDesktop = window.innerWidth >= SEC01_CONFIG.breakpoint;
  let currentConfig = isDesktop ? SEC01_CONFIG.desktop : SEC01_CONFIG.mobile;
  
  let vidSecTop = 0, vidSecHeight = 0, vidScrubMax = 0;
  let cardSecTop = 0, cardSecHeight = 0, cardScrubMax = 0;
  let ticking = false;
  let lastVideoTime = -1;

  // Clamp 유틸리티
  function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }
  
  // 보간 유틸리티 (0~1)
  function normalize(val, min, max) { return clamp((val - min) / (max - min), 0, 1); }

  // 환경 초기화 및 리사이즈
  function initConfig() {
    const newIsDesktop = window.innerWidth >= SEC01_CONFIG.breakpoint;
    const isSwitched = newIsDesktop !== isDesktop || !videoEl.src;
    isDesktop = newIsDesktop;
    currentConfig = isDesktop ? SEC01_CONFIG.desktop : SEC01_CONFIG.mobile;

    // 높이값 반영
    videoSection.style.height = currentConfig.videoScrubHeight + 'vh';
    cardsSection.style.height = currentConfig.cardsScrubHeight + 'vh';

    // 소스 적용 (전환 시에만)
    if (isSwitched) {
      videoEl.src = currentConfig.videoSrc;
      videoEl.poster = currentConfig.videoPoster;
      videoEl.load();

      bgLayer.style.backgroundImage = `url('${currentConfig.bgImage}')`;
      card1.style.backgroundImage = `url('${currentConfig.cards[0]}')`;
      card2.style.backgroundImage = `url('${currentConfig.cards[1]}')`;
      card3.style.backgroundImage = `url('${currentConfig.cards[2]}')`;
    }

    recalcLayout();
  }

  // 레이아웃 캐시 계산
  function recalcLayout() {
    const vpH = window.innerHeight;
    vidSecTop = videoSection.offsetTop;
    vidSecHeight = videoSection.offsetHeight;
    vidScrubMax = vidSecHeight - vpH;

    cardSecTop = cardsSection.offsetTop;
    cardSecHeight = cardsSection.offsetHeight;
    cardScrubMax = cardSecHeight - vpH;
  }

  // ── 1차 스크롤 업데이트 (비디오 & 텍스트) ──
  function updateVideoSection(scrollY) {
    if (vidScrubMax <= 0) return;

    const progress = clamp((scrollY - vidSecTop) / vidScrubMax, 0, 1);

    // 1) 비디오 scrub 시간 업데이트
    if (videoEl.duration) {
      const targetTime = videoEl.duration * progress;
      if (!videoEl.seeking && Math.abs(targetTime - lastVideoTime) > 0.04) {
        lastVideoTime = targetTime;
        videoEl.currentTime = targetTime;
      }
    }

    // 2) 텍스트 1 투명도/위치 제어
    const t1Config = SEC01_CONFIG.videoTimeline.text1;
    let t1Opacity = 0;
    if (progress <= t1Config.outStart) {
      t1Opacity = normalize(progress, t1Config.inStart, t1Config.inEnd);
    } else {
      t1Opacity = 1 - normalize(progress, t1Config.outStart, t1Config.outEnd);
    }
    vidText1.style.opacity = t1Opacity;
    vidText1.style.transform = `translateY(${(1 - t1Opacity) * -20}px)`;

    // 3) 텍스트 2 투명도/위치 제어
    const t2Config = SEC01_CONFIG.videoTimeline.text2;
    let t2Opacity = 0;
    if (progress <= t2Config.outStart) {
      t2Opacity = normalize(progress, t2Config.inStart, t2Config.inEnd);
    } else {
      t2Opacity = 1 - normalize(progress, t2Config.outStart, t2Config.outEnd);
    }
    vidText2.style.opacity = t2Opacity;
    vidText2.style.transform = `translateY(${(1 - t2Opacity) * 20}px)`;
  }

  // ── 2차 스크롤 업데이트 (카드 & 배경 & 텍스트) ──
  function updateCardsSection(scrollY) {
    if (cardScrubMax <= 0) return;

    const rawProgress = (scrollY - cardSecTop) / cardScrubMax;
    const progress = clamp(rawProgress, 0, 1);

    if (isDesktop) {
      // ════════════════════════════════════════
      // PC 모드 (1024px 이상)
      // ════════════════════════════════════════
      // 카드 등장 구간 (0.0 ~ 0.5)
      const pC1 = normalize(progress, 0.0, 0.15);
      const pC2 = normalize(progress, 0.15, 0.3);
      const pC3 = normalize(progress, 0.3, 0.45);

      // 배경 이미지 페이드인 (카드2 보일 때 시작)
      const pBg = normalize(progress, 0.15, 0.45);
      bgLayer.style.opacity = pBg;

      // 카드 전체 퇴장 구간 (0.55 ~ 0.68)
      const pCardsFadeOut = 1 - normalize(progress, 0.55, 0.68);

      // 카드 1, 2, 3 스타일 적용
      card1.style.opacity = pC1 * pCardsFadeOut;
      card1.style.transform = `scale(${0.85 + pC1 * 0.15})`;

      card2.style.opacity = pC2 * pCardsFadeOut;
      card2.style.transform = `scale(${0.85 + pC2 * 0.15})`;

      card3.style.opacity = pC3 * pCardsFadeOut;
      card3.style.transform = `scale(${0.85 + pC3 * 0.15})`;

      // 카드 컨테이너 초기화
      card1.style.filter = 'none'; card2.style.filter = 'none'; card3.style.filter = 'none';

      // 최종 텍스트 페이드인 (0.65 ~ 0.78) 및 위로 이동하며 페이드아웃 (0.88 ~ 1.0)
      let textOpacity = 0;
      let textY = 0;

      if (progress <= 0.85) {
        textOpacity = normalize(progress, 0.65, 0.78);
        textY = (1 - textOpacity) * 30;
      } else {
        const pTextOut = normalize(progress, 0.85, 0.98);
        textOpacity = 1 - pTextOut;
        textY = -pTextOut * 40; // 위로 살짝 이동
      }

      finalText.style.opacity = textOpacity;
      finalText.style.transform = `translateY(${textY}px)`;

    } else {
      // ════════════════════════════════════════
      // 모바일 모드 (1024px 미만 - 위치 기준점 보정 완료)
      // ════════════════════════════════════════
      
      // --- 카드 1 타임라인 ---
      // 0.0 ~ 0.10: 오른쪽(+100vw) -> 정중앙(0vw) 진입
      // 0.10 ~ 0.18: 정중앙에서 1.3배 확대 상태로 정지 (이용자가 보는 구간)
      // 0.18 ~ 0.26: 1.0배로 작아지며 왼쪽(-28vw)으로 이동
      const pC1_in = normalize(progress, 0.0, 0.10);
      const pC1_out = normalize(progress, 0.18, 0.26);

      const c1X = (1 - pC1_in) * 100 - (pC1_out * 28); // X축 offset (vw)
      const c1Scale = (pC1_in * 1.3) - (pC1_out * 0.3); // Scale: 0 -> 1.3 -> 1.0

      // --- 카드 2 타임라인 ---
      // 0.20 ~ 0.30: 오른쪽 -> 정중앙 진입
      // 0.30 ~ 0.38: 정중앙에서 1.3배 정지
      // 0.38 ~ 0.46: 1.0배로 작아지며 왼쪽(-14vw)으로 이동
      const pC2_in = normalize(progress, 0.20, 0.30);
      const pC2_out = normalize(progress, 0.38, 0.46);

      const c2X = (1 - pC2_in) * 100 - (pC2_out * 14);
      const c2Scale = (pC2_in * 1.3) - (pC2_out * 0.3);

      // --- 카드 3 타임라인 ---
      // 0.40 ~ 0.50: 오른쪽 -> 정중앙 진입 (1.3배)
      // 0.50 ~ 0.58: 정중앙에서 1.3배 정지 유지
      const pC3_in = normalize(progress, 0.40, 0.50);
      const c3X = (1 - pC3_in) * 100;
      const c3Scale = pC3_in * 1.3;

      // 배경 등장 (카드 2 보이기 시작할 때)
      const pBg = normalize(progress, 0.22, 0.42);
      bgLayer.style.opacity = pBg;

      // 카드 전체 사라짐 (0.58 ~ 0.68)
      const pCardsFadeOut = 1 - normalize(progress, 0.58, 0.68);
      const blurVal = (1 - pCardsFadeOut) * 12;

      // [핵심] translate(-50%, -50%)로 카드의 중심점을 요소의 정중앙에 고정
      card1.style.opacity = pC1_in * pCardsFadeOut;
      card1.style.transform = `translate(-50%, -50%) translate3d(${c1X}vw, 0px, 0px) scale(${c1Scale})`;
      card1.style.filter = `blur(${blurVal}px)`;

      card2.style.opacity = pC2_in * pCardsFadeOut;
      card2.style.transform = `translate(-50%, -50%) translate3d(${c2X}vw, 0px, 0px) scale(${c2Scale})`;
      card2.style.filter = `blur(${blurVal}px)`;

      card3.style.opacity = pC3_in * pCardsFadeOut;
      card3.style.transform = `translate(-50%, -50%) translate3d(${c3X}vw, 0px, 0px) scale(${c3Scale})`;
      card3.style.filter = `blur(${blurVal}px)`;

      // 최종 텍스트 페이드인 (0.68 ~ 0.80) / 위로 떠오르며 페이드아웃 (0.88 ~ 0.98)
      let textOpacity = 0;
      let textY = 0;

      if (progress <= 0.85) {
        textOpacity = normalize(progress, 0.68, 0.80);
        textY = (1 - textOpacity) * 30;
      } else {
        const pTextOut = normalize(progress, 0.88, 0.98);
        textOpacity = 1 - pTextOut;
        textY = -pTextOut * 40;
      }

      finalText.style.opacity = textOpacity;
      finalText.style.transform = `translateY(${textY}px)`;
    }
  }
  // 메인 스크롤 루프 (rAF Throttling)
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        updateVideoSection(scrollY);
        updateCardsSection(scrollY);
        ticking = false;
      });
      ticking = true;
    }
  }

  // 이벤트 리스너 등록
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    initConfig();
    onScroll();
  });

  // 초기화 실행
  initConfig();
  onScroll();

})();



// =========================================================================================================
// sec03 관련
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('sec03_video');
    if (!video) return;

    const BREAKPOINTS = [768];
    let currentVideoIndex = null;
    let hasPlayed = false;

    // 1. 화면 폭에 맞는 영상 번호 판별
    function getTargetIndex() {
        return window.innerWidth >= BREAKPOINTS[0] ? 1 : 2;
    }

    // 2. 적합한 영상/포스터 로드
    function loadAppropriateVideo() {
        const targetIndex = getTargetIndex();
        if (currentVideoIndex === targetIndex) return;
        currentVideoIndex = targetIndex;

        const poster = video.getAttribute(`data-poster-${targetIndex}`);
        const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
        const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);

        if (poster) video.poster = poster;

        // 기존 source 비우기
        video.innerHTML = '';

        if (webmSrc) {
            const sourceWebm = document.createElement('source');
            sourceWebm.src = webmSrc;
            sourceWebm.type = 'video/webm';
            video.appendChild(sourceWebm);
        }
        if (mp4Src) {
            const sourceMp4 = document.createElement('source');
            sourceMp4.src = mp4Src;
            sourceMp4.type = 'video/mp4';
            video.appendChild(sourceMp4);
        }

        video.load();
        
        // 이미 재생 시작된 상태에서 리사이즈되었다면 계속 재생
        if (hasPlayed) {
            video.play().catch(() => {});
        }
    }

    // 최초 1회 실행 및 Resize 이벤트 (디바운스)
    loadAppropriateVideo();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadAppropriateVideo();
        }, 250);
    });

    // 3. IntersectionObserver로 스크롤 감지 최적화 (scroll 이벤트 제거)
    // rootMargin: '0px 0px -50% 0px' -> 화면 하단에서 50% 지점에 비디오가 들어왔을 때 트리거
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            hasPlayed = true;
                            // 재생 성공 시 관찰 종료 (메인 스레드 부담 0)
                            obs.unobserve(video);
                        })
                        .catch((error) => {
                            console.warn('자동 재생 정책으로 인해 대기 중:', error);
                        });
                }
            }
        });
    }, observerOptions);

    observer.observe(video);
});







// =========================================================================================================
// sec04 관련
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('sec04_video');
    if (!video) return;

    const BREAKPOINTS = [768];
    let currentVideoIndex = null;
    let hasPlayed = false;

    // 1. 화면 폭 기준 비디오 인덱스 계산
    function getTargetIndex() {
        return window.innerWidth >= BREAKPOINTS[0] ? 1 : 2;
    }

    // 2. 비디오 및 포스터 세팅
    function loadAppropriateVideo() {
        const targetIndex = getTargetIndex();
        if (currentVideoIndex === targetIndex) return;
        currentVideoIndex = targetIndex;

        const poster = video.getAttribute(`data-poster-${targetIndex}`);
        const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
        const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);

        if (poster) video.poster = poster;

        video.innerHTML = '';

        if (webmSrc) {
            const sourceWebm = document.createElement('source');
            sourceWebm.src = webmSrc;
            sourceWebm.type = 'video/webm';
            video.appendChild(sourceWebm);
        }
        if (mp4Src) {
            const sourceMp4 = document.createElement('source');
            sourceMp4.src = mp4Src;
            sourceMp4.type = 'video/mp4';
            video.appendChild(sourceMp4);
        }

        video.load();

        if (hasPlayed) {
            video.play().catch(() => {});
        }
    }

    // 최초 로드 및 화면 리사이즈 제어 (디바운스 250ms)
    loadAppropriateVideo();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadAppropriateVideo();
        }, 250);
    });

    // 3. IntersectionObserver로 메인 스레드 부하 0% 스크롤 감지
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50% 0px', // 화면 하단에서 50% 지점에 들어올 때 실행
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPlayed) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            hasPlayed = true;
                            // 재생 성공 즉시 감지 종료 (성능 최적화)
                            obs.unobserve(video);
                        })
                        .catch((error) => {
                            console.warn('sec04 자동 재생 대기 중:', error);
                        });
                }
            }
        });
    }, observerOptions);

    observer.observe(video);
});






// =========================================================================================================
// sec06 관련
document.addEventListener('DOMContentLoaded', () => {
    const sec06Videos = document.querySelectorAll('.sec06_video');
    if (!sec06Videos.length) return;

    const isMobile = window.innerWidth <= 768;

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
    
            if (entry.isIntersecting) {
                // 1. 소스가 없으면 동적으로 할당
                if (!video.src) {
                    const src = isMobile ? video.dataset.srcMo : video.dataset.srcPc;
                    if (src) video.src = src;
                }
    
                // 2. 재생 시도
                video.play().catch(() => {});
            } else {
                // 3. 화면 밖으로 벗어나면 일시정지
                if (video.src) {
                    video.pause();
                }
            }
        });
    }, {
        // threshold: 0.15, // 제거하거나 아주 낮게 설정
        rootMargin: '300px 0px 300px 0px' // ★ 핵심: 화면 위아래 300px 전부터 미리 인식 및 로드
    });

    sec06Videos.forEach((video) => videoObserver.observe(video));
});






// =========================================================================================================
// sec09 관련

document.addEventListener('DOMContentLoaded', () => {
    const streamLines = document.querySelectorAll('.sec09_line');

    if (streamLines.length && 'IntersectionObserver' in window) {
        const streamObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-active'); // 화면에 보이면 애니메이션 재생
                } else {
                    entry.target.classList.remove('is-active'); // 화면 벗어나면 애니메이션 정지
                }
            });
        }, {
            threshold: 0.05
        });

        streamLines.forEach((line) => streamObserver.observe(line));
    }
});












// =========================================================================================================
// sec12, 13 관련


document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================================================
    // sec12 위치안내 탭 제어
    // =========================================================================================================
    const switch1 = document.getElementById('sec12_switch1');
    const switch2 = document.getElementById('sec12_switch2');
    const img1 = document.getElementById('sec12_img1');
    const img2 = document.getElementById('sec12_img2');

    if (switch1 && switch2 && img1 && img2) {
        switch1.addEventListener('click', () => {
            switch1.classList.add('sec12_selected');
            switch2.classList.remove('sec12_selected');
            switch1.setAttribute('aria-selected', 'true');
            switch2.setAttribute('aria-selected', 'false');

            img1.classList.remove('hidden');
            img2.classList.add('hidden');
        });

        switch2.addEventListener('click', () => {
            switch1.classList.remove('sec12_selected');
            switch2.classList.add('sec12_selected');
            switch1.setAttribute('aria-selected', 'false');
            switch2.setAttribute('aria-selected', 'true');

            img2.classList.remove('hidden');
            img1.classList.add('hidden');
        });
    }

    // =========================================================================================================
    // sec13 FAQ 아코디언 제어
    // =========================================================================================================
    const faqItems = document.querySelectorAll('.sec13_item');

    faqItems.forEach(item => {
        const qqq = item.querySelector('.sec13_qqq');
        if (!qqq) return;

        qqq.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // 필요 시 다른 항목을 닫는 아코디언 로직 적용 (현재는 독립 개폐 방식)
            item.classList.toggle('is-open');
            qqq.setAttribute('aria-expanded', !isOpen);
        });
    });
});





// =========================================================================================================
// sec14 관련
document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================================================
    // sec14 타이머 제어
    // =========================================================================================================
    const targetDate1 = new Date('2026-08-29T13:00:00');
    const timeEl1 = document.getElementById('sec14_time_1');
    const dayEl1 = document.getElementById('sec14_day_1');
    let timerInterval = null;

    function updateTimer1() {
        const now = new Date();
        const diff = targetDate1 - now;

        if (diff <= 0) {
            if (timeEl1) timeEl1.textContent = "00 : 00 : 00 : 00";
            if (dayEl1) dayEl1.textContent = "참가신청 D-DAY";
            if (timerInterval) clearInterval(timerInterval); // 목표 달성 시 인터벌 종료 (메모리 관리)
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const formatNum = (num) => String(num).padStart(2, '0');

        if (timeEl1) {
            timeEl1.textContent = `${formatNum(days)} : ${formatNum(hours)} : ${formatNum(minutes)} : ${formatNum(seconds)}`;
        }
        if (dayEl1) {
            dayEl1.textContent = `참가신청 D-${days}`;
        }
    }

    // 최초 실행 및 1초 간격 갱신
    updateTimer1();
    timerInterval = setInterval(updateTimer1, 1000);
});






// =========================================================================================================
// sec16 관련

document.addEventListener('DOMContentLoaded', () => {
    // 글로벌 카드 활성화/토글 함수
    window.cardActive = function(cardElement, event) {
        if (event) {
            event.stopPropagation();
        }

        // 선택된 카드가 이미 활성화되어 있는지 확인
        const isActive = cardElement.classList.contains('sec16_active');

        // 다른 모든 카드의 활성화 해제
        document.querySelectorAll('.sec16_card').forEach((card) => {
            card.classList.remove('sec16_active');
        });

        // 이미 활성화되어 있던 카드가 아니라면 활성화 (토글 구현)
        if (!isActive) {
            cardElement.classList.add('sec16_active');
        }
    };

    // 문서 바깥 클릭 시 모든 카드 오버레이 닫기
    document.addEventListener('click', () => {
        document.querySelectorAll('.sec16_card').forEach((card) => {
            card.classList.remove('sec16_active');
        });
    });
});



// =========================================================================================================
// sec99 관련

//  document.addEventListener('DOMContentLoaded', () => {
//      const video = document.getElementById('sec99_video');
//      if (!video) return;
//  
//      // ==========================================
//      // [설정] 화면 폭 기준점 (넓은 순서대로 작성)
//      // 1400px 이상 -> 1번 영상
//      // 1024px 이상 -> 2번 영상
//      // 768px 이상  -> 3번 영상
//      // 768px 미만  -> 4번 영상
//      // ==========================================
//      const BREAKPOINTS = [1400, 1024, 768];
//  
//      let currentVideoIndex = null;
//  
//      // # 화면 폭에 맞는 영상 번호(1, 2, 3, 4...) 판별 함수
//      function getTargetIndex() {
//          const width = window.innerWidth;
//          for (let i = 0; i < BREAKPOINTS.length; i++) {
//              if (width >= BREAKPOINTS[i]) {
//                  return i + 1;
//              }
//          }
//          return BREAKPOINTS.length + 1;
//      }
//  
//      // # 적합한 영상, 포스터 세팅 함수
//      function loadAppropriateVideo() {
//          const targetIndex = getTargetIndex();
//          if (currentVideoIndex === targetIndex) return;      // 이미 적합하면 패스
//          currentVideoIndex = targetIndex;
//  
//          // data 속성에서 읽어오기 (예: data-poster-1, data-mp4-1)
//          const poster = video.getAttribute(`data-poster-${targetIndex}`);
//          const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
//          const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);
//  
//          if (poster) video.poster = poster;      // 포스터 세팅
//  
//          // 기존 자식 source 비우기
//          video.innerHTML = '';
//  
//          // 영상 세팅. source 방식으로, webm 로딩 가능하면 그거 쓰고, 아니면 mp4
//          if (webmSrc) {
//              const sourceWebm = document.createElement('source');
//              sourceWebm.src = webmSrc;
//              sourceWebm.type = 'video/webm';
//              video.appendChild(sourceWebm);
//          }
//          if (mp4Src) {
//              const sourceMp4 = document.createElement('source');
//              sourceMp4.src = mp4Src;
//              sourceMp4.type = 'video/mp4';
//              video.appendChild(sourceMp4);
//          }
//  
//          // 영상 새로고침 및 재생
//          video.load();
//          video.play().catch(error => {
//              console.log("자동 재생 대기 중:", error);
//          });
//      }
//  
//      // 최초 실행 (조건에 맞는 단 1개의 영상만 즉시 다운로드)
//      loadAppropriateVideo();
//  
//      // 화면 크기 변경 감지 (디바운스 적용)
//      let resizeTimer;
//      window.addEventListener('resize', () => {
//          clearTimeout(resizeTimer);
//          resizeTimer = setTimeout(() => {
//              loadAppropriateVideo();
//          }, 200);
//      });
//  });












