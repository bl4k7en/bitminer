// ==================== BITMINER v1.2 ====================

document.addEventListener('selectstart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

// Game state
const defaultGame = {
    bits: 0,
    totalMined: 0,
    clickPower: 1,
    clicks: 0,
    spacebarClicks: 0,
    time: 0,
    prestige: 0,
    lastSaveTime: Date.now(),
    sessionPrestiges: 0,
    sessionStart: Date.now(),
    clickTimes: [],
    footerClicks: 0,
    rankBadgeClicks: 0,
    holdStart: 0,
    highestBitsWithoutBuying: 0,
    totalWorkersBought: 0,
    biggestSingleGain: 0,
    fastestMillionTime: 0,
    peakBitsPerSecond: 0,
    longestSession: 0,
    timesPrestiged: 0,
    rarestBitFound: '',
    workers: {
        bot: {name: 'Mining Bot', icon: '⚙️', count: 0, baseCost: 50, rate: 1, costMult: 1.15},
        coder: {name: 'Code Monkey', icon: '🐵', count: 0, baseCost: 500, rate: 5, costMult: 1.15},
        script: {name: 'Auto Script', icon: '📜', count: 0, baseCost: 5000, rate: 25, costMult: 1.15},
        farm: {name: 'Click Farm', icon: '🏭', count: 0, baseCost: 50000, rate: 120, costMult: 1.15},
        factory: {name: 'Bit Factory', icon: '🏢', count: 0, baseCost: 500000, rate: 600, costMult: 1.15},
        mine: {name: 'Deep Mine', icon: '⛏️', count: 0, baseCost: 5000000, rate: 3000, costMult: 1.15},
        rig: {name: 'Mega Rig', icon: '🔧', count: 0, baseCost: 50000000, rate: 15000, costMult: 1.15},
        ai: {name: 'AI Miner', icon: '🤖', count: 0, baseCost: 500000000, rate: 75000, costMult: 1.15}
    },
    secretWorkers: {
        mystery: {name: '??? Worker', icon: '❓', count: 0, baseCost: 5000000000, rate: 100000, costMult: 1.2, unlocked: false},
        developer: {name: 'The Developer', icon: '👨‍💻', count: 0, baseCost: 1000000000, rate: 1000000, costMult: 1.25, unlocked: false},
        quantum: {name: 'Quantum Miner', icon: '⚛️', count: 0, baseCost: 10000000000, rate: 500000, costMult: 1.3, unlocked: false}
    },
    achievements: {},
    rareBits: {diamond: 0, ruby: 0, emerald: 0, rainbow: 0},
    theme: 'default',
    unlockedThemes: ['default'],
    clickSkin: '💎',
    unlockedSkins: ['💎'],
    rainbowRank: false,
    rankIndex: 0,
    log: []
};

const game = JSON.parse(JSON.stringify(defaultGame));

// Achievements
const achievements = {
    firstClick: {name: 'First Steps', desc: 'Click 1 time', icon: '👆', requirement: () => game.clicks >= 1, reward: 5},
    clicker: {name: 'Clicker', desc: 'Click 100 times', icon: '🖱️', requirement: () => game.clicks >= 100, reward: 5},
    clickMaster: {name: 'Click Master', desc: 'Click 1,000 times', icon: '⚡', requirement: () => game.clicks >= 1000, reward: 10},
    clickGod: {name: 'Click God', desc: 'Click 10,000 times', icon: '👑', requirement: () => game.clicks >= 10000, reward: 15},
    spacebarWarrior: {name: 'Spacebar Warrior', desc: 'Farm 1,000 bits with spacebar', icon: '⌨️', requirement: () => game.spacebarClicks >= 1000, reward: 50},
    firstWorker: {name: 'Hired Help', desc: 'Hire your first worker', icon: '⚙️', requirement: () => Object.values(game.workers).some(w => w.count > 0), reward: 5},
    automation: {name: 'Automation', desc: 'Have 10 total workers', icon: '🤖', requirement: () => Object.values(game.workers).reduce((s, w) => s + w.count, 0) >= 10, reward: 10},
    workforce: {name: 'Workforce', desc: 'Have 50 total workers', icon: '🏭', requirement: () => Object.values(game.workers).reduce((s, w) => s + w.count, 0) >= 50, reward: 15},
    empire: {name: 'Empire', desc: 'Have 100 total workers', icon: '🌐', requirement: () => Object.values(game.workers).reduce((s, w) => s + w.count, 0) >= 100, reward: 25},
    megaCorp: {name: 'Mega Corp', desc: 'Have 500 total workers', icon: '🏰', requirement: () => Object.values(game.workers).reduce((s, w) => s + w.count, 0) >= 500, reward: 50},
    earlyMiner: {name: 'Early Miner', desc: 'Mine 10K Bits', icon: '⛏️', requirement: () => game.totalMined >= 10000, reward: 5},
    miner: {name: 'Miner', desc: 'Mine 100K Bits', icon: '💎', requirement: () => game.totalMined >= 100000, reward: 10},
    millionaire: {name: 'Millionaire', desc: 'Mine 1M Bits', icon: '💰', requirement: () => game.totalMined >= 1000000, reward: 20},
    billionaire: {name: 'Billionaire', desc: 'Mine 1B Bits', icon: '💵', requirement: () => game.totalMined >= 1000000000, reward: 50},
    trillionaire: {name: 'Trillionaire', desc: 'Mine 1T Bits', icon: '🏦', requirement: () => game.totalMined >= 1000000000000, reward: 100},
    dedicated: {name: 'Dedicated', desc: 'Play for 1 hour', icon: '⏰', requirement: () => game.time >= 3600, reward: 15},
    marathon: {name: 'Marathon', desc: 'Play for 3 hours', icon: '🏃', requirement: () => game.time >= 10800, reward: 25},
    ascended: {name: 'Ascended', desc: 'Ascend once', icon: '🌟', requirement: () => game.prestige >= 1, reward: 50},
    enlightened: {name: 'Enlightened', desc: 'Reach Ascension 3', icon: '✨', requirement: () => game.prestige >= 3, reward: 100},
    transcended: {name: 'Transcended', desc: 'Reach Ascension 10', icon: '🔆', requirement: () => game.prestige >= 10, reward: 200},
    trueMiner: {name: 'True Miner', desc: 'Reach God Rank', icon: '🏆', requirement: () => game.rankIndex >= 9, reward: 500},
    speedrunner: {name: 'Speedrunner', desc: 'Get 1M bits in under 5 min', icon: '⚡', requirement: () => game.totalMined >= 1000000 && game.time <= 300, reward: 100, secret: true},
    idleLegend: {name: 'Idle Legend', desc: 'Get 1M bits without clicking', icon: '😴', requirement: () => game.totalMined >= 1000000 && game.clicks === 0, reward: 150, secret: true},
    starCatcher: {name: 'Star Catcher', desc: 'Catch a golden star', icon: '⭐', requirement: () => false, reward: 75, secret: true},
    nightOwl: {name: 'Night Owl', desc: 'Play between 2-4 AM', icon: '🦉', requirement: () => {
        const h = new Date().getHours();
        return h >= 2 && h < 4;
    }, reward: 50, secret: true},
    weekender: {name: 'Weekender', desc: 'Play on weekend', icon: '🎉', requirement: () => {
        const d = new Date().getDay();
        return d === 0 || d === 6;
    }, reward: 30, secret: true},
    newYear: {name: "New Year's Eve", desc: 'Play on Dec 31', icon: '🎆', requirement: () => {
        const now = new Date();
        return now.getMonth() === 11 && now.getDate() === 31;
    }, reward: 100, secret: true},
    theGlitch: {name: 'The Glitch', desc: 'Click 100 times in 10 sec', icon: '👾', requirement: () => {
        if (game.clickTimes.length < 100) return false;
        const recent = game.clickTimes.slice(-100);
        return (recent[recent.length - 1] - recent[0]) < 10000;
    }, reward: 200, secret: true},
    hoarder: {name: 'Hoarder', desc: 'Reach 1B bits without buying', icon: '💼', requirement: () => game.highestBitsWithoutBuying >= 1000000000, reward: 300, secret: true},
    philanthropist: {name: 'Philanthropist', desc: 'Prestige 5 times in one session', icon: '🎁', requirement: () => game.sessionPrestiges >= 5, reward: 250, secret: true},
    patience: {name: 'Patience', desc: 'Hold click for 30 seconds', icon: '⏳', requirement: () => false, reward: 100, secret: true},
    chainReaction: {name: 'Chain Reaction', desc: 'Click 10 times in 1 second', icon: '⚡', requirement: () => {
        if (game.clickTimes.length < 10) return false;
        const recent = game.clickTimes.slice(-10);
        return (recent[recent.length - 1] - recent[0]) < 1000;
    }, reward: 25, secret: true},
    machineGun: {name: 'Machine Gun', desc: 'Click 50 times in 5 seconds', icon: '🔫', requirement: () => {
        if (game.clickTimes.length < 50) return false;
        const recent = game.clickTimes.slice(-50);
        return (recent[recent.length - 1] - recent[0]) < 5000;
    }, reward: 50, secret: true},
    fingerDestroyer: {name: 'Finger Destroyer', desc: 'Click 500 times in one session', icon: '💪', requirement: () => game.clicks >= 500, reward: 75, secret: true},
    noLife: {name: 'No Life', desc: 'Click 10,000 times total', icon: '🎮', requirement: () => game.clicks >= 10000, reward: 100, secret: true},
    midnightMiner: {name: 'Midnight Miner', desc: 'Play at exactly midnight', icon: '🌙', requirement: () => {
        const now = new Date();
        return now.getHours() === 0 && now.getMinutes() === 0;
    }, reward: 50, secret: true},
    earlyBird: {name: 'Early Bird', desc: 'Play at 6 AM', icon: '🐦', requirement: () => {
        const h = new Date().getHours();
        return h === 6;
    }, reward: 30, secret: true},
    rushHour: {name: 'Rush Hour', desc: 'Play during 5-7 PM', icon: '🚗', requirement: () => {
        const h = new Date().getHours();
        return h >= 17 && h < 19;
    }, reward: 20, secret: true},
    allNighter: {name: 'All Nighter', desc: 'Play for 6 hours straight', icon: '☕', requirement: () => game.time >= 21600, reward: 200, secret: true},
    happyNewYear: {name: 'Happy New Year', desc: 'Play on January 1st', icon: '🎊', requirement: () => {
        const now = new Date();
        return now.getMonth() === 0 && now.getDate() === 1;
    }, reward: 75, secret: true},
    piDay: {name: 'Pi Day', desc: 'Play on March 14th', icon: '🥧', requirement: () => {
        const now = new Date();
        return now.getMonth() === 2 && now.getDate() === 14;
    }, reward: 31, secret: true},
    spookyMiner: {name: 'Spooky Miner', desc: 'Play on Halloween', icon: '🎃', requirement: () => {
        const now = new Date();
        return now.getMonth() === 9 && now.getDate() === 31;
    }, reward: 100, secret: true},
    millionaireTwice: {name: 'Millionaire Twice', desc: 'Reach 1M, prestige, reach 1M again', icon: '💸', requirement: () => game.prestige >= 1 && game.totalMined >= 1000000, reward: 150, secret: true},
    brokeAgain: {name: 'Broke Again', desc: 'Reach exactly 0 bits after having 1M+', icon: '💔', requirement: () => false, reward: 100, secret: true},
    theCollector: {name: 'The Collector', desc: 'Unlock all 8 click skins', icon: '🎨', requirement: () => game.unlockedSkins.length >= 8, reward: 200, secret: true},
    rainbowCollector: {name: 'Rainbow Collector', desc: 'Collect 1 of each rare bit', icon: '🌈', requirement: () => {
        return game.rareBits.diamond >= 1 && game.rareBits.ruby >= 1 && game.rareBits.emerald >= 1 && game.rareBits.rainbow >= 1;
    }, reward: 150, secret: true},
    workerArmy: {name: 'Worker Army', desc: 'Have at least 1 of every worker', icon: '👥', requirement: () => {
        return Object.values(game.workers).every(w => w.count > 0);
    }, reward: 100, secret: true}
};

// Ranks
const ranks = [
    {name: 'Initiate', req: 0, bonus: 0},
    {name: 'Apprentice', req: 1000, bonus: 5},
    {name: 'Technician', req: 10000, bonus: 10},
    {name: 'Engineer', req: 100000, bonus: 20},
    {name: 'Architect', req: 1000000, bonus: 30},
    {name: 'Master', req: 10000000, bonus: 50},
    {name: 'Overlord', req: 100000000, bonus: 75},
    {name: 'Titan', req: 1000000000, bonus: 100},
    {name: 'Legend', req: 10000000000, bonus: 150},
    {name: 'God', req: 100000000000, bonus: 250},
    {name: 'Transcendent', req: 1000000000000, bonus: 400},
    {name: 'Omniscient', req: 10000000000000, bonus: 600},
    {name: 'Infinite', req: 100000000000000, bonus: 1000},
    {name: 'Eternal', req: 1000000000000000, bonus: 1500}
];

const rankColors = ['#444', '#6c432b', '#e108e9', '#fff', '#1cb992', '#5bb91c', '#008fff', '#ff9900', '#ff00ff', '#ffd700', '#00ffff', '#ff00ff', '#ffffff', '#ffd700'];

// Themes
const themes = [
    {id: 'default', name: 'Default', locked: false},
    {id: 'matrix', name: 'Matrix', locked: true, unlockAchievement: 'theGlitch'},
    {id: 'neon', name: 'Neon', locked: true, unlockAchievement: 'trueMiner'},
    {id: 'retro', name: 'Retro', locked: true, unlockAchievement: 'transcended'}
];

// Click Skins
const clickSkins = [
    {icon: '💎', name: 'Diamond', locked: false},
    {icon: '🔷', name: 'Blue Gem', locked: true, requirement: 50000},
    {icon: '🔶', name: 'Orange Gem', locked: true, requirement: 500000},
    {icon: '💠', name: 'Crystal', locked: true, requirement: 5000000},
    {icon: '✨', name: 'Sparkle', locked: true, requirement: 50000000},
    {icon: '⭐', name: 'Star', locked: true, requirement: 500000000},
    {icon: '🌟', name: 'Glowing Star', locked: true, requirement: 5000000000},
    {icon: '💫', name: 'Dizzy', locked: true, requirement: 50000000000}
];

// Rare Bits - Balanced Drop Rates
const rareBitTypes = [
    {name: 'diamond', icon: '💎', color: '#00ffff', dropRate: 0.15, max: 100, bonus: 5},
    {name: 'ruby', icon: '♦️', color: '#ff0000', dropRate: 0.07, max: 50, bonus: 10},
    {name: 'emerald', icon: '💚', color: '#00ff00', dropRate: 0.02, max: 10, bonus: 25},
    {name: 'rainbow', icon: '🌈', color: '#ff00ff', dropRate: 0.005, max: 1, bonus: 100}
];

let goldenBitActive = false;

// ==================== BIT EXPLOSION ====================
function spawnBitExplosion() {
    const container = document.getElementById('bit-explosion');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const bit = document.createElement('div');
        bit.className = 'falling-bit';
        bit.textContent = '💎';
        bit.style.left = `${Math.random() * 100}%`;
        bit.style.top = '0%';
        bit.style.fontSize = `${20 + Math.random() * 20}px`;
        bit.style.animationDelay = `${Math.random() * 0.3}s`;
        bit.style.animationDuration = `${1 + Math.random() * 1}s`;
        
        container.appendChild(bit);
        setTimeout(() => bit.remove(), 2500);
    }
}

