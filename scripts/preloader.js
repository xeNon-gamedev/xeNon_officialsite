(async () => {
    const body = document.body;
    if (!body) {
        return;
    }

    const resolvePreloader = async () => {
        let element = document.querySelector('[data-preloader]');
        if (element) {
            return element;
        }

        try {
            const response = await fetch('/components/preloader.html', { credentials: 'same-origin' });
            if (!response.ok) {
                throw new Error(`Failed to load preloader component: ${response.status}`);
            }
            const html = await response.text();
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            const wrapper = template.content.firstElementChild;
            if (!wrapper) {
                return null;
            }
            body.insertBefore(template.content, body.firstChild);
            element = wrapper;
        } catch (error) {
            console.error(error);
            element = null;
        }

        return element;
    };

    body.setAttribute('data-preload-state', 'loading');
    const preloader = await resolvePreloader();

    if (!preloader) {
        body.removeAttribute('data-preload-state');
        return;
    }

    const progressBar = preloader.querySelector('[data-preloader-progress]');
    const progressValue = preloader.querySelector('[data-preloader-value]');
    const srStatus = preloader.querySelector('[data-preloader-status]');
    const preloadMessageHolder = preloader.querySelector('#preloader-message');
    const preloadMessages = [
        'サイトを読み込み中...',
        'Hello World!',
        'Presents By xe-Non',
        'このメッセージ、変わるんですよ!',
        '次のゲームのタイトルは、化学に関係します。',
        '変なゲームばかり作っているわけじゃないですよ!!!',
        'このゲーム制作チームは(良くも悪くも)個性が豊かです!',
        '多分思想が左に寄っています...',
        '制作ペースが結構遅い...',
        '一応6人いますが、全然制作スピードが上がりません...',
        'メッセージって何書けばいいんでしょうか...',

        'ここに表示されるメッセージは全部で12個あります。'
    ];

    if (preloadMessageHolder) {
        const index = Math.floor(Math.random() * preloadMessages.length);
        preloadMessageHolder.textContent = preloadMessages[index];
    }

    let isLoaded = false;
    let isCompleted = false;
    let displayedProgress = 0;
    let cleanupTimer = null;

    const toPositiveNumber = (value, fallback) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    };

    const minimumDuration = toPositiveNumber(preloader.dataset.minDuration, 500);
    const fadeOutGrace = toPositiveNumber(preloader.dataset.fadeGrace, 600);

    const startTime = performance.now();

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function setProgress(value) {
        const clamped = clamp(value, 0, 100);
        displayedProgress = clamped;
        if (progressBar) {
            progressBar.style.width = `${clamped}%`;
        }
        if (progressValue) {
            progressValue.textContent = String(Math.round(clamped));
        }
        if (srStatus) {
            srStatus.textContent = `読み込み ${Math.round(clamped)}% 完了`;
        }
    }

    function removePreloader() {
        if (cleanupTimer !== null) {
            window.clearTimeout(cleanupTimer);
            cleanupTimer = null;
        }
        preloader.remove();
        body.removeAttribute('data-preload-state');
    }

    function finalize() {
        if (isCompleted) {
            return;
        }
        isCompleted = true;
        setProgress(100);
        preloader.setAttribute('data-preloader-complete', 'true');
        preloader.setAttribute('aria-hidden', 'true');
        preloader.setAttribute('aria-busy', 'false');
        body.setAttribute('data-preload-state', 'ready');

        window.clearTimeout(fallbackTimer);

        const handleTransitionEnd = (event) => {
            if (event.target === preloader && event.propertyName === 'opacity') {
                removePreloader();
            }
        };

        preloader.addEventListener('transitionend', handleTransitionEnd, { once: true });

        cleanupTimer = window.setTimeout(() => {
            preloader.removeEventListener('transitionend', handleTransitionEnd);
            removePreloader();
        }, fadeOutGrace);
    }

    function tick(now) {
        if (isCompleted) {
            return;
        }

        const elapsed = now - startTime;
        const easing = isLoaded ? 0.32 : 0.1;
        const target = isLoaded
            ? 100
            : clamp((elapsed / minimumDuration) * 100, 0, 96);
        const nextValue = displayedProgress + (target - displayedProgress) * easing + 0.3;
        setProgress(nextValue);

        if (isLoaded && displayedProgress >= 99.6) {
            finalize();
            return;
        }

        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);

    window.addEventListener('load', () => {
        isLoaded = true;
    });

    const fallbackDelay = Math.max(minimumDuration + 800, 2600);
    const fallbackTimer = window.setTimeout(() => {
        isLoaded = true;
        window.requestAnimationFrame(tick);
    }, fallbackDelay);

    preloader.setAttribute('aria-busy', 'true');
    preloader.setAttribute('aria-live', 'polite');
})();
