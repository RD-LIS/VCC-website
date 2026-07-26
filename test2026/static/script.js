



// =========================================================================================================
// sec01 관련


document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);     // GSAP 플러그인 등록

    // ==========================================
    // 1. 화면폭 구간별 설정 (원하는 만큼 추가/수정 가능)
    // - minWidth: 해당 구간이 시작되는 최소 화면 폭 (px)
    // - 배열은 minWidth 기준으로 내림차순(큰 값 -> 작은 값) 정렬되어 적용됩니다.
    // ==========================================
    const BREAKPOINTS = [
        {
            minWidth: 1024,
            videoSrc: "./static/sec01_vid1.mp4",
            frameHeight: "600vh"
        },
        {
            minWidth: 0,
            videoSrc: "./static/sec01_vid2.mp4",
            frameHeight: "300vh"
        }
    ];

    const frameEl = document.querySelector(".sec01_frame");
    const videoEl = document.getElementById("sec01_video");
    let currentActiveIndex = -1; // 현재 활성화된 브레이크포인트 인덱스
    let scrollTriggerInstance = null;

    // ==========================================
    // 2. 현재 화면 폭에 맞는 설정 탐색 함수
    // ==========================================
    function getActiveConfig() {
        const windowWidth = window.innerWidth;
        
        // minWidth가 큰 순서대로 정렬 후 조건에 맞는 첫 번째 항목 반환
        const sorted = [...BREAKPOINTS].sort((a, b) => b.minWidth - a.minWidth);
        const index = sorted.findIndex(item => windowWidth >= item.minWidth);

        return {
            config: index !== -1 ? sorted[index] : sorted[sorted.length - 1],
            index: index !== -1 ? index : sorted.length - 1
        };
    }

    // ==========================================
    // 3. 스크롤 & 비디오 동기화 설정 함수
    // ==========================================
    function setupVideoScroll() {
        const { config, index } = getActiveConfig();

        // 기존과 같은 구간이라면 재설정하지 않음 (중복 연산 및 비디오 재로드 방지)
        if (currentActiveIndex === index) return;
        currentActiveIndex = index;

        // 1) frame height 설정 (스크롤 길이에 따른 재생 속도 조절)
        frameEl.style.height = config.frameHeight;

        // 2) 비디오 소스 교체
        if (videoEl.getAttribute("src") !== config.videoSrc) {
            videoEl.src = config.videoSrc;
            videoEl.load();
        }

        // 3) 기존 ScrollTrigger 제거
        if (scrollTriggerInstance) {
            scrollTriggerInstance.kill();
        }

        // 4) GSAP ScrollTrigger 생성
        const initGSAP = () => {
            scrollTriggerInstance = ScrollTrigger.create({
                trigger: ".sec01_frame",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.1, // 스크롤 감도 (0.1 ~ 0.5 권장)
                onUpdate: (self) => {
                    if (videoEl.duration) {
                        videoEl.currentTime = videoEl.duration * self.progress;
                    }
                }
            });
        };

        // 메타데이터 로드 상태 체크 후 바인딩
        if (videoEl.readyState >= 1) {
            initGSAP();
        } else {
            videoEl.onloadedmetadata = initGSAP;
        }
    }

    // 초기 실행
    setupVideoScroll();

    // 화면 리사이즈 시 대응 (디바운싱 처리)
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setupVideoScroll();
            ScrollTrigger.refresh();
        }, 200);
    });
});