// ==================== GOLDEN BIT ====================
function spawnGoldenBit() {
    if (goldenBitActive) return;
    goldenBitActive = true;
    
    const golden = document.createElement('div');
    golden.className = 'golden-bit';
    golden.textContent = '✨';
    golden.style.top = `${Math.random() * 80 + 10}%`;
    document.body.appendChild(golden);
    
    const timeout = setTimeout(() => {
        golden.remove();
        goldenBitActive = false;
    }, 3000);
    
    golden.addEventListener('click', () => {
        clearTimeout(timeout);
        const gain = Math.floor(game.clickPower * getMulti() * 1000);
        game.bits += gain;
        game.totalMined += gain;
        showFloatingNumber(gain, window.innerWidth / 2, window.innerHeight / 2, false, true);
        log('✨ GOLDEN BIT! +' + fmt(gain));
        notify('GOLDEN BIT CAUGHT!', 'secret');
        
        // Star Catcher Achievement
        if (!game.achievements.starCatcher) {
            game.achievements.starCatcher = true;
            log('🏆 Star Catcher');
            notify('🏆 Star Catcher (+75%)', 'secret');
            updateAchievements();
        }
        
        golden.remove();
        goldenBitActive = false;
    });
}

// ==================== RARE BITS ====================
function spawnRareBit() {
    const type = rareBitTypes.find(t => {
        if (game.rareBits[t.name] >= t.max) return false;
        return Math.random() < t.dropRate;
    });
    
    if (!type) return;
    
    const rare = document.createElement('div');
    rare.className = 'rare-bit';
    rare.textContent = type.icon;
    rare.style.left = `${Math.random() * 90 + 5}%`;
    rare.style.color = type.color;
    document.body.appendChild(rare);
    
    const timeout = setTimeout(() => {
        rare.remove();
    }, 3000);
    
    rare.addEventListener('click', () => {
        clearTimeout(timeout);
        game.rareBits[type.name]++;
        
        if (!game.rarestBitFound || rareBitTypes.find(t => t.name === type.name).dropRate < rareBitTypes.find(t => t.name === game.rarestBitFound)?.dropRate || 1) {
            game.rarestBitFound = type.name;
        }
        
        log(`${type.icon} ${type.name.toUpperCase()} BIT!`);
        notify(`${type.name.toUpperCase()} Bit collected!`, 'secret');
        rare.remove();
        updateRareBitsDisplay();
        update();
    });
}

