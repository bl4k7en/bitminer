// Game state object containing all variables
const defaultGame = {
    bits: 0,
    energy: 0,
    crystals: 0,
    power: 0,
    totalMined: 0,
    clickPower: 1,
    clicks: 0,
    time: 0,
    prestige: 0,
    lastSaveTime: Date.now(),
    workers: {
        bot: {name: 'Mining Bot', icon: '⚙', count: 0, cost: 50, rate: 1.5, costMult: 1.5},
        slave: {name: 'Code Slave', icon: '👨', count: 0, cost: 500, rate: 8, costMult: 1.6},
        script: {name: 'Auto Script', icon: '📜', count: 0, cost: 5000, rate: 40, costMult: 1.7},
        farm: {name: 'Click Farm', icon: '🏭', count: 0, cost: 50000, rate: 150, costMult: 1.8}
    },
    upgrades: {
        power: {name: 'Mining Power', level: 0, baseCost: 100, costMult: 1.6, effect: 1},
        crit: {name: 'Critical Hit', level: 0, baseCost: 500, costMult: 1.7, effect: 0},
        efficiency: {name: 'Worker Efficiency', level: 0, baseCost: 1000, costMult: 1.8, effect: 1},
        energyBoost: {name: 'Energy Boost', level: 0, baseCost: 2000, costMult: 1.9, effect: 1}
    },
    achievements: {},
    rankIndex: 0,
    multi: 1,
    log: []
};

// Create deep copy for game object
const game = JSON.parse(JSON.stringify(defaultGame));

// Achievement definitions
const achievements = {
    firstClick: {
        name: 'First Steps',
        desc: 'Click 1 time',
        icon: '👆',
        requirement: () => game.clicks >= 1,
        reward: {type: 'multi', value: 1.02}
    },
    earlyMiner: {
        name: 'Early Miner',
        desc: 'Mine 1,000 Bits',
        icon: '⛏️',
        requirement: () => game.totalMined >= 1000,
        reward: {type: 'multi', value: 1.05}
    },
    clickMaster: {
        name: 'Click Master',
        desc: 'Click 100 times',
        icon: '🖱️',
        requirement: () => game.clicks >= 100,
        reward: {type: 'multi', value: 1.03}
    },
    firstWorker: {
        name: 'Hired Help',
        desc: 'Hire your first worker',
        icon: '⚙️',
        requirement: () => Object.values(game.workers).some(w => w.count > 0),
        reward: {type: 'multi', value: 1.05}
    },
    automation: {
        name: 'Automation',
        desc: 'Have 10 total workers',
        icon: '🤖',
        requirement: () => Object.values(game.workers).reduce((sum, w) => sum + w.count, 0) >= 10,
        reward: {type: 'multi', value: 1.1}
    },
    millionaire: {
        name: 'Millionaire',
        desc: 'Mine 1,000,000 Bits',
        icon: '💰',
        requirement: () => game.totalMined >= 1000000,
        reward: {type: 'multi', value: 1.15}
    },
    powerUser: {
        name: 'Power User',
        desc: 'Reach 10 Power',
        icon: '⚡',
        requirement: () => game.power >= 10,
        reward: {type: 'multi', value: 1.2}
    },
    dedicated: {
        name: 'Dedicated',
        desc: 'Play for 1 hour',
        icon: '⏰',
        requirement: () => game.time >= 3600,
        reward: {type: 'multi', value: 1.1}
    },
    criticalMass: {
        name: 'Critical Mass',
        desc: 'Upgrade Critical Hit to level 5',
        icon: '💥',
        requirement: () => game.upgrades.crit && game.upgrades.crit.level >= 5,
        reward: {type: 'multi', value: 1.08}
    },
    ascended: {
        name: 'Ascended',
        desc: 'Ascend for the first time',
        icon: '🌟',
        requirement: () => game.prestige >= 1,
        reward: {type: 'multi', value: 1.25}
    }
};

