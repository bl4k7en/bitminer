// Game state object containing all variables - CLEAN VERSION
const game = {
    bits: 0,
    energy: 0,
    crystals: 0,
    power: 0,
    totalMined: 0,
    clickPower: 1,
    clicks: 0,
    time: 0,
    prestige: 0,
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
    rankIndex: 0,
    multi: 1,
    log: []
};

// Rank definitions with names, requirements, and colors
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

// Format large numbers with suffixes (K, M, B, T)
function fmt(n) {
    if (n < 1e6) return Math.floor(n).toLocaleString('en');
    if (n < 1e9) return (n/1e6).toFixed(2) + 'M';
    if (n < 1e12) return (n/1e9).toFixed(2) + 'B';
    return (n/1e12).toFixed(2) + 'T';
}

// Format seconds into readable time (hours, minutes, seconds)
function fmtTime(s) {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// Calculate total multiplier from all sources - BALANCED VERSION
function getMulti() {
    let m = game.multi;
    
    // ENERGY: Logarithmic scaling to prevent OP early game
    m *= 1 + (Math.log10(game.energy + 1) * 0.25);
    
    // POWER: Slightly reduced from 1.12 to 1.09
    m *= Math.pow(1.09, game.power);
    
    // Ascension bonus
    m *= 1 + (game.prestige * 0.05);
    
    return m;
}

// Calculate total bits per second from all workers
function getWorkerRate() {
    let total = 0;
    Object.values(game.workers).forEach(w => {
        total += w.count * w.rate * game.upgrades.efficiency.effect;
    });
    return total * getMulti();
}

// Get conversion costs (scaling with amount owned)
function getConversionCosts() {
    return {
        energy: Math.floor(1000 * Math.pow(1.005, game.energy)),
        crystals: Math.floor(5000 * Math.pow(1.002, game.crystals)),
        power: Math.floor(50 * Math.pow(1.01, game.power))
    };
}

// Add a new message to the game log
function log(msg) {
    const time = new Date().toLocaleTimeString('en-US', {hour12: false});
    game.log.unshift({time, msg});
    if (game.log.length > 100) game.log.pop();
    updateLog();
}

// Show a temporary notification popup
function notify(msg) {
    const div = document.createElement('div');
    div.className = 'notification';
    div.textContent = msg;
    document.getElementById('notifications').appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Update the log display with current messages
function updateLog() {
    const el = document.getElementById('log');
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
    // Update resource displays
    document.getElementById('bits').textContent = fmt(game.bits);
    document.getElementById('energy').textContent = fmt(game.energy);
    document.getElementById('crystals').textContent = fmt(game.crystals);
    document.getElementById('power').textContent = fmt(game.power);
    document.getElementById('bits-rate').textContent = fmt(getWorkerRate());
    document.getElementById('multi').textContent = 'x' + getMulti().toFixed(2);
    document.getElementById('mine-rate').textContent = '+' + Math.floor(game.clickPower * game.upgrades.power.effect * getMulti());
    document.getElementById('total-mined').textContent = fmt(game.totalMined);
    
    // Update statistics
    document.getElementById('stat-clicks').textContent = fmt(game.clicks);
    document.getElementById('stat-time').textContent = fmtTime(game.time);
    
    // Update ascension/prestige info
    document.getElementById('prestige').textContent = game.prestige;
    document.getElementById('prestige-bonus').textContent = (game.prestige * 5).toFixed(0);
    
    const prReq = 1000000 * Math.pow(10, game.prestige);
    document.getElementById('prestige-req').textContent = fmt(prReq);
    document.getElementById('prestige-btn').disabled = game.bits < prReq;
    
    // Update conversion costs and button states
    const costs = getConversionCosts();
    
    document.getElementById('convert-energy').disabled = game.bits < costs.energy;
    document.getElementById('convert-energy').innerHTML = 
        'CONVERT TO ENERGY <span class="cost">' + fmt(costs.energy) + ' Bits → 1 Energy</span>';
    
    document.getElementById('convert-crystals').disabled = game.bits < costs.crystals;
    document.getElementById('convert-crystals').innerHTML = 
        'CONVERT TO CRYSTALS <span class="cost">' + fmt(costs.crystals) + ' Bits → 1 Crystal</span>';
    
    document.getElementById('convert-power').disabled = game.crystals < costs.power;
    document.getElementById('convert-power').innerHTML = 
        'CONVERT TO POWER <span class="cost">' + fmt(costs.power) + ' Crystals → 1 Power</span>';

    // Update Statistics Box with new formulas
    document.getElementById('stat-energy-mult').textContent = 'x' + (1 + (Math.log10(game.energy + 1) * 0.25)).toFixed(2);
    document.getElementById('stat-power-mult').textContent = 'x' + Math.pow(1.09, game.power).toFixed(2);
    document.getElementById('stat-prestige-mult').textContent = 'x' + (1 + (game.prestige * 0.05)).toFixed(2);
    document.getElementById('stat-rank-mult').textContent = 'x' + Math.pow(1.1, game.rankIndex).toFixed(2);
    document.getElementById('stat-upgrade-power').textContent = game.upgrades.power.effect.toFixed(2);
    document.getElementById('stat-upgrade-crit').textContent = game.upgrades.crit.effect.toFixed(1) + '%';
    document.getElementById('stat-upgrade-eff').textContent = game.upgrades.efficiency.effect.toFixed(2);
    document.getElementById('stat-upgrade-energy').textContent = game.upgrades.energyBoost.effect.toFixed(2);
    
    // Update other UI sections
    updateRanks();
    updateWorkers();
    updateUpgrades();
}

// Update rank display and check for rank promotions
function updateRanks() {
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
    document.getElementById('rank-name').textContent = r.name.toUpperCase();
    document.getElementById('rank-badge').textContent = game.rankIndex;
    document.getElementById('rank-badge').style.background = r.color;
    
    // Update rank list in right panel
    const list = document.getElementById('ranks');
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

// Update worker display with current counts and costs
function updateWorkers() {
    const list = document.getElementById('workers');
    list.innerHTML = '';
    Object.entries(game.workers).forEach(([key, w]) => {
        const cost = Math.floor(w.cost * Math.pow(w.costMult, w.count));
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
                    <div class="worker-rate">${(w.rate * game.upgrades.efficiency.effect * getMulti()).toFixed(1)}/s each</div>
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
}

// Update upgrade display with current levels and costs
function updateUpgrades() {
    const list = document.getElementById('power-upgrades');
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
}

// Purchase a worker if player has enough bits
function buyWorker(key) {
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
document.getElementById('mine-btn').addEventListener('click', () => {
    let gain = Math.floor(game.clickPower * game.upgrades.power.effect * getMulti());
    
    // Check for critical hit
    if (Math.random() * 100 < game.upgrades.crit.effect) {
        gain *= 2;
        document.getElementById('mine-btn').classList.add('crit');
        setTimeout(() => document.getElementById('mine-btn').classList.remove('crit'), 200);
        log('CRITICAL HIT! +' + fmt(gain));
    }
    
    game.bits += gain;
    game.totalMined += gain;
    game.clicks++;
    update();
});

// Convert bits to energy
document.getElementById('convert-energy').addEventListener('click', () => {
    const costs = getConversionCosts();
    if (game.bits >= costs.energy) {
        game.energy++;
        game.bits -= costs.energy;
        log('CONVERTED TO ENERGY: +1');
        update();
    }
});

// Convert bits to crystals
document.getElementById('convert-crystals').addEventListener('click', () => {
    const costs = getConversionCosts();
    if (game.bits >= costs.crystals) {
        game.crystals++;
        game.bits -= costs.crystals;
        log('CONVERTED TO CRYSTALS: +1');
        update();
    }
});

// Convert crystals to power
document.getElementById('convert-power').addEventListener('click', () => {
    const costs = getConversionCosts();
    if (game.crystals >= costs.power) {
        game.power++;
        game.crystals -= costs.power;
        log('CONVERTED TO POWER: +1');
        notify('POWER +1 (x' + Math.pow(1.09, game.power).toFixed(2) + ' MULTI)');
        update();
    }
});

// Ascend (prestige) button
document.getElementById('prestige-btn').addEventListener('click', () => {
    const req = 1000000 * Math.pow(10, game.prestige);
    if (game.bits < req) return;
    if (!confirm('ASCEND: Reset everything for +5% permanent bonus?')) return;
    
    // Reset game state but keep ascension level
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

// Tab navigation
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + target).classList.add('active');
    });
});

// Save game to localStorage
document.getElementById('save-btn').addEventListener('click', () => {
    localStorage.setItem('bitminer', JSON.stringify(game));
    log('GAME SAVED');
    notify('SAVED');
});

// Hard reset game
document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('HARD RESET: Delete everything?\nThis will reset ALL progress including Ascension levels!')) return;
    
    // Delete save
    localStorage.removeItem('bitminer');
    
    // Reset game completely
    game.bits = 0;
    game.energy = 0;
    game.crystals = 0;
    game.power = 0;
    game.totalMined = 0;
    game.clickPower = 1;
    game.clicks = 0;
    game.time = 0;
    game.prestige = 0;
    game.rankIndex = 0;
    game.multi = 1;
    
    // Reset workers
    Object.values(game.workers).forEach(w => w.count = 0);
    
    // Reset upgrades
    Object.values(game.upgrades).forEach(up => {
        up.level = 0;
        if (up.name === 'Mining Power') up.effect = 1;
        if (up.name === 'Critical Hit') up.effect = 0;
        if (up.name === 'Worker Efficiency') up.effect = 1;
        if (up.name === 'Energy Boost') up.effect = 1;
    });
    
    // Clear log
    game.log = [{time: new Date().toLocaleTimeString('en-US', {hour12: false}), msg: 'SYSTEM RESET - NEW GAME STARTED'}];
    
    log('HARD RESET - NEW GAME STARTED');
    notify('GAME COMPLETELY RESET');
    update();
});

// Clear game log
document.getElementById('clear-log').addEventListener('click', () => {
    game.log = [];
    updateLog();
});

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

// Load saved game from localStorage
const saved = localStorage.getItem('bitminer');
if (saved) {
    try {
        const loaded = JSON.parse(saved);
        Object.assign(game, loaded);
        log('GAME LOADED');
        notify('Welcome back! Game loaded successfully.');
    } catch (e) {
        log('ERROR LOADING SAVE: ' + e.message);
        notify('Error loading save. Starting fresh.');
    }
}

// Initial UI update
update();

// Auto-save when leaving the page
window.addEventListener('beforeunload', () => {
    localStorage.setItem('bitminer', JSON.stringify(game));
});