function updateRareBitsDisplay() {
    const container = document.getElementById('rare-bits-collection');
    if (!container) return;
    
    container.innerHTML = '';
    rareBitTypes.forEach(type => {
        const div = document.createElement('div');
        div.className = 'collection-item';
        const count = game.rareBits[type.name] || 0;
        const bonus = count * type.bonus;
        div.innerHTML = `
            <div class="collection-icon">${type.icon}</div>
            <div class="collection-count">${count}/${type.max}</div>
            <div class="collection-bonus">+${bonus}%</div>
        `;
        container.appendChild(div);
    });
}

// ==================== FIREWORKS ====================
function spawnFirework(x, y, color) {
    const container = document.getElementById('firework-container');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.animation = 'firework-explode 1s ease-out forwards';
        
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function checkNewYearFireworks() {
    const now = new Date();
    if (now.getMonth() === 11 && now.getDate() === 31) {
        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.5;
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            spawnFirework(x, y, color);
        }, 1000);
    }
}

// ==================== HELPER FUNCTIONS ====================
function mergeSaveWithDefaults(loaded, defaults) {
    const merged = JSON.parse(JSON.stringify(defaults));
    for (let key in loaded) {
        if (typeof loaded[key] === 'object' && !Array.isArray(loaded[key]) && loaded[key] !== null) {
            if (typeof merged[key] === 'object') {
                merged[key] = mergeSaveWithDefaults(loaded[key], merged[key]);
            } else {
                merged[key] = loaded[key];
            }
        } else {
            merged[key] = loaded[key];
        }
    }
    return merged;
}