// =========================================================================================================
// sec03 관련

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('sec03_video');
    if (!video) return;

    // ==========================================
    // [설정예시] 화면 폭 기준점 (넓은 순서대로 작성)
    // 1400px 이상 -> 1번 영상
    // 1024px 이상 -> 2번 영상
    // 768px 이상  -> 3번 영상
    // 768px 미만  -> 4번 영상
    // ==========================================
    const BREAKPOINTS = [1400, 768];

    let currentVideoIndex = null;

    // # 화면 폭에 맞는 영상 번호(1, 2, 3, 4...) 판별 함수
    function getTargetIndex() {
        const width = window.innerWidth;
        for (let i = 0; i < BREAKPOINTS.length; i++) {
            if (width >= BREAKPOINTS[i]) {
                return i + 1;
            }
        }
        return BREAKPOINTS.length + 1;
    }

    // # 적합한 영상, 포스터 세팅 함수
    function loadAppropriateVideo() {
        const targetIndex = getTargetIndex();
        if (currentVideoIndex === targetIndex) return;      // 이미 적합하면 패스
        currentVideoIndex = targetIndex;

        // data 속성에서 읽어오기 (예: data-poster-1, data-mp4-1)
        const poster = video.getAttribute(`data-poster-${targetIndex}`);
        const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
        const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);

        if (poster) video.poster = poster;      // 포스터 세팅

        // 기존 자식 source 비우기
        video.innerHTML = '';

        // 영상 세팅. source 방식으로, webm 로딩 가능하면 그거 쓰고, 아니면 mp4
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

        // 영상 새로고침 및 재생
        video.load();
        video.play().catch(error => {
            console.log("자동 재생 대기 중:", error);
        });
    }

    // 최초 실행 (조건에 맞는 단 1개의 영상만 즉시 다운로드)
    loadAppropriateVideo();

    // 화면 크기 변경 감지 (디바운스 적용)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadAppropriateVideo();
        }, 200);
    });
});







// =========================================================================================================
// sec04 관련

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('sec04_video');
    if (!video) return;

    // ==========================================
    // [설정예시] 화면 폭 기준점 (넓은 순서대로 작성)
    // 1400px 이상 -> 1번 영상
    // 1024px 이상 -> 2번 영상
    // 768px 이상  -> 3번 영상
    // 768px 미만  -> 4번 영상
    // ==========================================
    const BREAKPOINTS = [1400, 768];

    let currentVideoIndex = null;

    // # 화면 폭에 맞는 영상 번호(1, 2, 3, 4...) 판별 함수
    function getTargetIndex() {
        const width = window.innerWidth;
        for (let i = 0; i < BREAKPOINTS.length; i++) {
            if (width >= BREAKPOINTS[i]) {
                return i + 1;
            }
        }
        return BREAKPOINTS.length + 1;
    }

    // # 적합한 영상, 포스터 세팅 함수
    function loadAppropriateVideo() {
        const targetIndex = getTargetIndex();
        if (currentVideoIndex === targetIndex) return;      // 이미 적합하면 패스
        currentVideoIndex = targetIndex;

        // data 속성에서 읽어오기 (예: data-poster-1, data-mp4-1)
        const poster = video.getAttribute(`data-poster-${targetIndex}`);
        const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
        const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);

        if (poster) video.poster = poster;      // 포스터 세팅

        // 기존 자식 source 비우기
        video.innerHTML = '';

        // 영상 세팅. source 방식으로, webm 로딩 가능하면 그거 쓰고, 아니면 mp4
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

        // 영상 새로고침 및 재생
        video.load();
        video.play().catch(error => {
            console.log("자동 재생 대기 중:", error);
        });
    }

    // 최초 실행 (조건에 맞는 단 1개의 영상만 즉시 다운로드)
    loadAppropriateVideo();

    // 화면 크기 변경 감지 (디바운스 적용)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadAppropriateVideo();
        }, 200);
    });
});










