document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const appContainer = document.querySelector('.app-container');
    const timerHours = document.getElementById('timer-hours');
    const timerMinutes = document.getElementById('timer-minutes');
    const timerSeconds = document.getElementById('timer-seconds');
    const timerDisplay = document.getElementById('timer-display');
    const timerStartBtn = document.getElementById('timer-start');
    const timerPauseBtn = document.getElementById('timer-pause');
    const timerResetBtn = document.getElementById('timer-reset');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const customHoursInput = document.getElementById('custom-hours');
    const customMinutesInput = document.getElementById('custom-minutes');
    const customSecondsInput = document.getElementById('custom-seconds');
    const setCustomTimeBtn = document.getElementById('set-custom-time');
    const timerAdd1mBtn = document.getElementById('timer-add-1m');
    const timerAdd5mBtn = document.getElementById('timer-add-5m');
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const stopwatchMinutes = document.getElementById('stopwatch-minutes');
    const stopwatchSeconds = document.getElementById('stopwatch-seconds');
    const stopwatchMilliseconds = document.getElementById('stopwatch-milliseconds');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const lapsContainer = document.getElementById('laps-container');
    const themeToggle = document.getElementById('theme-toggle');
    const muteToggle = document.getElementById('mute-toggle');
    let timerInterval;
    let timerTimeLeft = 1500;
    let timerTotalTime = 1500;
    let timerRunning = false;
    let stopwatchInterval;
    let stopwatchTime = 0;
    let stopwatchRunning = false;
    let lapCount = 0;
    let sounds = {};
    let isMuted = false;
    try {
        if (typeof Howl !== 'undefined') {
            console.log('Initializing sound effects...');
            sounds = {
                tick: new Howl({
                    src: ['sounds/tick.mp3'],
                    volume: 0.3,
                    preload: true,
                    onload: function () {
                        console.log('Tick sound loaded successfully');
                    },
                    onloaderror: function (id, err) {
                        console.error('Error loading tick sound:', err);
                    }
                }),
                beep: new Howl({
                    src: ['sounds/beep.mp3'],
                    volume: 0.5,
                    preload: true,
                    onload: function () {
                        console.log('Beep sound loaded successfully');
                    },
                    onloaderror: function (id, err) {
                        console.error('Error loading beep sound:', err);
                    }
                }),
                lap: new Howl({
                    src: ['sounds/lap.mp3'],
                    volume: 0.4,
                    preload: true,
                    onload: function () {
                        console.log('Lap sound loaded successfully');
                    },
                    onloaderror: function (id, err) {
                        console.error('Error loading lap sound:', err);
                    }
                })
            };
            console.log('Sound effects initialized.');
        } else {
            console.error("Howler.js not loaded. Sound effects disabled.");
            sounds = { tick: { play: () => { } }, beep: { play: () => { } }, lap: { play: () => { } } };
        }
    } catch (error) {
        console.error("Error initializing sound effects:", error);
        sounds = { tick: { play: () => { } }, beep: { play: () => { } }, lap: { play: () => { } } };
    }
    function playSound(soundName) {
        if (!isMuted && sounds[soundName] && typeof sounds[soundName].play === 'function') {
            try {
                sounds[soundName].play();
            } catch (e) {
                console.error(`Sound play error (${soundName}):`, e);
            }
        }
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            console.log('Theme toggle clicked');
            document.body.classList.toggle('light-theme');
            if (document.body.classList.contains('light-theme')) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }
    if (muteToggle) {
        muteToggle.addEventListener('click', function () {
            console.log('Mute toggle clicked');
            isMuted = !isMuted;
            if (isMuted) {
                muteToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else {
                muteToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                playSound('beep');
            }
            console.log('Muted state:', isMuted);
        });
    }
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Tab button clicked');
            const tabId = button.getAttribute('data-tab');
            if (activeTabId === tabId) return;
            if (animationIsRunning) {
                if (activeTabId === 'timer') {
                    timerAnimationElapsed += (Date.now() - animationStartTime);
                } else if (activeTabId === 'stopwatch') {
                    stopwatchAnimationElapsed += (Date.now() - animationStartTime);
                }
            }
            activeTabId = tabId;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            if (activeTabId === 'timer') {
                if (timerRunning) {
                    if (!animationIsRunning) startAnimationLoop();
                    else animationStartTime = Date.now();
                    setAnimationPlayState('running');
                } else {
                    stopAnimationLoop();
                    setAnimationPlayState('paused');
                    if (typeof animateNew === 'function') animateNew(true);
                }
            } else if (activeTabId === 'stopwatch') {
                if (stopwatchRunning) {
                    if (!animationIsRunning) startAnimationLoop();
                    else animationStartTime = Date.now();
                    setAnimationPlayState('running');
                } else {
                    stopAnimationLoop();
                    setAnimationPlayState('paused');
                    if (typeof animateNew === 'function') animateNew(true);
                }
            }
        });
    });
    const animationContainer = document.querySelector('.animation-container');
    const dotsContainer = document.getElementById('dots');
    const linesContainer = document.getElementById('lines-container');
    const frameElement = document.getElementById('frame');
    const backgroundGlow = document.querySelector('.animation-container .background-glow');
    let animationIsRunning = false;
    let animationFrameId;
    let animationLineDirection = 1;
    let animationStartTime = Date.now();
    let timerAnimationElapsed = 0;
    let stopwatchAnimationElapsed = 0;
    let activeTabId = 'timer';
    const animationDots = [];
    const animationLines = [];
    const animationNodes = [];
    const animationSlidingDots = [];
    let animationLineWrapper;
    if (dotsContainer && linesContainer && frameElement && backgroundGlow) {
        console.log('Initializing NEW animation elements');
        const dotsCount = 16;
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            const frameSize = 200;
            const dotSpacing = frameSize / 4;
            const offset = dotSpacing / 2;
            if (i < 4) {
                dot.style.top = '-1.5px';
                dot.style.left = `${offset + i * dotSpacing - 1.5}px`;
            } else if (i < 8) {
                dot.style.right = '-1.5px';
                dot.style.top = `${offset + (i - 4) * dotSpacing - 1.5}px`;
            } else if (i < 12) {
                dot.style.bottom = '-1.5px';
                dot.style.left = `${offset + (11 - i) * dotSpacing - 1.5}px`;
            } else {
                dot.style.left = '-1.5px';
                dot.style.top = `${offset + (15 - i) * dotSpacing - 1.5}px`;
            }
            dotsContainer.appendChild(dot);
            animationDots.push(dot);
            setTimeout(() => {
                dot.classList.add('pulse');
            }, i * 200);
        }
        const lineCount = 7;
        animationLineWrapper = document.createElement('div');
        animationLineWrapper.className = 'line-wrapper';
        linesContainer.appendChild(animationLineWrapper);
        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'line';
            line.style.width = '280px';
            line.style.left = '-40px';
            line.style.top = `${30 + i * 20}px`;
            line.style.transform = 'rotate(45deg)';
            animationLineWrapper.appendChild(line);
            animationLines.push(line);
            setTimeout(() => {
                line.classList.add('glow');
            }, i * 300);
            const node = document.createElement('div');
            node.className = 'node';
            node.style.left = '0';
            node.style.top = `${30 + i * 20}px`;
            linesContainer.appendChild(node);
            animationNodes.push(node);
            for (let j = 0; j < 2; j++) {
                const slidingDot = document.createElement('div');
                slidingDot.className = 'sliding-dot';
                slidingDot.dataset.lineIndex = i;
                slidingDot.dataset.dotIndex = j;
                slidingDot.style.opacity = 0.8;
                linesContainer.appendChild(slidingDot);
                animationSlidingDots.push(slidingDot);
            }
        }
        function animateNew(forceDraw = false) {
            if (!animationIsRunning && !forceDraw) return;
            const baseElapsed = (activeTabId === 'timer') ? timerAnimationElapsed : stopwatchAnimationElapsed;
            const elapsed = baseElapsed + (animationIsRunning ? (Date.now() - animationStartTime) : 0);
            for (let i = 0; i < lineCount; i++) {
                const speed = 1 + (i * 0.15);
                const progress = (elapsed / (120 / speed) + i * 20) % 280;
                const xPos = progress;
                const yPos = 30 + i * 20;
                animationNodes[i].style.left = `${xPos}px`;
                animationNodes[i].style.top = `${yPos}px`;
                if (progress > 40 && progress < 160) {
                    animationNodes[i].classList.add('active');
                } else {
                    animationNodes[i].classList.remove('active');
                }
            }
            animationSlidingDots.forEach(dot => {
                const lineIndex = parseInt(dot.dataset.lineIndex);
                const dotIndex = parseInt(dot.dataset.dotIndex);
                const lineLength = 280;
                const speed = 0.05 + (lineIndex * 0.01) + (dotIndex * 0.03);
                const offset = dotIndex * 180;
                let progress = ((elapsed * speed) % lineLength) / lineLength;
                progress = (progress + offset / lineLength) % 1;
                const lineX = -40 + progress * lineLength;
                const lineY = 30 + lineIndex * 20;
                const angleRad = 45 * (Math.PI / 180);
                const dotX = lineX * Math.cos(angleRad) - lineY * Math.sin(angleRad);
                const dotY = lineX * Math.sin(angleRad) + lineY * Math.cos(angleRad);
                dot.style.left = `${dotX}px`;
                dot.style.top = `${dotY}px`;
                const frameSize = 200;
                if (dotX >= -40 && dotX <= frameSize + 40 && dotY >= -40 && dotY <= frameSize + 40) {
                    dot.style.opacity = '0.8';
                } else {
                    dot.style.opacity = '0';
                }
            });
            const dotCycleTime = 4000;
            const activeDotIndex = Math.floor((elapsed % dotCycleTime) / (dotCycleTime / dotsCount));
            animationDots.forEach((dot, index) => {
                const distance = (index - activeDotIndex + dotsCount) % dotsCount;
                const scale = distance <= 3 ? 1 + (3 - distance) * 0.5 : 1;
                dot.style.transform = `scale(${scale})`;
                const opacity = distance <= 3 ? 0.7 + (3 - distance) * 0.1 : 0.7;
                dot.style.opacity = opacity;
            });
            if (animationIsRunning) {
                animationFrameId = requestAnimationFrame(() => animateNew(false));
            }
        }
        function setAnimationPlayState(state) {
            console.log(`Setting animation play state to: ${state}`);
            if (backgroundGlow) backgroundGlow.style.animationPlayState = state;
            if (animationLineWrapper) animationLineWrapper.style.animationPlayState = state;
            animationDots.forEach(dot => { if (dot) dot.style.animationPlayState = state; });
            animationLines.forEach(line => { if (line) line.style.animationPlayState = state; });
        }
        function startAnimationLoop() {
            if (!animationIsRunning) {
                console.log("Starting JS Animation Loop");
                animationIsRunning = true;
                animationStartTime = Date.now();
                animateNew();
            }
        }
        function stopAnimationLoop() {
            if (animationIsRunning) {
                console.log("Stopping JS Animation Loop");
                animationIsRunning = false;
                cancelAnimationFrame(animationFrameId);
                if (activeTabId === 'timer') {
                    timerAnimationElapsed += (Date.now() - animationStartTime);
                } else if (activeTabId === 'stopwatch') {
                    stopwatchAnimationElapsed += (Date.now() - animationStartTime);
                }
            }
        }
        setAnimationPlayState('paused');
        stopAnimationLoop();
        console.log('NEW Animation initialized');
    } else {
        console.error('NEW Animation elements not found!');
    }
    function startTimer() {
        console.log('Start timer clicked');
        if (!timerRunning) {
            timerRunning = true;
            timerStartBtn.style.display = 'none';
            timerPauseBtn.style.display = 'inline-flex';
            if (timerDisplay) timerDisplay.classList.remove('paused');
            if (timerDisplay) timerDisplay.classList.add('running');
            document.getElementById('timer').classList.remove('paused-state');
            document.querySelector('.tab-btn[data-tab="timer"]').classList.remove('paused-state');
            setAnimationPlayState('running');
            startAnimationLoop();
            timerInterval = setInterval(() => {
                if (timerTimeLeft > 0) {
                    timerTimeLeft--;
                    updateTimerDisplay();
                    if (!isMuted && sounds.tick && typeof sounds.tick.play === 'function') {
                        playSound('tick');
                    }
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    timerStartBtn.style.display = 'inline-flex';
                    timerPauseBtn.style.display = 'none';
                    if (!isMuted && sounds.beep && typeof sounds.beep.play === 'function') {
                        playSound('beep');
                    }
                    flashTimerComplete();
                    if (!stopwatchRunning) {
                        setAnimationPlayState('paused');
                        stopAnimationLoop();
                    }
                }
            }, 1000);
        }
    }
    function pauseTimer() {
        console.log('Pause timer clicked');
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
            timerStartBtn.style.display = 'inline-flex';
            timerPauseBtn.style.display = 'none';
            if (timerDisplay) timerDisplay.classList.add('paused');
            if (timerDisplay) timerDisplay.classList.remove('running');
            document.getElementById('timer').classList.add('paused-state');
            document.querySelector('.tab-btn[data-tab="timer"]').classList.add('paused-state');
            setAnimationPlayState('paused');
            stopAnimationLoop();
        }
    }
    function resetTimer() {
        console.log('Reset timer clicked');
        clearInterval(timerInterval);
        timerTimeLeft = timerTotalTime;
        timerRunning = false;
        timerStartBtn.style.display = 'inline-flex';
        timerPauseBtn.style.display = 'none';
        if (timerDisplay) timerDisplay.classList.remove('paused');
        if (timerDisplay) timerDisplay.classList.remove('running');
        document.getElementById('timer').classList.remove('paused-state');
        document.querySelector('.tab-btn[data-tab="timer"]').classList.remove('paused-state');
        updateTimerDisplay();
        timerAnimationElapsed = 0;
        setAnimationPlayState('paused');
        stopAnimationLoop();
        animateNew(true);
    }
    function setTimer(seconds) {
        console.log('Set timer to', seconds);
        timerTimeLeft = seconds;
        timerTotalTime = seconds;
        updateTimerDisplay();
        resetTimer();
    }
    function updateTimerDisplay() {
        const hours = Math.floor(timerTimeLeft / 3600);
        const minutes = Math.floor((timerTimeLeft % 3600) / 60);
        const seconds = timerTimeLeft % 60;
        if (timerHours) timerHours.textContent = hours.toString().padStart(2, '0');
        if (timerMinutes) timerMinutes.textContent = minutes.toString().padStart(2, '0');
        if (timerSeconds) timerSeconds.textContent = seconds.toString().padStart(2, '0');
    }
    function flashTimerComplete() {
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            if (flashCount < 6) {
                if (timerDisplay) timerDisplay.classList.toggle('flashing');
                flashCount++;
            } else {
                clearInterval(flashInterval);
                if (timerDisplay) timerDisplay.classList.remove('flashing');
            }
        }, 400);
    }
    function addTimerTime(secondsToAdd) {
        console.log(`Adding ${secondsToAdd} seconds to timer`);
        timerTimeLeft += secondsToAdd;
        if (timerTimeLeft > timerTotalTime) {
            timerTotalTime = timerTimeLeft;
        }
        updateTimerDisplay();
        if (timerDisplay) {
            timerDisplay.classList.add('time-added-flash');
            setTimeout(() => timerDisplay.classList.remove('time-added-flash'), 300);
        }
    }
    function startStopwatch() {
        console.log('Start stopwatch clicked');
        if (!stopwatchRunning) {
            stopwatchRunning = true;
            stopwatchStartBtn.style.display = 'none';
            stopwatchPauseBtn.style.display = 'inline-flex';
            if (stopwatchMinutes) stopwatchMinutes.style.color = '';
            if (stopwatchSeconds) stopwatchSeconds.style.color = '';
            if (stopwatchMilliseconds) stopwatchMilliseconds.style.color = '';
            const timeUnits = document.querySelectorAll('#stopwatch .time-unit');
            timeUnits.forEach(unit => { unit.style.borderColor = ''; unit.style.backgroundColor = ''; });
            const colons = document.querySelectorAll('#stopwatch .colon');
            colons.forEach(colon => { colon.style.color = ''; });
            if (stopwatchDisplay) stopwatchDisplay.classList.remove('paused');
            if (stopwatchDisplay) stopwatchDisplay.classList.add('running');
            document.getElementById('stopwatch').classList.remove('paused-state');
            document.querySelector('.tab-btn[data-tab="stopwatch"]').classList.remove('paused-state');
            const stopwatchControls = document.querySelectorAll('#stopwatch .control-btn');
            stopwatchControls.forEach(btn => { btn.classList.remove('paused-control'); });
            setAnimationPlayState('running');
            startAnimationLoop();
            const startTime = Date.now() - stopwatchTime;
            let lastSecond = Math.floor(stopwatchTime / 1000);
            stopwatchInterval = setInterval(() => {
                stopwatchTime = Date.now() - startTime;
                updateStopwatchDisplay();
                const currentSecond = Math.floor(stopwatchTime / 1000);
                if (currentSecond !== lastSecond) {
                    lastSecond = currentSecond;
                    playSound('tick');
                }
            }, 10);
        }
    }
    function pauseStopwatch() {
        console.log('Pause stopwatch clicked');
        if (stopwatchRunning) {
            clearInterval(stopwatchInterval);
            stopwatchRunning = false;
            stopwatchStartBtn.style.display = 'inline-flex';
            stopwatchPauseBtn.style.display = 'none';
            if (stopwatchMinutes) stopwatchMinutes.style.color = 'var(--pause-color)';
            if (stopwatchSeconds) stopwatchSeconds.style.color = 'var(--pause-color)';
            if (stopwatchMilliseconds) stopwatchMilliseconds.style.color = 'var(--pause-color)';
            const timeUnits = document.querySelectorAll('#stopwatch .time-unit');
            timeUnits.forEach(unit => { unit.style.borderColor = 'var(--pause-color)'; unit.style.backgroundColor = 'rgba(255, 77, 77, 0.05)'; });
            const colons = document.querySelectorAll('#stopwatch .colon');
            colons.forEach(colon => { colon.style.color = 'var(--pause-color)'; });
            if (stopwatchDisplay) stopwatchDisplay.classList.add('paused');
            if (stopwatchDisplay) stopwatchDisplay.classList.remove('running');
            document.getElementById('stopwatch').classList.add('paused-state');
            document.querySelector('.tab-btn[data-tab="stopwatch"]').classList.add('paused-state');
            const stopwatchControls = document.querySelectorAll('#stopwatch .control-btn');
            stopwatchControls.forEach(btn => { btn.classList.add('paused-control'); });
            setAnimationPlayState('paused');
            stopAnimationLoop();
        }
    }
    function resetStopwatch() {
        console.log('Reset stopwatch clicked');
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        stopwatchRunning = false;
        stopwatchStartBtn.style.display = 'inline-flex';
        stopwatchPauseBtn.style.display = 'none';
        if (stopwatchMinutes) stopwatchMinutes.style.color = '';
        if (stopwatchSeconds) stopwatchSeconds.style.color = '';
        if (stopwatchMilliseconds) stopwatchMilliseconds.style.color = '';
        const timeUnits = document.querySelectorAll('#stopwatch .time-unit');
        timeUnits.forEach(unit => { unit.style.borderColor = ''; unit.style.backgroundColor = ''; });
        const colons = document.querySelectorAll('#stopwatch .colon');
        colons.forEach(colon => { colon.style.color = ''; });
        if (stopwatchDisplay) stopwatchDisplay.classList.remove('paused');
        if (stopwatchDisplay) stopwatchDisplay.classList.remove('running');
        document.getElementById('stopwatch').classList.remove('paused-state');
        document.querySelector('.tab-btn[data-tab="stopwatch"]').classList.remove('paused-state');
        const stopwatchControls = document.querySelectorAll('#stopwatch .control-btn');
        stopwatchControls.forEach(btn => { btn.classList.remove('paused-control'); });
        updateStopwatchDisplay();
        if (lapsContainer) lapsContainer.innerHTML = '';
        lapCount = 0;
        stopwatchAnimationElapsed = 0;
        setAnimationPlayState('paused');
        stopAnimationLoop();
        animateNew(true);
    }
    function recordLap() {
        console.log('Record lap clicked');
        if (stopwatchRunning || stopwatchTime > 0) {
            lapCount++;
            const lapTime = formatTime(stopwatchTime);
            const lapItem = document.createElement('div');
            lapItem.classList.add('lap-item');
            lapItem.innerHTML = `<span class="lap-number">Lap ${lapCount}</span><span class="lap-time">${lapTime}</span>`;
            if (lapsContainer) lapsContainer.insertBefore(lapItem, lapsContainer.firstChild);
            if (!isMuted && sounds.lap && typeof sounds.lap.play === 'function') {
                playSound('lap');
            }
            lapItem.style.animation = 'contentFadeIn 0.3s forwards';
        }
    }
    function updateStopwatchDisplay() {
        const milliseconds = Math.floor((stopwatchTime % 1000) / 10);
        const seconds = Math.floor((stopwatchTime / 1000) % 60);
        const minutes = Math.floor((stopwatchTime / (1000 * 60)) % 60);
        if (stopwatchMinutes) stopwatchMinutes.textContent = minutes.toString().padStart(2, '0');
        if (stopwatchSeconds) stopwatchSeconds.textContent = seconds.toString().padStart(2, '0');
        if (stopwatchMilliseconds) stopwatchMilliseconds.textContent = milliseconds.toString().padStart(2, '0');
    }
    function formatTime(time) {
        const milliseconds = Math.floor((time % 1000) / 10);
        const seconds = Math.floor((time / 1000) % 60);
        const minutes = Math.floor((time / (1000 * 60)) % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerPauseBtn) timerPauseBtn.addEventListener('click', pauseTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);
    if (timerAdd1mBtn) timerAdd1mBtn.addEventListener('click', () => addTimerTime(60));
    if (timerAdd5mBtn) timerAdd5mBtn.addEventListener('click', () => addTimerTime(300));
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.getAttribute('data-time'));
            setTimer(seconds);
            presetButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    if (setCustomTimeBtn) {
        setCustomTimeBtn.addEventListener('click', () => {
            const hours = parseInt(customHoursInput.value) || 0;
            const minutes = parseInt(customMinutesInput.value) || 0;
            const seconds = parseInt(customSecondsInput.value) || 0;
            if (hours >= 0 && hours <= 99 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59) {
                const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                if (totalSeconds > 0) {
                    console.log('Setting custom time to:', totalSeconds);
                    setTimer(totalSeconds);
                    presetButtons.forEach(btn => btn.classList.remove('active'));
                } else {
                    console.warn('Custom time must be greater than 0 seconds.');
                }
            } else {
                console.error('Invalid custom time input.');
            }
        });
    }
    if (stopwatchStartBtn) stopwatchStartBtn.addEventListener('click', startStopwatch);
    if (stopwatchPauseBtn) stopwatchPauseBtn.addEventListener('click', pauseStopwatch);
    if (stopwatchResetBtn) stopwatchResetBtn.addEventListener('click', resetStopwatch);
    if (stopwatchLapBtn) stopwatchLapBtn.addEventListener('click', recordLap);
    const allButtons = document.querySelectorAll('button:not(#stopwatch-lap)');
    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSound('beep');
        });
    });
    updateTimerDisplay();
    updateStopwatchDisplay();
    console.log('Initialization complete');
});