function fmt(n) {
    if (n < 1e6) {
        return Math.floor(n).toLocaleString('en');
    }
    if (n < 1e9) return (n/1e6).toFixed(3).replace(/\.?0+$/, '') + 'M';
    if (n < 1e12) return (n/1e9).toFixed(3).replace(/\.?0+$/, '') + 'B';
    if (n < 1e15) return (n/1e12).toFixed(3).replace(/\.?0+$/, '') + 'T';
    return (n/1e15).toFixed(3).replace(/\.?0+$/, '') + 'Q';
}

function fmtTime(s) {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function getAchievementBonus() {
    let total = 0;
    if (!game.achievements) game.achievements = {};
    Object.entries(achievements).forEach(([key, ach]) => {
        if (game.achievements[key]) total += ach.reward;
    });
    return total;
}

function getRareBitsBonus() {
    let total = 0;
    rareBitTypes.forEach(type => {
        total += (game.rareBits[type.name] || 0) * type.bonus;
    });
    return total;
}

function getRankBonus() {
    return ranks[game.rankIndex]?.bonus || 0;
}

function getMulti() {
    let bonusPercent = 0;
    bonusPercent += getAchievementBonus();
    bonusPercent += getRankBonus();
    bonusPercent += getRareBitsBonus();
    bonusPercent += game.prestige * 10;
    
    const hour = new Date().getHours();
    if (hour >= 2 && hour < 4 && game.achievements.nightOwl) {
        bonusPercent += 100;
    }
    
    const day = new Date().getDay();
    if ((day === 0 || day === 6) && game.achievements.weekender) {
        bonusPercent += 50;
    }
    
    return 1 + (bonusPercent / 100);
}

function getWorkerRate() {
    let total = 0;
    if (game.workers) {
        Object.values(game.workers).forEach(w => {
            total += w.count * w.rate;
        });
    }
    if (game.secretWorkers) {
        Object.values(game.secretWorkers).forEach(w => {
            if (w.unlocked) {
                if (w.name === 'Quantum Miner') {
                    total += w.count * (Math.random() * 1000000);
                } else {
                    total += w.count * w.rate;
                }
            }
        });
    }
    return total * getMulti();
}

function log(msg) {
    const time = new Date().toLocaleTimeString('en-US', {hour12: false});
    if (!game.log) game.log = [];
    game.log.unshift({time, msg});
    if (game.log.length > 5) game.log = game.log.slice(0, 5);
    updateLog();
}

function notify(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = 'notification ' + type;
    div.textContent = msg;
    const container = document.getElementById('notifications');
    if (container) container.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function showFloatingNumber(amount, x, y, isCrit = false, isGolden = false) {
    const div = document.createElement('div');
    div.className = 'floating-number' + (isCrit ? ' crit' : '') + (isGolden ? ' golden' : '');
    div.textContent = '+' + fmt(amount);
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1000);
}

function screenShake() {
    document.body.style.animation = 'shake 0.3s';
    setTimeout(() => document.body.style.animation = '', 300);
}

function checkAchievements() {
    if (!game.achievements) game.achievements = {};
    
    Object.entries(achievements).forEach(([key, ach]) => {
        if (!game.achievements[key] && ach.requirement()) {
            game.achievements[key] = true;
            log('🏆 ' + ach.name);
            notify('🏆 ' + ach.name + ' (+' + ach.reward + '%)', ach.secret ? 'secret' : 'achievement');
            
            if (key === 'theGlitch') {
                unlockTheme('matrix');
                log('🎨 MATRIX THEME UNLOCKED!');
            }
            
            updateAchievements();
        }
    });
}

function unlockTheme(themeId) {
    if (!game.unlockedThemes.includes(themeId)) {
        game.unlockedThemes.push(themeId);
        updateThemeSelector();
        notify(`Theme unlocked: ${themeId.toUpperCase()}!`, 'secret');
    }
}

function applyTheme(themeId) {
    game.theme = themeId;
    document.body.className = themeId;
    updateThemeSelector();
}

function updateThemeSelector() {
    const container = document.getElementById('theme-selector');
    if (!container) return;
    
    container.innerHTML = '';
    themes.forEach(theme => {
        const unlocked = game.unlockedThemes.includes(theme.id);
        const div = document.createElement('div');
        div.className = 'theme-btn' + (game.theme === theme.id ? ' active' : '') + (unlocked ? '' : ' locked');
        div.textContent = theme.name;
        if (unlocked) {
            div.onclick = () => applyTheme(theme.id);
        }
        container.appendChild(div);
    });
}

function updateSkinSelector() {
    const container = document.getElementById('skin-selector');
    if (!container) return;
    
    container.innerHTML = '';
    clickSkins.forEach(skin => {
        const unlocked = game.unlockedSkins.includes(skin.icon) || (skin.requirement && game.totalMined >= skin.requirement);
        
        if (skin.requirement && !game.unlockedSkins.includes(skin.icon) && game.totalMined >= skin.requirement) {
            game.unlockedSkins.push(skin.icon);
            notify(`Click skin unlocked: ${skin.name}!`, 'secret');
        }
        
        const div = document.createElement('div');
        div.className = 'skin-btn' + (game.clickSkin === skin.icon ? ' active' : '') + (unlocked ? '' : ' locked');
        div.textContent = skin.icon;
        div.title = skin.name + (unlocked ? '' : `\nUnlock at ${fmt(skin.requirement)} total`);
        
        if (unlocked) {
            div.onclick = () => {
                game.clickSkin = skin.icon;
                document.getElementById('mine-icon').textContent = skin.icon;
                updateSkinSelector();
            };
        }
        
        container.appendChild(div);
    });
}

function updateLog() {
    const el = document.getElementById('log');
    if (!el) return;
    if (!game.log) game.log = [];
    el.innerHTML = '';
    game.log.forEach(l => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `<span class="log-time">[${l.time}]</span><span>${l.msg}</span>`;
        el.appendChild(div);
    });
}