// =========================================================================================================
// sec11 관련

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('sec11_video');
    if (!video) return;

    // ==========================================
    // [설정] 화면 폭 기준점 (넓은 순서대로 작성)
    // 1400px 이상 -> 1번 영상
    // 1024px 이상 -> 2번 영상
    // 768px 이상  -> 3번 영상
    // 768px 미만  -> 4번 영상
    // ==========================================
    const BREAKPOINTS = [1400, 1024, 768];

    let currentVideoIndex = null;

    // # 화면 폭에 맞는 영상 번호(1, 2, 3, 4...) 판별 함수
    function getTargetIndex() {
        const width = window.innerWidth;
        for (let i = 0; i < BREAKPOINTS.length; i++) {
            if (width >= BREAKPOINTS[i]) {
                return i + 1;
            }
        }
        return BREAKPOINTS.length + 1;
    }

    // # 적합한 영상, 포스터 세팅 함수
    function loadAppropriateVideo() {
        const targetIndex = getTargetIndex();
        if (currentVideoIndex === targetIndex) return;      // 이미 적합하면 패스
        currentVideoIndex = targetIndex;

        // data 속성에서 읽어오기 (예: data-poster-1, data-mp4-1)
        const poster = video.getAttribute(`data-poster-${targetIndex}`);
        const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
        const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);

        if (poster) video.poster = poster;      // 포스터 세팅

        // 기존 자식 source 비우기
        video.innerHTML = '';

        // 영상 세팅. source 방식으로, webm 로딩 가능하면 그거 쓰고, 아니면 mp4
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

        // 영상 새로고침 및 재생
        video.load();
        video.play().catch(error => {
            console.log("자동 재생 대기 중:", error);
        });
    }

    // 최초 실행 (조건에 맞는 단 1개의 영상만 즉시 다운로드)
    loadAppropriateVideo();

    // 화면 크기 변경 감지 (디바운스 적용)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadAppropriateVideo();
        }, 200);
    });
});















// =========================================================================================================
// sec12 관련

const switch1 = document.getElementById('sec12_switch1');
const switch2 = document.getElementById('sec12_switch2');
const img1 = document.getElementById('sec12_img1');
const img2 = document.getElementById('sec12_img2');

switch1.addEventListener('click', function() {
    switch1.classList.add('sec12_selected');
    switch2.classList.remove('sec12_selected');

    img1.classList.remove('hidden');
    img2.classList.add('hidden');
});

switch2.addEventListener('click', function() {
    switch1.classList.remove('sec12_selected');
    switch2.classList.add('sec12_selected');

    img2.classList.remove('hidden');
    img1.classList.add('hidden');
});






// =========================================================================================================
// sec13 관련

const faqItems = document.querySelectorAll('.sec13_item');
faqItems.forEach(item => {
    const qqq = item.querySelector('.sec13_qqq');
    qqq.addEventListener('click', () => {
        item.classList.toggle('is-open');
    });
});




// =========================================================================================================
// sec14 관련

const targetDate1 = new Date('2026-08-29T13:00:00');     // 목표설정
const timeEl1 = document.getElementById('sec14_time_1');
const dayEl1 = document.getElementById('sec14_day_1');

