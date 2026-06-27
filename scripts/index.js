const PATTERNS = {
    box: {
        label: 'Box 4-4-4-4',
        desc: 'Equilibrado — inspira, segura, expira e segura por 4s cada',
        phases: [
            { label: 'Inspire', duration: 4, scale: 1.3 },
            { label: 'Segure', duration: 4, scale: 1.3 },
            { label: 'Expire', duration: 4, scale: 1 },
            { label: 'Segure', duration: 4, scale: 1 },
        ],
    },
    '478': {
        label: '4-7-8',
        desc: 'Relaxamento profundo — inspira 4s, segura 7s, expira 8s',
        phases: [
            { label: 'Inspire', duration: 4, scale: 1.3 },
            { label: 'Segure', duration: 7, scale: 1.3 },
            { label: 'Expire', duration: 8, scale: 1 },
        ],
    },
    simple: {
        label: '4-4',
        desc: 'Simples e direto — inspira 4s, expira 4s sem pausas',
        phases: [
            { label: 'Inspire', duration: 4, scale: 1.3 },
            { label: 'Expire', duration: 4, scale: 1 },
        ],
    },
};

const PARTICLE_COLORS = [
    'rgba(200, 230, 200,',
    'rgba(180, 210, 150,',
    'rgba(230, 220, 180,',
    'rgba(210, 235, 210,',
    'rgba(220, 225, 190,',
];

const FLOAT_ANIMS = ['float-a', 'float-b', 'float-c'];

const STATUS = Object.freeze({
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    FINISHED: 'finished',
});

const timerEl = document.getElementById('timer');
const circleEl = document.getElementById('circle');
const phaseEl = document.getElementById('phase');
const patternsEl = document.getElementById('patterns');
const durationsEl = document.getElementById('durations');
const descEl = document.getElementById('patternDesc');
const btnStart = document.getElementById('btnStart');
const btnReset = document.getElementById('btnReset');
const particlesEl = document.getElementById('particles');

let pattern = 'box';
let duration = 300;
let timeLeft = duration;
let status = STATUS.IDLE;
let phaseIndex = 0;
let phaseTimeout = null;
let sessionInterval = null;
let phaseStartTime = 0;
let phaseTotalDuration = 0;
let phaseRemaining = 0;

function pad(n) {
    return String(n).padStart(2, '0');
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerEl.textContent = `${pad(mins)}:${pad(secs)}`;
}

function setPhase(text) {
    phaseEl.style.opacity = '0';
    setTimeout(() => {
        phaseEl.textContent = text;
        phaseEl.style.opacity = '1';
    }, 250);
}

function setControlsEnabled(enabled) {
    patternsEl.querySelectorAll('button').forEach(b => (b.disabled = !enabled));
    durationsEl.querySelectorAll('button').forEach(b => (b.disabled = !enabled));
}

function runPhase(customDuration) {
    if (status !== STATUS.RUNNING) return;

    const phases = PATTERNS[pattern].phases;
    const phase = phases[phaseIndex];
    const dur = customDuration !== undefined ? customDuration : phase.duration;

    setPhase(phase.label);
    circleEl.style.transition = `transform ${dur}s linear`;
    circleEl.style.transform = `scale(${phase.scale})`;

    phaseStartTime = Date.now();
    phaseTotalDuration = dur;

    phaseTimeout = setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        runPhase();
    }, dur * 1000);
}

function startTimer() {
    sessionInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) finish();
    }, 1000);
}

function start() {
    status = STATUS.RUNNING;
    timeLeft = duration;
    phaseIndex = 0;
    updateTimerDisplay();

    btnStart.textContent = 'Pausar';
    setControlsEnabled(false);
    runPhase();
    startTimer();
}

function pause() {
    status = STATUS.PAUSED;
    clearTimeout(phaseTimeout);
    clearInterval(sessionInterval);

    const computed = getComputedStyle(circleEl).transform;
    circleEl.style.transition = 'none';
    circleEl.style.transform = computed;

    const elapsed = (Date.now() - phaseStartTime) / 1000;
    phaseRemaining = Math.max(0, phaseTotalDuration - elapsed);

    btnStart.textContent = 'Retomar';
}

function resume() {
    status = STATUS.RUNNING;
    btnStart.textContent = 'Pausar';
    runPhase(phaseRemaining);
    startTimer();
}

function finish() {
    status = STATUS.FINISHED;
    clearTimeout(phaseTimeout);
    clearInterval(sessionInterval);

    phaseRemaining = 0;
    timeLeft = 0;
    updateTimerDisplay();
    setPhase('Concluído');

    circleEl.style.transition = 'transform 0.8s ease';
    circleEl.style.transform = 'scale(1)';

    btnStart.textContent = 'Recomeçar';
    setControlsEnabled(true);
}

function reset() {
    status = STATUS.IDLE;
    timeLeft = duration;
    phaseIndex = 0;
    phaseRemaining = 0;

    clearTimeout(phaseTimeout);
    clearInterval(sessionInterval);

    updateTimerDisplay();
    setPhase('Inspire');

    circleEl.style.transition = 'transform 0.6s ease';
    circleEl.style.transform = 'scale(1)';

    btnStart.textContent = 'Iniciar';
    setControlsEnabled(true);
}

function createParticles() {
    for (let i = 0; i < 28; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = 2.5 + Math.random() * 5.5;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
        const opacity = (0.06 + Math.random() * 0.16).toFixed(2);
        const anim = FLOAT_ANIMS[Math.floor(Math.random() * FLOAT_ANIMS.length)];
        const animDuration = 14 + Math.random() * 20;
        const animDelay = Math.random() * 18;
        const left = Math.random() * 100;

        Object.assign(particle.style, {
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: `${color} ${opacity})`,
            boxShadow: `0 0 ${size * 3.5}px ${color} ${opacity})`,
            animationName: anim,
            animationDuration: `${animDuration}s`,
            animationDelay: `${animDelay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            left: `${left}%`,
            bottom: '-6%',
        });

        particlesEl.appendChild(particle);
    }
}

function bindEvents() {
    patternsEl.addEventListener('click', e => {
        if (status !== STATUS.IDLE) return;
        const chip = e.target.closest('[data-pattern]');
        if (!chip) return;
        pattern = chip.dataset.pattern;
        patternsEl.querySelectorAll('[data-pattern]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        descEl.textContent = PATTERNS[pattern].desc;
    });

    durationsEl.addEventListener('click', e => {
        if (status !== STATUS.IDLE) return;
        const chip = e.target.closest('[data-duration]');
        if (!chip) return;
        duration = parseInt(chip.dataset.duration, 10);
        timeLeft = duration;
        durationsEl.querySelectorAll('[data-duration]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateTimerDisplay();
    });

    btnStart.addEventListener('click', () => {
        if (status === STATUS.IDLE || status === STATUS.FINISHED) start();
        else if (status === STATUS.RUNNING) pause();
        else if (status === STATUS.PAUSED) resume();
    });

    btnReset.addEventListener('click', reset);
}

function init() {
    updateTimerDisplay();
    descEl.textContent = PATTERNS[pattern].desc;
    createParticles();
    bindEvents();
}

init();