function updateAchievements() {
    const container = document.getElementById('achievements');
    if (!container) return;
    
    if (!game.achievements) game.achievements = {};
    
    // Separate normal and secret achievements
    const normalAchs = [];
    const secretAchs = [];
    
    Object.entries(achievements).forEach(([key, ach]) => {
        const unlocked = game.achievements[key];
        if (ach.secret) {
            secretAchs.push({key, ach, unlocked});
        } else {
            normalAchs.push({key, ach, unlocked});
        }
    });
    
    const unlockedCount = Object.keys(game.achievements).length;
    const totalCount = Object.keys(achievements).length;
    
    // Update counter in header
    const countEl = document.getElementById('achievement-count');
    const totalEl = document.getElementById('achievement-total');
    if (countEl) countEl.textContent = unlockedCount;
    if (totalEl) totalEl.textContent = totalCount;
    
    // Check if container is already initialized
    if (!container.querySelector('.achievement-tabs')) {
        // First time initialization
        container.innerHTML = `
            <div class="achievement-tabs">
                <div class="achievement-tab active" data-tab="normal">
                    NORMAL (${normalAchs.filter(a => a.unlocked).length}/${normalAchs.length})
                </div>
                <div class="achievement-tab" data-tab="secret">
                    SECRET (${secretAchs.filter(a => a.unlocked).length}/${secretAchs.length})
                </div>
            </div>
            <div class="achievement-content">
                <div class="achievement-list active" data-content="normal"></div>
                <div class="achievement-list" data-content="secret"></div>
            </div>
        `;
        
        // Tab switching logic
        const tabs = container.querySelectorAll('.achievement-tab');
        const contents = container.querySelectorAll('.achievement-list');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                container.querySelector(`[data-content="${tabName}"]`).classList.add('active');
            });
        });
    }
    
    // Update tab counts without rebuilding
    const normalTab = container.querySelector('[data-tab="normal"]');
    const secretTab = container.querySelector('[data-tab="secret"]');
    if (normalTab) normalTab.textContent = `NORMAL (${normalAchs.filter(a => a.unlocked).length}/${normalAchs.length})`;
    if (secretTab) secretTab.textContent = `SECRET (${secretAchs.filter(a => a.unlocked).length}/${secretAchs.length})`;
    
    // Update achievement lists only if needed
    const normalList = container.querySelector('[data-content="normal"]');
    const secretList = container.querySelector('[data-content="secret"]');
    
    // Only rebuild if achievement count changed
    if (normalList && normalList.children.length !== normalAchs.length) {
        normalList.innerHTML = '';
        normalAchs.forEach(({key, ach, unlocked}) => {
            const div = document.createElement('div');
            div.className = 'achievement' + (unlocked ? ' unlocked' : ' locked');
            div.title = unlocked ? `${ach.desc}\n+${ach.reward}%` : 'Locked';
            
            div.innerHTML = `
                <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${unlocked ? ach.name : '???'}</div>
                    <div class="achievement-desc">${unlocked ? ach.desc : 'Locked'}</div>
                    ${unlocked ? '<div class="achievement-reward">+' + ach.reward + '%</div>' : ''}
                </div>
            `;
            normalList.appendChild(div);
        });
    }
    
    if (secretList && secretList.children.length !== secretAchs.length) {
        secretList.innerHTML = '';
        secretAchs.forEach(({key, ach, unlocked}) => {
            const div = document.createElement('div');
            div.className = 'achievement secret' + (unlocked ? ' unlocked' : ' locked');
            div.title = unlocked ? `${ach.desc}\n+${ach.reward}%` : 'Secret Achievement';
            
            div.innerHTML = `
                <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${unlocked ? ach.name : '???'}</div>
                    <div class="achievement-desc">${unlocked ? ach.desc : 'Secret'}</div>
                    ${unlocked ? '<div class="achievement-reward">+' + ach.reward + '%</div>' : ''}
                </div>
            `;
            secretList.appendChild(div);
        });
    }
}

function updateStatistics() {
    if (document.getElementById('stats-total-clicks')) document.getElementById('stats-total-clicks').textContent = fmt(game.clicks);
    if (document.getElementById('stats-biggest-gain')) document.getElementById('stats-biggest-gain').textContent = fmt(game.biggestSingleGain);
    if (document.getElementById('stats-peak-rate')) document.getElementById('stats-peak-rate').textContent = fmt(game.peakBitsPerSecond) + '/s';
    
    const totalWorkers = Object.values(game.workers).reduce((s, w) => s + w.count, 0) + 
                         Object.values(game.secretWorkers).reduce((s, w) => w.unlocked ? s + w.count : s, 0);
    if (document.getElementById('stats-total-workers')) document.getElementById('stats-total-workers').textContent = totalWorkers;
    if (document.getElementById('stats-prestige-count')) document.getElementById('stats-prestige-count').textContent = game.timesPrestiged || game.prestige;
    if (document.getElementById('stats-total-time')) document.getElementById('stats-total-time').textContent = fmtTime(game.time);
}