function updateTimer1() {
    const now = new Date();
    const diff = targetDate1 - now;
    
    if (diff <= 0) {
        if (timeEl1) timeEl1.textContent = "00 : 00 : 00 : 00";
        if (dayEl1) dayEl1.textContent = "참가신청 D-DAY";
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
updateTimer1();
setInterval(updateTimer1, 1000);



const targetDate2 = new Date('2026-09-22T13:00:00');     // 목표설정
const timeEl2 = document.getElementById('sec14_time_2');
const dayEl2 = document.getElementById('sec14_day_2');

function updateTimer2() {
    const now = new Date();
    const diff = targetDate2 - now;
    
    if (diff <= 0) {
        if (timeEl2) timeEl2.textContent = "00 : 00 : 00 : 00";
        if (dayEl2) dayEl2.textContent = "D-DAY";
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const formatNum = (num) => String(num).padStart(2, '0');
    
    if (timeEl2) {
        timeEl2.textContent = `${formatNum(days)} : ${formatNum(hours)} : ${formatNum(minutes)} : ${formatNum(seconds)}`;
    }
    if (dayEl2) {
        dayEl2.textContent = `행사시작 D-${days}`;
    }
}
updateTimer2();
setInterval(updateTimer2, 1000);






// =========================================================================================================
// sec16 관련


// 1. 카드별 데이터 정의 (URL과 타이틀을 수정해서 사용하세요)
const sec16Data = [
    {
        title: "2023 VCC 다시보기",
        youtube: "https://youtube.com/1",
        webpage: "https://example.com/2023"
    },
    {
        title: "2024 VCC 다시보기",
        youtube: "https://youtube.com/2",
        webpage: "https://example.com/2024"
    },
    {
        title: "2025 VCC 다시보기",
        youtube: "https://youtube.com/3",
        webpage: "https://example.com/2025"
    }
];

// 2. 모달 열기 함수 (카드 클릭 시 실행)
function sec16click(index) {
    const data = sec16Data[index];
    if (!data) return;

    // 모달 타이틀 변경
    document.getElementById("sec16_m_title").innerText = data.title;

    // 버튼 링크 변경 (target="_blank"로 새창 열기 기본 적용)
    const ytBtn = document.getElementById("sec16_youtube");
    const webBtn = document.getElementById("sec16_webpage");

    ytBtn.href = data.youtube;
    ytBtn.target = "_blank";

    webBtn.href = data.webpage;
    webBtn.target = "_blank";

    // 모달 띄우기
    document.querySelector(".sec16_m_set").classList.add("active");
}

// 3. 모달 닫기 이벤트 세팅
document.addEventListener("DOMContentLoaded", function () {
    const modalSet = document.querySelector(".sec16_m_set");
    const closeBtn = document.querySelector(".sec16_m_close");
    const dimArea = document.querySelector(".sec16_dim");

    // 닫기 함수
    function closeModal() {
        modalSet.classList.remove("active");
    }

    // X 버튼 클릭 시 닫기
    closeBtn.addEventListener("click", closeModal);

    // 어두운 배경(dim) 클릭 시 닫기
    dimArea.addEventListener("click", closeModal);
});









// =========================================================================================================
// sec99 관련

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('sec99_video');
    if (!video) return;

    // ==========================================
    // [설정] 화면 폭 기준점 (넓은 순서대로 작성)
    // 1400px 이상 -> 1번 영상
    // 1024px 이상 -> 2번 영상
    // 768px 이상  -> 3번 영상
    // 768px 미만  -> 4번 영상
    // ==========================================
    const BREAKPOINTS = [1400, 1024, 768];

    let currentVideoIndex = null;

    // # 화면 폭에 맞는 영상 번호(1, 2, 3, 4...) 판별 함수
    function getTargetIndex() {
        const width = window.innerWidth;
        for (let i = 0; i < BREAKPOINTS.length; i++) {
            if (width >= BREAKPOINTS[i]) {
                return i + 1;
            }
        }
        return BREAKPOINTS.length + 1;
    }

    // # 적합한 영상, 포스터 세팅 함수
    function loadAppropriateVideo() {
        const targetIndex = getTargetIndex();
        if (currentVideoIndex === targetIndex) return;      // 이미 적합하면 패스
        currentVideoIndex = targetIndex;

        // data 속성에서 읽어오기 (예: data-poster-1, data-mp4-1)
        const poster = video.getAttribute(`data-poster-${targetIndex}`);
        const webmSrc = video.getAttribute(`data-webm-${targetIndex}`);
        const mp4Src = video.getAttribute(`data-mp4-${targetIndex}`);

        if (poster) video.poster = poster;      // 포스터 세팅

        // 기존 자식 source 비우기
        video.innerHTML = '';

        // 영상 세팅. source 방식으로, webm 로딩 가능하면 그거 쓰고, 아니면 mp4
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

        // 영상 새로고침 및 재생
        video.load();
        video.play().catch(error => {
            console.log("자동 재생 대기 중:", error);
        });
    }

    // 최초 실행 (조건에 맞는 단 1개의 영상만 즉시 다운로드)
    loadAppropriateVideo();

    // 화면 크기 변경 감지 (디바운스 적용)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadAppropriateVideo();
        }, 200);
    });
});












