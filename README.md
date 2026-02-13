# Bitminer 💎

[PLAY BITMINER NOW](https://bl4k7en.github.io/bitminer/)

![til](https://github.com/bl4k7en/bitminer/blob/main/artworks/intro.gif)

[Now on Itch.io](https://black7en.itch.io/bitminer)

Bitminer is a minimalist, idle clicker game where you mine digital "Bits" by clicking, hire automated workers, and upgrade your mining operation.
The core loop involves progressing through ranks, achieving milestones, and performing "Ascensions" to gain permanent bonuses for faster progress in new games.


Bitminer v1.3 – Patch Notes


Bug Fixes

Quantum Miner rate was hardcoded to 1,000,000. Now correctly uses w.rate as its base, averaging ~500k/s with random variation.

Number formatting stopped at 1Q (Quadrillion). Counter now runs through: M → B → T → Q → Qi → Sx → Sp → Oc → No → Dc, then falls back to scientific notation beyond 1e36.

Offline progression used a flat rate calculation that ignored rank bonuses. Now simulates offline time step-by-step through each rank threshold, applying the correct multiplier per segment. Capped at 8 hours, 50% efficiency.



New Content

6 new ranks extending progression to 1 Decillion (1e33):

Cosmic (+2000%) → Stellar (+3000%) → Galactic (+5000%) → Universal (+8000%) → Omnipotent (+12000%) → Absolute (+20000%)



UI / QoL


Sub-counter — a small secondary counter below the main bit display shows the remainder the main counter cuts off (e.g. main shows 1.5Qi, sub shows +500Q). Always moving.

Click Skins — now show +X PWR directly under the icon. Locked skins show their unlock threshold instead.

Rank display — colored box removed. Rank number is now shown as colored text matching the rank color.

Log panel — expanded to show 9 entries.

Workers panel — capped with scroll to prevent secret workers from shifting the layout when unlocked.

Scroll indicators — small ▲ / ▼ arrows appear on scrollable panels (Workers, Log, Achievements) to indicate scrollable content.

Panel scroll isolation — scrolling inside a panel no longer scrolls the page.

Layout — right column now starts flush with the other columns. Achievements and Save Management panels extend to match the log panel height.


Core Gameplay & Features:


Click to Mine: Manually collect Bits with satisfying visual feedback.

Automation: Hire workers to generate passive income.

Progression: Ascend for permanent boosts and climb the ranks.

Achievements: Unlock 45 achievements to earn multiplier rewards.



Technical Details:

Built with pure HTML, CSS, and JavaScript.

No external libraries; saves locally in your browser.

Fully responsive and works on desktop and mobile browsers, even offline.

## 💎 Support
If you enjoy the game:  
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support-orange?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/bl4k_7en)