function update() {
    try {
        const multi = getMulti();
        if (document.getElementById('bits-big')) document.getElementById('bits-big').textContent = fmt(game.bits);
        if (document.getElementById('bits-rate')) document.getElementById('bits-rate').textContent = fmt(getWorkerRate());
        if (document.getElementById('multi')) document.getElementById('multi').textContent = 'x' + fmt(multi);
        if (document.getElementById('multi-display')) document.getElementById('multi-display').textContent = 'x' + fmt(multi);
        if (document.getElementById('mine-rate')) document.getElementById('mine-rate').textContent = '+' + Math.floor(game.clickPower * multi);
        if (document.getElementById('total-mined')) document.getElementById('total-mined').textContent = fmt(game.totalMined);
        
        if (document.getElementById('stat-clicks')) document.getElementById('stat-clicks').textContent = fmt(game.clicks);
        if (document.getElementById('stat-time')) document.getElementById('stat-time').textContent = fmtTime(game.time);
        
        if (document.getElementById('prestige')) document.getElementById('prestige').textContent = game.prestige;
        if (document.getElementById('prestige-bonus')) document.getElementById('prestige-bonus').textContent = (game.prestige * 10);
        
        const prReq = 1000000 * Math.pow(10, game.prestige);
        if (document.getElementById('prestige-req')) document.getElementById('prestige-req').textContent = fmt(prReq);
        const prestigeBtn = document.getElementById('prestige-btn');
        if (prestigeBtn) {
            prestigeBtn.disabled = game.totalMined < prReq;
            if (game.totalMined < prReq) prestigeBtn.innerHTML = '🔒 NEED ' + fmt(prReq) + ' TOTAL MINED';
            else prestigeBtn.innerHTML = '▶ ASCEND NOW';
        }

        if (document.getElementById('stat-prestige-mult')) document.getElementById('stat-prestige-mult').textContent = '+' + (game.prestige * 10) + '%';
        if (document.getElementById('stat-rank-mult')) document.getElementById('stat-rank-mult').textContent = '+' + getRankBonus() + '%';
        if (document.getElementById('stat-achievement-mult')) document.getElementById('stat-achievement-mult').textContent = '+' + getAchievementBonus() + '%';
        if (document.getElementById('stat-rare-mult')) document.getElementById('stat-rare-mult').textContent = '+' + getRareBitsBonus() + '%';
        
        updateRanks();
        updateWorkers();
        updateAchievements();
        updateSkinSelector();
        updateStatistics();
        checkAchievements();
        
        const currentRate = getWorkerRate();
        if (currentRate > game.peakBitsPerSecond) {
            game.peakBitsPerSecond = currentRate;
        }
        
        if (game.bits === 0 && game.totalMined >= 1000000 && !game.achievements.brokeAgain) {
            game.achievements.brokeAgain = true;
            log('🏆 Broke Again');
            notify('🏆 Broke Again (+100%)', 'secret');
            updateAchievements();
        }
        
        const totalWorkers = Object.values(game.workers).reduce((s, w) => s + w.count, 0);
        if (totalWorkers >= 1000 && !game.secretWorkers.mystery.unlocked) {
            game.secretWorkers.mystery.unlocked = true;
            log('🔓 SECRET WORKER UNLOCKED!');
            notify('Mystery Worker discovered!', 'secret');
        }
        
        if (game.totalMined >= 1000000000 && !game.secretWorkers.developer.unlocked) {
            game.secretWorkers.developer.unlocked = true;
            log('🔓 THE DEVELOPER UNLOCKED!');
            notify('The Developer joins you!', 'secret');
        }
        
        if (game.rankIndex >= 10 && !game.secretWorkers.quantum.unlocked) {
            game.secretWorkers.quantum.unlocked = true;
            log('🔓 QUANTUM MINER UNLOCKED!');
            notify('Quantum Miner discovered!', 'secret');
        }
    } catch (e) {
        console.error('Update error:', e);
    }
}

function updateRanks() {
    try {
        ranks.forEach((r, i) => {
            if (game.totalMined >= r.req && i > game.rankIndex) {
                game.rankIndex = i;
                log('⬆ ' + r.name);
                notify('RANK UP: ' + r.name + ' (+' + r.bonus + '%)', 'rank');
                spawnBitExplosion();
                screenShake();
            }
        });
        
        const r = ranks[game.rankIndex];
        if (document.getElementById('rank-name')) document.getElementById('rank-name').textContent = r.name.toUpperCase();
        
        const badge = document.getElementById('rank-badge');
        if (badge) {
            badge.textContent = game.rankIndex;
            badge.style.background = rankColors[game.rankIndex];
            if (game.rainbowRank) {
                badge.classList.add('rainbow');
            } else {
                badge.classList.remove('rainbow');
            }
        }
        
        const progressBar = document.getElementById('rank-progress');
        const progressText = document.getElementById('rank-progress-text');
        if (progressBar && progressText) {
            const currentRank = ranks[game.rankIndex];
            const nextRank = ranks[game.rankIndex + 1];
            
            if (nextRank) {
                const currentReq = currentRank.req;
                const nextReq = nextRank.req;
                const progress = ((game.totalMined - currentReq) / (nextReq - currentReq)) * 100;
                const clampedProgress = Math.min(100, Math.max(0, progress));
                
                progressBar.style.width = clampedProgress + '%';
                progressText.textContent = clampedProgress.toFixed(1) + '%';
            } else {
                progressBar.style.width = '100%';
                progressText.textContent = 'MAX RANK';
            }
        }
        
        const list = document.getElementById('ranks');
        if (list) {
            list.innerHTML = '';
            ranks.forEach((rank, i) => {
                const div = document.createElement('div');
                div.style.padding = '5px 0';
                div.style.borderBottom = '1px solid #1a1a1a';
                div.style.color = i <= game.rankIndex ? '#888' : '#444';
                div.innerHTML = `[${i}] ${rank.name} <span style="float: right;">${fmt(rank.req)}</span>`;
                list.appendChild(div);
            });
        }
    } catch (e) {
        console.error('updateRanks error:', e);
    }
}

