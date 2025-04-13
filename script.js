// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Tab Elements
    const tabButtons = document.querySelectorAll('.tab-btn');

    const appContainer = document.querySelector('.app-container'); // Get app container

    // Timer Elements
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

    // Stopwatch Elements
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const stopwatchMinutes = document.getElementById('stopwatch-minutes');
    const stopwatchSeconds = document.getElementById('stopwatch-seconds');
    const stopwatchMilliseconds = document.getElementById('stopwatch-milliseconds');
    const stopwatchStartBtn = document.getElementById('stopwatch-start');
    const stopwatchPauseBtn = document.getElementById('stopwatch-pause');
    const stopwatchLapBtn = document.getElementById('stopwatch-lap');
    const stopwatchResetBtn = document.getElementById('stopwatch-reset');
    const lapsContainer = document.getElementById('laps-container');

    // Top Controls
    const themeToggle = document.getElementById('theme-toggle');
    const muteToggle = document.getElementById('mute-toggle');

    // Timer Variables
    let timerInterval;
    let timerTimeLeft = 1500; // 25 minutes in seconds (default)
    let timerTotalTime = 1500; // For progress calculation
    let timerRunning = false;

    // Stopwatch Variables
    let stopwatchInterval;
    let stopwatchTime = 0;
    let stopwatchRunning = false;
    let lapCount = 0;

    // Sound Effects & Mute State
    let sounds = {};
    let isMuted = false; // Start with sound enabled
    try {
        if (typeof Howl !== 'undefined') {
            console.log('Initializing sound effects...');
            sounds = {
                tick: new Howl({ 
                    src: ['sounds/tick.mp3'], 
                    volume: 0.3,
                    preload: true,
                    onload: function() {
                        console.log('Tick sound loaded successfully');
                    },
                    onloaderror: function(id, err) {
                        console.error('Error loading tick sound:', err);
                    }
                }),
                beep: new Howl({ 
                    src: ['sounds/beep.mp3'], 
                    volume: 0.5,
                    preload: true,
                    onload: function() {
                        console.log('Beep sound loaded successfully');
                    },
                    onloaderror: function(id, err) {
                        console.error('Error loading beep sound:', err);
                    }
                }),
                lap: new Howl({ 
                    src: ['sounds/lap.mp3'], 
                    volume: 0.4,
                    preload: true,
                    onload: function() {
                        console.log('Lap sound loaded successfully');
                    },
                    onloaderror: function(id, err) {
                        console.error('Error loading lap sound:', err);
                    }
                })
            };
            console.log('Sound effects initialized.');
        } else {
            console.error("Howler.js not loaded. Sound effects disabled.");
            sounds = { tick: { play: () => {} }, beep: { play: () => {} }, lap: { play: () => {} } }; // Null sound objects
        }
    } catch (error) {
        console.error("Error initializing sound effects:", error);
        sounds = { tick: { play: () => {} }, beep: { play: () => {} }, lap: { play: () => {} } }; // Null sound objects
    }

    // Function to play sound only if not muted
    function playSound(soundName) {
        if (!isMuted && sounds[soundName] && typeof sounds[soundName].play === 'function') {
            try {
                sounds[soundName].play();
            } catch (e) {
                console.error(`Sound play error (${soundName}):`, e);
            }
        }
    }

    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            console.log('Theme toggle clicked');
            document.body.classList.toggle('light-theme');
            if (document.body.classList.contains('light-theme')) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }

    // Mute toggle functionality
    if (muteToggle) {
        muteToggle.addEventListener('click', function() {
            console.log('Mute toggle clicked');
            isMuted = !isMuted;
            if (isMuted) {
                muteToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                // Optionally stop all currently playing sounds if needed
                // Howler.stop(); // Uncomment if you want to stop sounds immediately
            } else {
                muteToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                playSound('beep'); // Play a sound to confirm unmute
            }
            console.log('Muted state:', isMuted);
        });
    }

    // Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Tab button clicked');
            const tabId = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- START: NEW Animation Logic ---
    const animationContainer = document.querySelector('.animation-container'); // Reference to the container
    const dotsContainer = document.getElementById('dots');
    const linesContainer = document.getElementById('lines-container');
    const frameElement = document.getElementById('frame'); // Use new ID
    const backgroundGlow = document.querySelector('.animation-container .background-glow');

    let animationIsRunning = false; // Separate state for animation loop
    let animationFrameId;
    let animationLineDirection = 1;
    let animationStartTime = Date.now(); // Initialize start time

    const animationDots = [];
    const animationLines = [];
    const animationNodes = []; // Restored
    const animationSlidingDots = []; // Restored
    let animationLineWrapper; // Declare here

    if (dotsContainer && linesContainer && frameElement && backgroundGlow) {
        console.log('Initializing NEW animation elements');

        // Create dots around the frame
        const dotsCount = 16; // 4 dots on each side
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            // Calculate position (Adjusted for 200px frame)
            const frameSize = 200;
            const dotSpacing = frameSize / 4; // 50px
            const offset = dotSpacing / 2; // 25px for centering between corners
            if (i < 4) { // Top
                dot.style.top = '-1.5px'; // Adjust for dot size
                dot.style.left = `${offset + i * dotSpacing - 1.5}px`;
            } else if (i < 8) { // Right
                dot.style.right = '-1.5px';
                dot.style.top = `${offset + (i - 4) * dotSpacing - 1.5}px`;
            } else if (i < 12) { // Bottom
                dot.style.bottom = '-1.5px';
                dot.style.left = `${offset + (11 - i) * dotSpacing - 1.5}px`;
            } else { // Left
                dot.style.left = '-1.5px';
                dot.style.top = `${offset + (15 - i) * dotSpacing - 1.5}px`;
            }
            dotsContainer.appendChild(dot);
            animationDots.push(dot);
            // Add pulse animation with delay
            setTimeout(() => {
                dot.classList.add('pulse');
            }, i * 200);
        }

        // Line animation setup
        const lineCount = 7; // Number of diagonal lines
        animationLineWrapper = document.createElement('div'); // Assign here
        animationLineWrapper.className = 'line-wrapper';
        linesContainer.appendChild(animationLineWrapper);

        // Create lines, nodes, and sliding dots
        for (let i = 0; i < lineCount; i++) {
            const line = document.createElement('div');
            line.className = 'line';
            line.style.width = '280px'; // Longer than the container to allow diagonal
            line.style.left = '-40px'; // Start before the container
            line.style.top = `${30 + i * 20}px`;
            line.style.transform = 'rotate(45deg)';
            animationLineWrapper.appendChild(line);
            animationLines.push(line);
            // Add glow effect with delay
            setTimeout(() => {
                line.classList.add('glow');
            }, i * 300);

            // Restore node creation
            const node = document.createElement('div');
            node.className = 'node';
            node.style.left = '0'; // Initial position set in animation loop
            node.style.top = `${30 + i * 20}px`; // Initial position set in animation loop
            linesContainer.appendChild(node); // Append to lines container
            animationNodes.push(node);

            // Restore sliding dot creation
            for (let j = 0; j < 2; j++) {
                const slidingDot = document.createElement('div');
                slidingDot.className = 'sliding-dot';
                slidingDot.dataset.lineIndex = i;
                slidingDot.dataset.dotIndex = j;
                slidingDot.style.opacity = 0.8;
                linesContainer.appendChild(slidingDot); // Append to lines container
                animationSlidingDots.push(slidingDot);
            }
        }

        function animateNew() {
            if (!animationIsRunning) return; // Use the dedicated animation state

            const elapsed = Date.now() - animationStartTime; // Keep elapsed for dot animation

            // Update dot positions
            for (let i = 0; i < lineCount; i++) {
                const speed = 1 + (i * 0.15);
                const progress = (elapsed / (120 / speed) + i * 20) % 280; // Cycle within 280px range
                const xPos = progress;
                const yPos = 30 + i * 20;

                // Simplified positioning from new code (relative to linesContainer)
                animationNodes[i].style.left = `${xPos}px`;
                animationNodes[i].style.top = `${yPos}px`;

                if (progress > 40 && progress < 160) {
                    animationNodes[i].classList.add('active');
                } else {
                    animationNodes[i].classList.remove('active');
                }
            }

            // Restore sliding dot animation logic (WITHOUT wrapper offset)
            animationSlidingDots.forEach(dot => {
                const lineIndex = parseInt(dot.dataset.lineIndex);
                const dotIndex = parseInt(dot.dataset.dotIndex);
                const lineLength = 280;
                const speed = 0.05 + (lineIndex * 0.01) + (dotIndex * 0.03);
                const offset = dotIndex * 180; // Offset from new code

                // Calculate progress along the line (0 to 1)
                let progress = ((elapsed * speed) % lineLength) / lineLength;
                progress = (progress + offset / lineLength) % 1; // Wrap progress with offset

                // Calculate position on diagonal line
                const lineX = -40 + progress * lineLength; // Position along the line's length
                const lineY = 30 + lineIndex * 20; // Base Y position of the line

                // Convert to absolute position considering rotation (Simplified)
                const angleRad = 45 * (Math.PI / 180);

                const dotX = lineX * Math.cos(angleRad) - lineY * Math.sin(angleRad); // Position without wrapper offset
                const dotY = lineX * Math.sin(angleRad) + lineY * Math.cos(angleRad); // Position without wrapper offset


                // Apply position relative to linesContainer
                dot.style.left = `${dotX}px`;
                dot.style.top = `${dotY}px`;

                // Basic visibility check (adjust bounds as needed for 200x200 frame)
                const frameSize = 200;
                 if (dotX >= -40 && dotX <= frameSize + 40 && dotY >= -40 && dotY <= frameSize + 40) { // Looser bounds
                     dot.style.opacity = '0.8';
                 } else {
                     dot.style.opacity = '0';
                 }
            });


            // Animate dots sequence (wave effect from new code)
            const dotCycleTime = 4000;
            const activeDotIndex = Math.floor((elapsed % dotCycleTime) / (dotCycleTime / dotsCount));
            animationDots.forEach((dot, index) => {
                const distance = (index - activeDotIndex + dotsCount) % dotsCount;
                const scale = distance <= 3 ? 1 + (3 - distance) * 0.5 : 1;
                dot.style.transform = `scale(${scale})`;
                const opacity = distance <= 3 ? 0.7 + (3 - distance) * 0.1 : 0.7;
                dot.style.opacity = opacity;
            });

            animationFrameId = requestAnimationFrame(animateNew); // Continue the loop
        }

        // Function to control animation play state
        function setAnimationPlayState(state) { // 'running' or 'paused'
            console.log(`Setting animation play state to: ${state}`);
            if (backgroundGlow) backgroundGlow.style.animationPlayState = state;
            if (animationLineWrapper) animationLineWrapper.style.animationPlayState = state;
            animationDots.forEach(dot => { if (dot) dot.style.animationPlayState = state; });
            animationLines.forEach(line => { if (line) line.style.animationPlayState = state; });
        }

        // Function to start the JS animation loop
        function startAnimationLoop() {
            if (!animationIsRunning) {
                console.log("Starting JS Animation Loop");
                animationIsRunning = true;
                animationStartTime = Date.now(); // Reset start time or adjust based on pause
                animateNew(); // Start the loop
            }
        }

        // Function to stop the JS animation loop
        function stopAnimationLoop() {
            if (animationIsRunning) {
                console.log("Stopping JS Animation Loop");
                animationIsRunning = false;
                cancelAnimationFrame(animationFrameId); // Stop the loop
            }
        }

        // Initial animation state setup (should be paused)
        setAnimationPlayState('paused');
        stopAnimationLoop(); // Ensure JS loop is initially stopped
        console.log('NEW Animation initialized');

    } else {
        console.error('NEW Animation elements not found!');
    }
    // --- END: NEW Animation Logic ---


    // Timer Functions
    function startTimer() {
        console.log('Start timer clicked');
        if (!timerRunning) {
            timerRunning = true;
            timerStartBtn.style.display = 'none';
            timerPauseBtn.style.display = 'inline-flex';
            if (timerDisplay) timerDisplay.classList.remove('paused');
            if (timerDisplay) timerDisplay.classList.add('running');
            appContainer.classList.remove('paused-state');

            // Start Animation
            setAnimationPlayState('running');
            startAnimationLoop();

            timerInterval = setInterval(() => {
                if (timerTimeLeft > 0) {
                    timerTimeLeft--;
                    updateTimerDisplay();
                    if (!isMuted && sounds.tick && typeof sounds.tick.play === 'function') { // Check mute state
                        playSound('tick');
                    }
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    timerStartBtn.style.display = 'inline-flex';
                    timerPauseBtn.style.display = 'none';
                    if (!isMuted && sounds.beep && typeof sounds.beep.play === 'function') { // Check mute state
                        playSound('beep');
                    }
                    flashTimerComplete();
                    // Stop Animation only if stopwatch isn't also running
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
            appContainer.classList.add('paused-state');
            // Pause Animation only if stopwatch isn't also running
            if (!stopwatchRunning) {
                setAnimationPlayState('paused');
                stopAnimationLoop();
            }
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
        appContainer.classList.remove('paused-state');
        updateTimerDisplay();
        // Stop Animation only if stopwatch isn't also running
        if (!stopwatchRunning) {
            setAnimationPlayState('paused');
            stopAnimationLoop();
        }
    }

    function setTimer(seconds) {
        console.log('Set timer to', seconds);
        timerTimeLeft = seconds;
        timerTotalTime = seconds;
        updateTimerDisplay();
        resetTimer(); // Reset also updates display and buttons and handles animation state
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

    // Stopwatch Functions
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
            appContainer.classList.remove('paused-state');
            const stopwatchControls = document.querySelectorAll('#stopwatch .control-btn');
            stopwatchControls.forEach(btn => { btn.classList.remove('paused-control'); });

            // Start Animation
            setAnimationPlayState('running');
            startAnimationLoop();

            const startTime = Date.now() - stopwatchTime;
            let lastSecond = Math.floor(stopwatchTime / 1000); // Track the last second
            
            stopwatchInterval = setInterval(() => {
                stopwatchTime = Date.now() - startTime;
                updateStopwatchDisplay();
                
                // Play tick sound only when seconds change
                const currentSecond = Math.floor(stopwatchTime / 1000);
                if (currentSecond !== lastSecond) {
                    lastSecond = currentSecond;
                    playSound('tick'); // Use playSound function
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
            appContainer.classList.add('paused-state');
            const stopwatchControls = document.querySelectorAll('#stopwatch .control-btn');
            stopwatchControls.forEach(btn => { btn.classList.add('paused-control'); });

            // Pause Animation only if timer isn't also running
            if (!timerRunning) {
                setAnimationPlayState('paused');
                stopAnimationLoop();
            }
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
        appContainer.classList.remove('paused-state');
        const stopwatchControls = document.querySelectorAll('#stopwatch .control-btn');
        stopwatchControls.forEach(btn => { btn.classList.remove('paused-control'); });
        updateStopwatchDisplay();
        if (lapsContainer) lapsContainer.innerHTML = '';
        lapCount = 0;

        // Stop Animation only if timer isn't also running
        if (!timerRunning) {
            setAnimationPlayState('paused');
            stopAnimationLoop();
        }
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
            if (!isMuted && sounds.lap && typeof sounds.lap.play === 'function') { // Check mute state
                playSound('lap');
            }
            lapItem.style.animation = 'contentFadeIn 0.3s forwards'; // Use existing fade-in
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

    // Event Listeners
    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerPauseBtn) timerPauseBtn.addEventListener('click', pauseTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

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

    // Add click sound to all buttons except lap button
    const allButtons = document.querySelectorAll('button:not(#stopwatch-lap)');
    allButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSound('beep'); // Use playSound function
        });
    });
    
    // Initialize displays
    updateTimerDisplay();
    updateStopwatchDisplay();

    console.log('Initialization complete');
});
