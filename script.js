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

    // --- 2. WEB AUDIO API (ÂM THANH THƯ GIÃN) ---
    const soundBtns = document.querySelectorAll(".sound-btn");
    if (soundBtns.length > 0) {
        const audioStatus = document.getElementById("audioStatus");
        let audioCtx = null;
        let noiseNode = null;
        let isPlaying = false;
        let activeBtn = null;

        soundBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const soundType = btn.getAttribute("data-sound");
                if (isPlaying && activeBtn === btn) {
                    stopSound();
                    return;
                }
                stopSound();
                playSound(soundType);
                soundBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                activeBtn = btn;
            });
        });

        function playSound(type) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const bufferSize = 2 * audioCtx.sampleRate;
                const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }

                const whiteNoise = audioCtx.createBufferSource();
                whiteNoise.buffer = noiseBuffer;
                whiteNoise.loop = true;

                const filter = audioCtx.createBiquadFilter();
                if (type === 'rain') { filter.type = 'lowpass'; filter.frequency.value = 800; }
                else if (type === 'waves') { filter.type = 'bandpass'; filter.frequency.value = 400; }
                else { filter.type = 'lowpass'; filter.frequency.value = 1200; }

                const gainNode = audioCtx.createGain();
                gainNode.gain.value = 0.15;

                whiteNoise.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                whiteNoise.start();
                noiseNode = whiteNoise;
                isPlaying = true;

                const names = {
                    'rain': 'Đang phát: Tiếng Mưa Rơi nhân tạo',
                    'waves': 'Đang phát: Sóng Biển Đêm thư giãn',
                    'whitenoise': 'Đang phát: Tiếng Ồn Trắng tiêu chuẩn'
                };
                audioStatus.textContent = names[type];
            } catch (e) {
                audioStatus.textContent = "Trình duyệt chặn Audio tự động. Hãy thử lại!";
            }
        }

        function stopSound() {
            if (noiseNode) { noiseNode.stop(); noiseNode.disconnect(); noiseNode = null; }
            if (audioCtx) { audioCtx.close(); audioCtx = null; }
            isPlaying = false;
            if (activeBtn) { activeBtn.classList.remove("active"); activeBtn = null; }
            audioStatus.textContent = "Trạng thái: Đang dừng phát";
        }
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