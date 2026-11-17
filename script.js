document.addEventListener("DOMContentLoaded", () => {
    // --- 1. PARALLAX & BACKGROUND SWITCHER ---
    const bgSlides = document.querySelectorAll(".bg-slide");
    const sections = document.querySelectorAll("section[data-bg]");

    function updateBackground() {
        if (!sections.length) return;
        let scrollPosition = window.scrollY + window.innerHeight / 2;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const bgIndex = section.getAttribute("data-bg");
                bgSlides.forEach((slide, idx) => {
                    if (idx == bgIndex) slide.classList.add("active");
                    else slide.classList.remove("active");
                });
            }
        });
    }

    window.addEventListener("scroll", updateBackground);
    updateBackground();

    // Scroll Animation
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".animate-on-scroll").forEach(el => observer.observe(el));

    // --- 2. HỆ THỐNG PHÁT ÂM THANH BẰNG FILE MP3 ---
    const soundBtns = document.querySelectorAll(".sound-btn");
    if (soundBtns.length > 0) {
        const audioStatus = document.getElementById("audioStatus");
        
        // Tạo trình phát nhạc ẩn (Audio Element)
        const audioPlayer = new Audio();
        audioPlayer.loop = true; // Lặp lại liên tục
        let activeBtn = null;

        // DANH SÁCH LINK MP3 TƯƠNG ỨNG
        // Đổi link này thành file trong máy nếu cần (VD: 'mua.mp3')
        const audioSources = {
            'rain': 'rain.mp3',
            'waves': 'waves.mp3',
            'whitenoise': 'whitenoise.mp3'
        };

        const audioNames = {
            'rain': 'Đang phát: Tiếng Mưa Rơi (MP3)',
            'waves': 'Đang phát: Sóng Biển Đêm (MP3)',
            'whitenoise': 'Đang phát: Tiếng Gió (MP3)'
        };

        soundBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const soundType = btn.getAttribute("data-sound");

                // Nếu click lại nút đang phát -> Tắt nhạc
                if (activeBtn === btn) {
                    audioPlayer.pause();
                    btn.classList.remove("active");
                    activeBtn = null;
                    audioStatus.textContent = "Trạng thái: Đang dừng phát";
                    return;
                }

                // Tắt nút cũ nếu đang phát nhạc khác
                if (activeBtn) {
                    activeBtn.classList.remove("active");
                }

                // Cập nhật nút mới
                btn.classList.add("active");
                activeBtn = btn;
                audioStatus.textContent = "Đang tải âm thanh...";
                
                // Gắn MP3 và chạy
                audioPlayer.src = audioSources[soundType];
                audioPlayer.play().then(() => {
                    audioStatus.textContent = audioNames[soundType];
                }).catch(() => {
                    audioStatus.textContent = "Lỗi: Trình duyệt chặn phát âm thanh tự động!";
                });
            });
        });
    }

    // --- 3. HỆ THỐNG TRẮC NGHIỆM TÂM LÝ ---
    const quizTabBtns = document.querySelectorAll(".quiz-tab-btn");
    const quizPanels = document.querySelectorAll(".quiz-panel");

    if (quizTabBtns.length > 0) {
        quizTabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetId = btn.getAttribute("data-target");

                quizTabBtns.forEach(b => b.classList.remove("active"));
                quizPanels.forEach(p => p.classList.remove("active"));

                btn.classList.add("active");
                document.getElementById(targetId).classList.add("active");
            });
        });

        const submitQuizBtns = document.querySelectorAll(".submit-quiz-btn");
        submitQuizBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const quizType = btn.getAttribute("data-quiz");
                let totalScore = 0;
                let count = 0;
                let namePrefix = quizType === 'insomnia' ? 'iq' : (quizType === 'stress' ? 'sq' : 'dq');

                for (let i = 1; i <= 3; i++) {
                    const selected = document.querySelector(`input[name="${namePrefix}${i}"]:checked`);
                    if (selected) {
                        totalScore += parseInt(selected.value);
                        count++;
                    }
                }

                const resultBox = document.getElementById(`${quizType}Result`);
                resultBox.style.display = "block";

                if (count < 3) {
                    resultBox.style.backgroundColor = "rgba(244, 63, 94, 0.2)";
                    resultBox.style.color = "#f43f5e";
                    resultBox.textContent = "⚠️ Vui lòng trả lời tất cả các câu hỏi trước khi xem kết quả!";
                    return;
                }

                let message = "";
                if (totalScore <= 2) {
                    resultBox.style.backgroundColor = "rgba(52, 211, 153, 0.2)";
                    resultBox.style.color = "#34d399";
                    message = `Kết quả: Bình thường (Điểm số: ${totalScore}/9). Sức khỏe tâm thần của bạn đang ở mức ổn định. Hãy tiếp tục duy trì lối sống lành mạnh!`;
                } else if (totalScore <= 5) {
                    resultBox.style.backgroundColor = "rgba(251, 191, 36, 0.2)";
                    resultBox.style.color = "#fbbf24";
                    message = `Kết quả: Cảnh báo nhẹ (Điểm số: ${totalScore}/9). Bạn đang có dấu hiệu chớm gặp vấn đề. Nên chú ý điều chỉnh lại thời gian nghỉ ngơi và giảm áp lực công việc.`;
                } else {
                    resultBox.style.backgroundColor = "rgba(244, 63, 94, 0.2)";
                    resultBox.style.color = "#f43f5e";
                    message = `Kết quả: Cảnh báo cao (Điểm số: ${totalScore}/9). Bạn đang gặp tình trạng nghiêm trọng. Hãy cân nhắc áp dụng các bài tập thư giãn hoặc tìm đến chuyên gia tâm lý tư vấn.`;
                }
                resultBox.textContent = message;
            });
        });
    }
});