function updateWorkers() {
    try {
        const list = document.getElementById('workers');
        if (!list || !game.workers) return;
        
        list.innerHTML = '';
        Object.entries(game.workers).forEach(([key, w]) => {
            const cost = Math.floor(w.baseCost * Math.pow(w.costMult, w.count));
            const div = document.createElement('div');
            div.className = 'worker';
            
            div.innerHTML = `
                <div class="worker-icon">${w.icon}</div>
                <div class="worker-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="worker-name">${w.name}</div>
                        <div class="worker-count">x${w.count}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px;">
                        <div style="color: #aaa;">${fmt(w.rate * getMulti())}/s</div>
                        <div style="color: ${game.bits >= cost ? '#f7c516' : '#666'};">${fmt(cost)}</div>
                    </div>
                </div>
            `;
            div.onclick = () => buyWorker(key);
            div.style.opacity = game.bits >= cost ? '1' : '0.4';
            list.appendChild(div);
        });
        
        Object.entries(game.secretWorkers).forEach(([key, w]) => {
            if (!w.unlocked) return;
            
            const cost = Math.floor(w.baseCost * Math.pow(w.costMult, w.count));
            const div = document.createElement('div');
            div.className = 'worker secret';
            
            const rateDisplay = w.name === 'Quantum Miner' ? 'Random/s' : fmt(w.rate * getMulti()) + '/s';
            
            div.innerHTML = `
                <div class="worker-icon">${w.icon}</div>
                <div class="worker-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="worker-name">${w.name}</div>
                        <div class="worker-count">x${w.count}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px;">
                        <div style="color: #f0f;">${rateDisplay}</div>
                        <div style="color: ${game.bits >= cost ? '#f7c516' : '#666'};">${fmt(cost)}</div>
                    </div>
                </div>
            `;
            div.onclick = () => buySecretWorker(key);
            div.style.opacity = game.bits >= cost ? '1' : '0.4';
            list.appendChild(div);
        });
    } catch (e) {
        console.error('updateWorkers error:', e);
    }
}

function buyWorker(key) {
    if (!game.workers || !game.workers[key]) return;
    const w = game.workers[key];
    const cost = Math.floor(w.baseCost * Math.pow(w.costMult, w.count));
    if (game.bits >= cost) {
        game.bits -= cost;
        w.count++;
        game.totalWorkersBought++;
        log('✓ ' + w.name);
        update();
    }
}

function buySecretWorker(key) {
    if (!game.secretWorkers || !game.secretWorkers[key]) return;
    const w = game.secretWorkers[key];
    if (!w.unlocked) return;
    const cost = Math.floor(w.baseCost * Math.pow(w.costMult, w.count));
    if (game.bits >= cost) {
        game.bits -= cost;
        w.count++;
        game.totalWorkersBought++;
        log('✓ ' + w.name);
        update();
    }
}

// Click Handler Function
function handleClick(e, isSpacebar = false) {
    let gain = Math.floor(game.clickPower * getMulti());
    let isCrit = false;
    
    if (Math.random() < 0.01) {
        gain *= 2;
        isCrit = true;
        const mineBtn = document.getElementById('mine-btn');
        if (mineBtn) {
            mineBtn.classList.add('crit');
            setTimeout(() => mineBtn.classList.remove('crit'), 200);
        }
        if (gain > 100) screenShake();
        log('💥 CRIT! +' + fmt(gain));
    }
    
    if (gain > game.biggestSingleGain) {
        game.biggestSingleGain = gain;
    }
    
    // Spacebar
    let x, y;
    if (isSpacebar) {
        const mineBtn = document.getElementById('mine-btn');
        if (mineBtn) {
            const rect = mineBtn.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        } else {
            x = window.innerWidth / 2;
            y = window.innerHeight / 2;
        }
    } else {
        x = e ? e.clientX : window.innerWidth / 2;
        y = e ? e.clientY : window.innerHeight / 2;
    }
    
    showFloatingNumber(gain, x, y, isCrit);
    
    game.bits += gain;
    game.totalMined += gain;
    game.clicks++;
    if (isSpacebar) game.spacebarClicks += gain;
    
    game.clickTimes.push(Date.now());
    if (game.clickTimes.length > 100) game.clickTimes.shift();
    
    if (game.totalWorkersBought === 0 && game.bits > game.highestBitsWithoutBuying) {
        game.highestBitsWithoutBuying = game.bits;
    }
    
    if (Math.random() < 0.001) {
        spawnGoldenBit();
    }
    
    if (Math.random() < 0.25) {
        spawnRareBit();
    }
    
    update();
}

// ==================== EVENT LISTENERS ====================
const mineBtn = document.getElementById('mine-btn');
if (mineBtn) {
    let mouseDown = false;
    let holdTimer = null;
    
    mineBtn.addEventListener('mousedown', () => {
        mouseDown = true;
        game.holdStart = Date.now();
        holdTimer = setTimeout(() => {
            if (mouseDown && !game.achievements.patience) {
                game.achievements.patience = true;
                log('🏆 Patience');
                notify('🏆 Patience (+100%)', 'secret');
                updateAchievements();
            }
        }, 30000);
    });
    
    mineBtn.addEventListener('mouseup', () => {
        mouseDown = false;
        if (holdTimer) clearTimeout(holdTimer);
    });
    
    mineBtn.addEventListener('mouseleave', () => {
        mouseDown = false;
        if (holdTimer) clearTimeout(holdTimer);
    });
    
    mineBtn.addEventListener('click', (e) => {
        handleClick(e, false);
    });
}

// Spacebar Support
let spacebarHeld = false;
let lastSpacebarClick = 0;
const SPACEBAR_COOLDOWN = 150;

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        
        if (!spacebarHeld) {
            spacebarHeld = true;
            handleClick(null, true);
            lastSpacebarClick = Date.now();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        spacebarHeld = false;
    }
});

// Spacebar Hold Handler
setInterval(() => {
    if (spacebarHeld) {
        const now = Date.now();
        if (now - lastSpacebarClick >= SPACEBAR_COOLDOWN) {
            handleClick(null, true);
            lastSpacebarClick = now;
        }
    }
}, 50);