// Rank definitions
const ranks = [
    {name: 'Initiate', req: 0, color: '#444'},
    {name: 'Apprentice', req: 10000, color: '#6c432b'},
    {name: 'Technician', req: 100000, color: '#e108e9'},
    {name: 'Engineer', req: 500000, color: '#fff'},
    {name: 'Architect', req: 2000000, color: '#1cb992'},
    {name: 'Master', req: 10000000, color: '#5bb91c'},
    {name: 'Overlord', req: 50000000, color: '#008fff'},
    {name: 'Titan', req: 200000000, color: '#ff9900'}
];

// Merge loaded save with defaults (ensure all properties exist)
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

// Format large numbers
function fmt(n) {
    if (n < 1e6) return Math.floor(n).toLocaleString('en');
    if (n < 1e9) return (n/1e6).toFixed(2) + 'M';
    if (n < 1e12) return (n/1e9).toFixed(2) + 'B';
    return (n/1e12).toFixed(2) + 'T';
}

// Format seconds into readable time
function fmtTime(s) {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// Calculate achievement multiplier bonus
function getAchievementMulti() {
    let multi = 1;
    if (!game.achievements) game.achievements = {};
    
    Object.entries(achievements).forEach(([key, ach]) => {
        if (game.achievements[key]) {
            multi *= ach.reward.value;
        }
    });
    return multi;
}

// Calculate total multiplier from all sources
function getMulti() {
    let m = game.multi || 1;
    
    // ENERGY: Logarithmic scaling
    m *= 1 + (Math.log10((game.energy || 0) + 1) * 0.25);
    
    // POWER: Slightly reduced
    m *= Math.pow(1.09, game.power || 0);
    
    // Ascension bonus
    m *= 1 + ((game.prestige || 0) * 0.05);
    
    // Achievement bonus
    m *= getAchievementMulti();
    
    return m;
}

// Calculate total bits per second from all workers
function getWorkerRate() {
    let total = 0;
    if (game.workers) {
        Object.values(game.workers).forEach(w => {
            const efficiencyEffect = game.upgrades && game.upgrades.efficiency ? game.upgrades.efficiency.effect : 1;
            total += w.count * w.rate * efficiencyEffect;
        });
    }
    return total * getMulti();
}

// Get conversion costs (scaling with amount owned)
function getConversionCosts() {
    return {
        energy: Math.floor(1000 * Math.pow(1.005, game.energy || 0)),
        crystals: Math.floor(5000 * Math.pow(1.002, game.crystals || 0)),
        power: Math.floor(50 * Math.pow(1.01, game.power || 0))
    };
}

// Add a new message to the game log - MAX 5 ENTRIES
function log(msg) {
    const time = new Date().toLocaleTimeString('en-US', {hour12: false});
    game.log.unshift({time, msg});
    
    // Keep only 5 latest entries
    if (game.log.length > 5) {
        game.log = game.log.slice(0, 5);
    }
    
    updateLog();
}

// Update the log display with current messages - FIXED HEIGHT
function updateLog() {
    const el = document.getElementById('log');
    el.innerHTML = '';
    
    // Always show exactly 5 entries (or empty ones)
    for (let i = 0; i < 5; i++) {
        const div = document.createElement('div');
        div.className = 'log-entry';
        
        if (game.log[i]) {
            div.innerHTML = `<span class="log-time">[${game.log[i].time}]</span><span>${game.log[i].msg}</span>`;
        } else {
            // Empty entry to keep consistent height
            div.innerHTML = `<span class="log-time"></span><span></span>`;
            div.style.minHeight = '20px'; // Keep consistent height
        }
        
        el.appendChild(div);
    }
}

// Show a temporary notification popup
function notify(msg) {
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = msg;
    const container = document.getElementById('notifications');
    if (container) container.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Show floating number at click position
function showFloatingNumber(amount, x, y, isCrit = false) {
    const div = document.createElement('div');
    div.className = 'floating-number' + (isCrit ? ' crit' : '');
    div.textContent = '+' + fmt(amount);
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    document.body.appendChild(div);
    
    setTimeout(() => div.remove(), 1000);
}

// Screen shake effect
function screenShake() {
    const body = document.body;
    body.style.animation = 'shake 0.3s';
    setTimeout(() => body.style.animation = '', 300);
}

// Check and unlock achievements
function checkAchievements() {
    if (!game.achievements) game.achievements = {};
    
    Object.entries(achievements).forEach(([key, ach]) => {
        if (!game.achievements[key] && ach.requirement()) {
            game.achievements[key] = true;
            log('🏆 ACHIEVEMENT: ' + ach.name);
            notify('🏆 ' + ach.name + ' - ' + ach.desc);
            
            if (ach.reward.type === 'multi') {
                log('Reward: x' + ach.reward.value.toFixed(2) + ' multiplier');
            }
            
            updateAchievements();
        }
    });
}

// Update achievement display
function updateAchievements() {
    const list = document.getElementById('achievements');
    const countEl = document.getElementById('achievement-count');
    if (!list) return;
    
    if (!game.achievements) game.achievements = {};
    
    const unlockedCount = Object.keys(game.achievements).length;
    const totalCount = Object.keys(achievements).length;
    
    if (countEl) countEl.textContent = unlockedCount;
    
    list.innerHTML = '';
    
    Object.entries(achievements).forEach(([key, ach]) => {
        const unlocked = game.achievements[key];
        const div = document.createElement('div');
        div.className = 'achievement' + (unlocked ? ' unlocked' : ' locked');
        
        const bonusText = ach.reward.type === 'multi' 
            ? 'x' + ach.reward.value.toFixed(2) + ' Multi' 
            : 'Unknown';
        
        div.innerHTML = `
            <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${unlocked ? ach.name : '???'}</div>
                <div class="achievement-desc">${unlocked ? ach.desc : 'Locked'}</div>
                ${unlocked ? '<div class="achievement-reward">+' + bonusText + '</div>' : ''}
            </div>
        `;
        
        list.appendChild(div);
    });
}

// Update the log display with current messages
function updateLog() {
    const el = document.getElementById('log');
    if (!el) return;
    
    if (!game.log) game.log = [];
    el.innerHTML = '';
    game.log.slice(0, 50).forEach(l => {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `<span class="log-time">[${l.time}]</span><span>${l.msg}</span>`;
        el.appendChild(div);
    });
}

// Update all UI elements with current game state
function update() {
    try {
        // Update resource displays
        const bitsEl = document.getElementById('bits');
        const energyEl = document.getElementById('energy');
        const crystalsEl = document.getElementById('crystals');
        const powerEl = document.getElementById('power');
        const bitsRateEl = document.getElementById('bits-rate');
        const multiEl = document.getElementById('multi');
        const mineRateEl = document.getElementById('mine-rate');
        const totalMinedEl = document.getElementById('total-mined');
        
        if (bitsEl) bitsEl.textContent = fmt(game.bits);
        if (energyEl) energyEl.textContent = fmt(game.energy);
        if (crystalsEl) crystalsEl.textContent = fmt(game.crystals);
        if (powerEl) powerEl.textContent = fmt(game.power);
        if (bitsRateEl) bitsRateEl.textContent = fmt(getWorkerRate());
        if (multiEl) multiEl.textContent = 'x' + getMulti().toFixed(2);
        
        const powerEffect = game.upgrades && game.upgrades.power ? game.upgrades.power.effect : 1;
        if (mineRateEl) mineRateEl.textContent = '+' + Math.floor(game.clickPower * powerEffect * getMulti());
        if (totalMinedEl) totalMinedEl.textContent = fmt(game.totalMined);
        
        // Update statistics
        const clicksEl = document.getElementById('stat-clicks');
        const timeEl = document.getElementById('stat-time');
        if (clicksEl) clicksEl.textContent = fmt(game.clicks);
        if (timeEl) timeEl.textContent = fmtTime(game.time);
        
        // Update ascension/prestige info
        const prestigeEl = document.getElementById('prestige');
        const prestigeBonusEl = document.getElementById('prestige-bonus');
        const prestigeReqEl = document.getElementById('prestige-req');
        const prestigeBtnEl = document.getElementById('prestige-btn');
        
        if (prestigeEl) prestigeEl.textContent = game.prestige;
        if (prestigeBonusEl) prestigeBonusEl.textContent = (game.prestige * 5).toFixed(0);
        
        const prReq = 1000000 * Math.pow(10, game.prestige);
        if (prestigeReqEl) prestigeReqEl.textContent = fmt(prReq);
        if (prestigeBtnEl) prestigeBtnEl.disabled = game.bits < prReq;
        
        // Update conversion costs and button states
        const costs = getConversionCosts();
        
        const convertEnergyEl = document.getElementById('convert-energy');
        const convertCrystalsEl = document.getElementById('convert-crystals');
        const convertPowerEl = document.getElementById('convert-power');
        
        if (convertEnergyEl) {
            convertEnergyEl.disabled = game.bits < costs.energy;
            convertEnergyEl.innerHTML = 
                'CONVERT TO ENERGY <span class="cost">' + fmt(costs.energy) + ' Bits → 1 Energy</span>';
        }
        
        if (convertCrystalsEl) {
            convertCrystalsEl.disabled = game.bits < costs.crystals;
            convertCrystalsEl.innerHTML = 
                'CONVERT TO CRYSTALS <span class="cost">' + fmt(costs.crystals) + ' Bits → 1 Crystal</span>';
        }
        
        if (convertPowerEl) {
            convertPowerEl.disabled = game.crystals < costs.power;
            convertPowerEl.innerHTML = 
                'CONVERT TO POWER <span class="cost">' + fmt(costs.power) + ' Crystals → 1 Power</span>';
        }

        // Update Statistics Box
        const statEnergyEl = document.getElementById('stat-energy-mult');
        const statPowerEl = document.getElementById('stat-power-mult');
        const statPrestigeEl = document.getElementById('stat-prestige-mult');
        const statRankEl = document.getElementById('stat-rank-mult');
        const statUpgradePowerEl = document.getElementById('stat-upgrade-power');
        const statUpgradeCritEl = document.getElementById('stat-upgrade-crit');
        const statUpgradeEffEl = document.getElementById('stat-upgrade-eff');
        const statUpgradeEnergyEl = document.getElementById('stat-upgrade-energy');
        
        if (statEnergyEl) statEnergyEl.textContent = 'x' + (1 + (Math.log10(game.energy + 1) * 0.25)).toFixed(2);
        if (statPowerEl) statPowerEl.textContent = 'x' + Math.pow(1.09, game.power).toFixed(2);
        if (statPrestigeEl) statPrestigeEl.textContent = 'x' + (1 + (game.prestige * 0.05)).toFixed(2);
        if (statRankEl) statRankEl.textContent = 'x' + Math.pow(1.1, game.rankIndex).toFixed(2);
        
        if (game.upgrades) {
            if (statUpgradePowerEl && game.upgrades.power) statUpgradePowerEl.textContent = game.upgrades.power.effect.toFixed(2);
            if (statUpgradeCritEl && game.upgrades.crit) statUpgradeCritEl.textContent = game.upgrades.crit.effect.toFixed(1) + '%';
            if (statUpgradeEffEl && game.upgrades.efficiency) statUpgradeEffEl.textContent = game.upgrades.efficiency.effect.toFixed(2);
            if (statUpgradeEnergyEl && game.upgrades.energyBoost) statUpgradeEnergyEl.textContent = game.upgrades.energyBoost.effect.toFixed(2);
        }
        
        // Update other UI sections
        updateRanks();
        updateWorkers();
        updateUpgrades();
        updateAchievements();
        checkAchievements();
    } catch (e) {
        console.error('Update error:', e);
    }
}

// Update rank display and check for rank promotions
function updateRanks() {
    try {
        // Check if player has reached any new ranks
        ranks.forEach((r, i) => {
            if (game.bits >= r.req && i > game.rankIndex) {
                game.rankIndex = i;
                game.multi *= 1.1;
                log('RANK UP: ' + r.name);
                notify('RANK UP: ' + r.name);
            }
        });
        
        // Update current rank display
        const r = ranks[game.rankIndex];
        const rankNameEl = document.getElementById('rank-name');
        const rankBadgeEl = document.getElementById('rank-badge');
        
        if (rankNameEl) rankNameEl.textContent = r.name.toUpperCase();
        if (rankBadgeEl) {
            rankBadgeEl.textContent = game.rankIndex;
            rankBadgeEl.style.background = r.color;
        }
        
        // Update rank list in right panel
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

// Update worker display with current counts and costs
function updateWorkers() {
    try {
        const list = document.getElementById('workers');
        if (!list || !game.workers) return;
        
        list.innerHTML = '';
        Object.entries(game.workers).forEach(([key, w]) => {
            const cost = Math.floor(w.cost * Math.pow(w.costMult, w.count));
            const div = document.createElement('div');
            div.className = 'worker';
            
            const efficiencyEffect = game.upgrades && game.upgrades.efficiency ? game.upgrades.efficiency.effect : 1;
            
            div.innerHTML = `
                <div class="worker-icon">${w.icon}</div>
                <div class="worker-info">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="worker-name">${w.name}</div>
                        <div class="worker-count">x${w.count}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px; font-size: 11px;">
                        <div class="worker-rate">${(w.rate * efficiencyEffect * getMulti()).toFixed(1)}/s each</div>
                        <div style="color: ${game.bits >= cost ? '#f7c516' : '#666'};">${fmt(cost)} Bits</div>
                    </div>
                </div>
            `;
            div.onclick = () => buyWorker(key);
            div.style.cursor = 'pointer';
            div.style.opacity = game.bits >= cost ? '1' : '0.4';
            div.title = 'Cost: ' + fmt(cost) + ' Bits';
            list.appendChild(div);
        });
    } catch (e) {
        console.error('updateWorkers error:', e);
    }
}

// Update upgrade display with current levels and costs
function updateUpgrades() {
    try {
        const list = document.getElementById('power-upgrades');
        if (!list || !game.upgrades) return;
        
        list.innerHTML = '';
        Object.entries(game.upgrades).forEach(([key, up]) => {
            const cost = Math.floor(up.baseCost * Math.pow(up.costMult, up.level));
            const div = document.createElement('div');
            div.className = 'upgrade';
            let effectText = '';
            if (key === 'power') effectText = 'x' + up.effect.toFixed(2);
            if (key === 'crit') effectText = up.effect.toFixed(1) + '%';
            if (key === 'efficiency') effectText = 'x' + up.effect.toFixed(2);
            if (key === 'energyBoost') effectText = 'x' + up.effect.toFixed(2);
            
            div.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-name">${up.name}</div>
                    <div class="upgrade-level">LVL ${up.level}</div>
                </div>
                <div class="upgrade-desc">${effectText}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${Math.min((up.level/100)*100, 100)}%"></div>
                </div>
                <button class="btn" ${game.bits >= cost ? '' : 'disabled'}>
                    UPGRADE <span class="cost">${fmt(cost)} Bits</span>
                </button>
            `;
            div.querySelector('button').onclick = () => buyUpgrade(key);
            list.appendChild(div);
        });
    } catch (e) {
        console.error('updateUpgrades error:', e);
    }
}

// Purchase a worker if player has enough bits
function buyWorker(key) {
    if (!game.workers || !game.workers[key]) return;
    
    const w = game.workers[key];
    const cost = Math.floor(w.cost * Math.pow(w.costMult, w.count));
    if (game.bits >= cost) {
        game.bits -= cost;
        w.count++;
        log('HIRED: ' + w.name);
        update();
    }
}

// Purchase an upgrade if player has enough bits
function buyUpgrade(key) {
    if (!game.upgrades || !game.upgrades[key]) return;
    
    const up = game.upgrades[key];
    const cost = Math.floor(up.baseCost * Math.pow(up.costMult, up.level));
    if (game.bits >= cost) {
        game.bits -= cost;
        up.level++;
        
        // Apply upgrade effect multiplier
        if (key === 'power') up.effect *= 1.12;
        if (key === 'crit') up.effect += 0.6;
        if (key === 'efficiency') up.effect *= 1.06;
        if (key === 'energyBoost') up.effect *= 1.09;
        
        log('UPGRADED: ' + up.name);
        update();
    }
}

// Event Listeners

// Main mining button click
const mineBtn = document.getElementById('mine-btn');
if (mineBtn) {
    mineBtn.addEventListener('click', (e) => {
        const powerEffect = game.upgrades && game.upgrades.power ? game.upgrades.power.effect : 1;
        let gain = Math.floor(game.clickPower * powerEffect * getMulti());
        let isCrit = false;
        
        // Check for critical hit
        const critChance = game.upgrades && game.upgrades.crit ? game.upgrades.crit.effect : 0;
        if (Math.random() * 100 < critChance) {
            gain *= 2;
            isCrit = true;
            
            // Critical hit effects
            mineBtn.classList.add('crit');
            setTimeout(() => mineBtn.classList.remove('crit'), 200);
            
            // Screen shake for big crits
            if (gain > 100) {
                screenShake();
            }
            
            log('💥 CRITICAL HIT! +' + fmt(gain));
        }
        
        // Show floating number at click position
        showFloatingNumber(gain, e.clientX, e.clientY, isCrit);
        
        game.bits += gain;
        game.totalMined += gain;
        game.clicks++;
        update();
    });
}

// Convert bits to energy
const convertEnergyBtn = document.getElementById('convert-energy');
if (convertEnergyBtn) {
    convertEnergyBtn.addEventListener('click', () => {
        const costs = getConversionCosts();
        if (game.bits >= costs.energy) {
            game.energy++;
            game.bits -= costs.energy;
            log('CONVERTED TO ENERGY: +1');
            update();
        }
    });
}

// Convert bits to crystals
const convertCrystalsBtn = document.getElementById('convert-crystals');
if (convertCrystalsBtn) {
    convertCrystalsBtn.addEventListener('click', () => {
        const costs = getConversionCosts();
        if (game.bits >= costs.crystals) {
            game.crystals++;
            game.bits -= costs.crystals;
            log('CONVERTED TO CRYSTALS: +1');
            update();
        }
    });
}

// Convert crystals to power
const convertPowerBtn = document.getElementById('convert-power');
if (convertPowerBtn) {
    convertPowerBtn.addEventListener('click', () => {
        const costs = getConversionCosts();
        if (game.crystals >= costs.power) {
            game.power++;
            game.crystals -= costs.power;
            log('CONVERTED TO POWER: +1');
            notify('POWER +1 (x' + Math.pow(1.09, game.power).toFixed(2) + ' MULTI)');
            update();
        }
    });
}

// Ascend (prestige) button
const prestigeBtn = document.getElementById('prestige-btn');
if (prestigeBtn) {
    prestigeBtn.addEventListener('click', () => {
        const req = 1000000 * Math.pow(10, game.prestige);
        if (game.bits < req) return;
        if (!confirm('ASCEND: Reset everything for +5% permanent bonus?')) return;
        
        // Reset game state but keep ascension level and achievements
        const keepAchievements = game.achievements;
        game.prestige++;
        game.bits = 0;
        game.energy = 0;
        game.crystals = 0;
        game.power = 0;
        game.totalMined = 0;
        game.clickPower = 1;
        game.clicks = 0;
        game.rankIndex = 0;
        game.multi = 1;
        game.achievements = keepAchievements; // Keep achievements!
        
        // Reset workers
        Object.values(game.workers).forEach(w => w.count = 0);
        
        // Reset upgrades to base values
        Object.values(game.upgrades).forEach(up => {
            up.level = 0;
            if (up.name === 'Mining Power') up.effect = 1;
            if (up.name === 'Critical Hit') up.effect = 0;
            if (up.name === 'Worker Efficiency') up.effect = 1;
            if (up.name === 'Energy Boost') up.effect = 1;
        });
        
        log('ASCENSION LEVEL ' + game.prestige + ' (+5% BONUS)');
        notify('ASCENDED TO LEVEL ' + game.prestige + '!');
        update();
    });
}

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const targetContent = document.getElementById('tab-' + target);
        if (targetContent) targetContent.classList.add('active');
    });
});

// Save game to localStorage
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        game.lastSaveTime = Date.now();
        localStorage.setItem('bitminer', JSON.stringify(game));
        log('GAME SAVED');
        notify('SAVED');
    });
}

// Hard reset game
const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (!confirm('HARD RESET: Delete everything?\nThis will reset ALL progress including Ascension levels!')) return;
        
        // Delete save
        localStorage.removeItem('bitminer');
        
        // Reset to defaults
        Object.assign(game, JSON.parse(JSON.stringify(defaultGame)));
        game.log = [{time: new Date().toLocaleTimeString('en-US', {hour12: false}), msg: 'SYSTEM RESET - NEW GAME STARTED'}];
        
        log('HARD RESET - NEW GAME STARTED');
        notify('GAME COMPLETELY RESET');
        update();
    });
}

// Clear game log
const clearLogBtn = document.getElementById('clear-log');
if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
        game.log = [];
        updateLog();
    });
}

// Game Loop

// Add passive income from workers every 100ms
setInterval(() => {
    const gain = getWorkerRate() / 10;
    if (gain > 0) {
        game.bits += gain;
        game.totalMined += gain;
    }
}, 100);

// Update game time every second
setInterval(() => {
    game.time++;
    update();
}, 1000);

// Auto-save every 30 seconds
setInterval(() => {
    game.lastSaveTime = Date.now();
    localStorage.setItem('bitminer', JSON.stringify(game));
}, 30000);

// Load saved game from localStorage
const saved = localStorage.getItem('bitminer');
if (saved) {
    try {
        const loaded = JSON.parse(saved);
        
        // Merge with defaults to ensure all properties exist
        const merged = mergeSaveWithDefaults(loaded, defaultGame);
        Object.assign(game, merged);
        
        // Calculate offline progress
        const now = Date.now();
        const lastSave = game.lastSaveTime || now;
        const offlineTime = Math.min((now - lastSave) / 1000, 28800); // max 8 hours
        
        // Calculate offline earnings (50% efficiency)
        if (offlineTime > 60) {
            const offlineRate = getWorkerRate();
            const offlineGain = offlineRate * offlineTime * 0.5;
            
            if (offlineGain > 0) {
                game.bits += offlineGain;
                game.totalMined += offlineGain;
                
                log('OFFLINE PRODUCTION: +' + fmt(offlineGain) + ' Bits (' + fmtTime(Math.floor(offlineTime)) + ')');
                notify('Welcome back! Earned ' + fmt(offlineGain) + ' Bits offline (50% efficiency)');
            }
        }
        
        log('GAME LOADED');
    } catch (e) {
        console.error('Load error:', e);
        log('ERROR LOADING SAVE: Starting fresh');
        notify('Error loading save. Starting fresh.');
    }
}

// Initial UI update
update();

// Auto-save when leaving the page
window.addEventListener('beforeunload', () => {
    game.lastSaveTime = Date.now();
    localStorage.setItem('bitminer', JSON.stringify(game));
});