const prestigeBtn = document.getElementById('prestige-btn');
if (prestigeBtn) {
    prestigeBtn.addEventListener('click', () => {
        const req = 1000000 * Math.pow(10, game.prestige);
        if (game.totalMined < req) return;
        if (!confirm('ASCEND: Reset for +10% permanent bonus?')) return;
        
        const keepAchievements = game.achievements;
        const keepRareBits = game.rareBits;
        const keepThemes = game.unlockedThemes;
        const keepSkins = game.unlockedSkins;
        const keepRainbow = game.rainbowRank;
        
        game.prestige++;
        game.sessionPrestiges++;
        game.timesPrestiged = (game.timesPrestiged || 0) + 1;
        game.bits = 0;
        game.totalMined = 0;
        game.clickPower = 1;
        game.clicks = 0;
        game.spacebarClicks = 0;
        game.rankIndex = 0;
        game.achievements = keepAchievements;
        game.rareBits = keepRareBits;
        game.unlockedThemes = keepThemes;
        game.unlockedSkins = keepSkins;
        game.rainbowRank = keepRainbow;
        game.highestBitsWithoutBuying = 0;
        game.totalWorkersBought = 0;
        
        Object.values(game.workers).forEach(w => w.count = 0);
        Object.values(game.secretWorkers).forEach(w => w.count = 0);
        
        log('✨ ASCENDED ' + game.prestige);
        notify('ASCENDED TO LEVEL ' + game.prestige + '!', 'ascension');
        update();
    });
}

const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        game.lastSaveTime = Date.now();
        localStorage.setItem('bitminer', JSON.stringify(game));
        log('💾 SAVED');
        notify('SAVED', 'info');
    });
}

const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (!confirm('HARD RESET: Delete everything?')) return;
        localStorage.removeItem('bitminer');
        Object.assign(game, JSON.parse(JSON.stringify(defaultGame)));
        game.log = [{time: new Date().toLocaleTimeString('en-US', {hour12: false}), msg: '🔄 RESET'}];
        log('🔄 NEW GAME');
        notify('GAME RESET', 'info');
        applyTheme('default');
        document.getElementById('mine-icon').textContent = '💎';
        update();
        updateRareBitsDisplay();
        updateThemeSelector();
        updateSkinSelector();
    });
}

const clearLogBtn = document.getElementById('clear-log');
if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
        game.log = [];
        updateLog();
    });
}

const exportBtn = document.getElementById('export-btn');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const saveData = JSON.stringify(game);
        const encoded = btoa(saveData);
        const textarea = document.getElementById('save-code');
        if (textarea) {
            textarea.value = encoded;
            textarea.select();
            document.execCommand('copy');
            notify('Save code copied to clipboard!', 'info');
            log('📋 EXPORTED');
        }
    });
}

const importBtn = document.getElementById('import-btn');
if (importBtn) {
    importBtn.addEventListener('click', () => {
        const textarea = document.getElementById('save-code');
        if (!textarea || !textarea.value) {
            notify('Paste save code first!', 'info');
            return;
        }
        
        try {
            const decoded = atob(textarea.value.trim());
            const loaded = JSON.parse(decoded);
            const merged = mergeSaveWithDefaults(loaded, defaultGame);
            Object.assign(game, merged);
            
            log('✓ IMPORTED');
            notify('Save imported successfully!', 'info');
            applyTheme(game.theme || 'default');
            document.getElementById('mine-icon').textContent = game.clickSkin || '💎';
            update();
            updateRareBitsDisplay();
            updateThemeSelector();
            updateSkinSelector();
            textarea.value = '';
        } catch (e) {
            console.error('Import error:', e);
            notify('Invalid save code!', 'info');
            log('❌ IMPORT FAILED');
        }
    });
}

const footer = document.getElementById('footer');
if (footer) {
    footer.addEventListener('click', () => {
        game.footerClicks++;
        if (game.footerClicks === 10) {
            notify("Never gonna give you up, never gonna let you down! 🎵", 'secret');
            log('🎵 Rick Roll!');
        }
        if (game.footerClicks === 20) {
            game.footerClicks = 0;
        }
    });
}

const rankDisplay = document.getElementById('rank-display');
if (rankDisplay) {
    rankDisplay.addEventListener('click', () => {
        game.rankBadgeClicks++;
        if (game.rankBadgeClicks >= 50 && !game.rainbowRank) {
            game.rainbowRank = true;
            notify('RAINBOW RANK UNLOCKED!', 'secret');
            log('🌈 Rainbow Rank!');
            update();
        }
    });
}

// Game Loop
setInterval(() => {
    const gain = getWorkerRate() / 10;
    if (gain > 0) {
        game.bits += gain;
        game.totalMined += gain;
        
        if (game.totalWorkersBought === 0 && game.bits > game.highestBitsWithoutBuying) {
            game.highestBitsWithoutBuying = game.bits;
        }
    }
    
    const multi = getMulti();
    if (document.getElementById('bits-big')) document.getElementById('bits-big').textContent = fmt(game.bits);
    if (document.getElementById('bits-rate')) document.getElementById('bits-rate').textContent = fmt(getWorkerRate());
    if (document.getElementById('total-mined')) document.getElementById('total-mined').textContent = fmt(game.totalMined);
    if (document.getElementById('multi')) document.getElementById('multi').textContent = 'x' + fmt(multi);
}, 100);

setInterval(() => {
    game.time++;
    update();
}, 1000);

setInterval(() => {
    game.lastSaveTime = Date.now();
    localStorage.setItem('bitminer', JSON.stringify(game));
}, 30000);

// Load save
const saved = localStorage.getItem('bitminer');
if (saved) {
    try {
        const loaded = JSON.parse(saved);
        const merged = mergeSaveWithDefaults(loaded, defaultGame);
        Object.assign(game, merged);
        
        const now = Date.now();
        const lastSave = game.lastSaveTime || now;
        const offlineTime = Math.min((now - lastSave) / 1000, 28800);
        
        if (offlineTime > 60) {
            const offlineRate = getWorkerRate();
            const offlineGain = offlineRate * offlineTime * 0.5;
            if (offlineGain > 0) {
                game.bits += offlineGain;
                game.totalMined += offlineGain;
                log('⏰ +' + fmt(offlineGain));
                notify('Earned ' + fmt(offlineGain) + ' Bits offline', 'offline');
            }
        }
        log('✓ LOADED');
    } catch (e) {
        console.error('Load error:', e);
        log('❌ ERROR');
    }
}

game.sessionStart = Date.now();
game.sessionPrestiges = 0;

applyTheme(game.theme || 'default');
document.getElementById('mine-icon').textContent = game.clickSkin || '💎';

update();
updateRareBitsDisplay();
updateThemeSelector();
updateSkinSelector();
updateStatistics();
checkNewYearFireworks();

window.addEventListener('beforeunload', () => {
    game.lastSaveTime = Date.now();
    localStorage.setItem('bitminer', JSON.stringify(game));
});
