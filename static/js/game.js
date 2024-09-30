import Player from './player.js';
import Enemy from './enemy.js';
import Bullet from './bullet.js';
import UI from './ui.js';
import AudioManager from './audio.js';

class Game {
    constructor() {
        console.log('Game constructor started');
        // game area
        this.gameArea = document.getElementById('game-area');
        this.player = new Player(this.gameArea.clientWidth / 2, this.gameArea.clientHeight - 60, this.gameArea);

        // init enemies and bullets and UI
        this.enemies = [];
        this.bullets = [];
        this.ui = new UI();

        // game state
        this.isGameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.timeRemaining = 60;
        this.lastTime = 0;
        this.enemySpawnInterval = 1000;
        this.lastEnemySpawn = 0;
        this.lastBulletTime = 0;
        this.bulletCooldown = 300;

        this.level = 1;
        this.enemiesPerLevel = 10;
        this.enemiesDefeated = 0;
        this.levelUpMessage = '';
        this.levelUpMessageTimeout = null;

        /* this.bgLayers = [
            { element: document.querySelector('.bg-layer-1'), speed: 0.5, y: 0 },
            { element: document.querySelector('.bg-layer-2'), speed: 1, y: 0 },
            { element: document.querySelector('.bg-layer-3'), speed: 1.5, y: 0 }
        ]; */

        this.keys = {
            left: false,
            right: false,
            space: false
        }

        this.lastPressedKey = []

        this.audioManager = new AudioManager();
        this.audioManager.setVolume(0.5);

        this.setupEventListeners();
        console.log('Game constructor finished');
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.getElementById('continue').addEventListener('click', () => this.togglePause());
        document.getElementById('restart').addEventListener('click', () => this.restartGame());
        window.addEventListener('resize', () => this.handleResize());
        console.log('Event listeners set up');
    }

    handleResize() {
        this.player.updateBoundaries(this.gameArea.clientWidth, this.gameArea.clientHeight);
    }

    startGame() {
        // restart time
        this.lastTime = performance.now();
        console.log('Game area dimensions:', this.gameArea.clientWidth, this.gameArea.clientHeight);
        this.ui.updateScoreboard(this.score, this.lives, this.timeRemaining, this.level);
        this.audioManager.playBackgroundMusic();
        this.gameLoop(0);
    }

    gameLoop(currentTime = 0) {
        if (this.isGameOver || this.isPaused) return;

        this.update(currentTime);
        this.renderLevelUpMessage();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(currentTime) {
        //show fps counter
        const fps = 1 / ((currentTime - this.lastTime) / 1000);
        console.log('FPS:', Math.floor(fps));

        if (this.isPaused) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.timeRemaining -= deltaTime / 1000;
        if (this.timeRemaining <= 0) {
            this.gameOver();
            return;
        }

        this.player.update(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateBullets(deltaTime);
        this.checkCollisions();
        this.checkLevelUp();
        // this.updateBackground(deltaTime);

        // update keys
        if (this.keys.left && this.lastPressedKey[this.lastPressedKey.length - 1] === 'ArrowLeft') {
            this.player.moveLeft();
        } else if (this.keys.right && this.lastPressedKey[this.lastPressedKey.length - 1] === 'ArrowRight') {
            this.player.moveRight();
        }
        // stop moving if no keys are pressed
        if (!this.keys.left && !this.keys.right) {
            this.player.stopMoving();
        }
        if (this.keys.space) {
            this.shootBullet();
        }

        this.ui.updateScoreboard(this.score, this.lives, this.timeRemaining, this.level);
        console.log('Current level:', this.level, 'Delta time:', deltaTime);
    }

    updateEnemies(deltaTime) {
        if (this.isPaused) return;

        this.lastEnemySpawn += deltaTime;
        if (this.lastEnemySpawn > this.enemySpawnInterval) {
            const x = Math.random() * (this.gameArea.clientWidth - 40);
            const enemy = new Enemy(x, -40, this.gameArea);
            enemy.speed *= (1 + (this.level - 1) * 0.2);

            if (this.level >= 3 && Math.random() < 0.3) {
                enemy.health = 2;
                enemy.width = 50;
                enemy.height = 50;
            }
            if (this.level >= 5 && Math.random() < 0.2) {
                enemy.shootInterval = 2000;
            }
            if (this.level >= 7 && Math.random() < 0.1) {
                enemy.zigzag = true;
                enemy.zigzagAmplitude = 50;
                enemy.zigzagFrequency = 0.05;
            }

            this.enemies.push(enemy);
            this.lastEnemySpawn = 0;
            console.log('Enemy spawned:', enemy);
        }

        this.enemies.forEach((enemy) => enemy.update(deltaTime));
        this.enemies = this.enemies.filter((enemy) => {
            if (enemy.isDestroyed || enemy.isOffScreen(this.gameArea.clientHeight)) {
                enemy.remove();
                return false;
            }
            return true;
        });
        console.log('Enemies count:', this.enemies.length);
    }

    updateBullets(deltaTime) {
        this.bullets.forEach((bullet) => bullet.update(deltaTime));
        this.bullets = this.bullets.filter((bullet) => {
            if (bullet.isDestroyed || bullet.isOffScreen()) {
                bullet.remove();
                return false;
            }
            return true;
        });
        console.log('Bullets count:', this.bullets.length);
    }

    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    bullet.hit();
                    enemy.hit();
                    if (enemy.isDestroyed) {
                        this.score += 10 * this.level;
                        this.enemiesDefeated++;
                        this.audioManager.playSound('explosion');
                        // console.log('Enemy destroyed, score:', this.score);
                    }
                }
            });
        });

        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.checkCollision(this.player, enemy)) {
                this.lives--;
                this.audioManager.playSound('playerHit');
                enemy.isDestroyed = true;
                if (this.lives <= 0) {
                    this.gameOver();
                }
                // console.log('Player hit, lives:', this.lives);
            }
        });
    }

    checkCollision(obj1, obj2) {
        // return true if collision detected
        return (
            obj1.x < obj2.x + obj2.width && // left edge of obj1 is to the left of right edge of obj2
            obj1.x + obj1.width > obj2.x && // right edge of obj1 is to the right of left edge of obj2
            obj1.y < obj2.y + obj2.height && // top edge of obj1 is above bottom edge of obj2
            obj1.y + obj1.height > obj2.y // bottom edge of obj1 is below top edge of obj2
        );
    }

    checkLevelUp() {
        if (this.enemiesDefeated >= this.enemiesPerLevel) {
            this.level++;
            console.log('Level up! Current level:', this.level);
            this.enemiesDefeated = 0;
            this.enemySpawnInterval *= 0.85;
            this.timeRemaining += 30;
            this.enemiesPerLevel += 5;
            this.upgradeDifficulty();
            this.showLevelUpMessage();
            this.audioManager.playSound('levelUp');
        }
    }

    upgradeDifficulty() {
        this.player.upgradeWeapon(this.level);
        this.enemySpawnInterval = Math.max(300, this.enemySpawnInterval);

        if (this.level % 3 === 0) {
            this.addObstacles();
        }
        if (this.level % 5 === 0) {
            this.addBoss();
        }
    }

    addObstacles() {
        const obstacleCount = Math.min(3, Math.floor(this.level / 3));
        for (let i = 0; i < obstacleCount; i++) {
            const x = Math.random() * (this.gameArea.clientWidth - 60);
            const obstacle = new Enemy(x, this.gameArea.clientHeight / 2, this.gameArea);
            obstacle.isObstacle = true;
            obstacle.width = 60;
            obstacle.height = 60;
            obstacle.health = 5;
            obstacle.speed = 0;
            this.enemies.push(obstacle);
        }
        console.log(`${obstacleCount} obstacles added`);
    }

    addBoss() {
        const boss = new Enemy(this.gameArea.clientWidth / 2, -100, this.gameArea);
        boss.width = 100;
        boss.height = 100;
        boss.health = 20 + (this.level * 2);
        boss.speed *= 0.5;
        boss.shootInterval = 1000;
        boss.isBoss = true;
        boss.bulletPattern = Math.floor(Math.random() * 3);
        this.enemies.push(boss);
        console.log("Boss enemy added");
    }

    showLevelUpMessage() {
        this.levelUpMessage = `Level ${this.level}`;
        clearTimeout(this.levelUpMessageTimeout);
        this.levelUpMessageTimeout = setTimeout(() => {
            this.levelUpMessage = '';
        }, 3000);
    }

    renderLevelUpMessage() {
        this.ui.showLevelUpMessage(this.levelUpMessage);
    }

    /* updateBackground(deltaTime) {
        this.bgLayers.forEach((layer) => {
            layer.y += layer.speed * (deltaTime / 1000);
            if (layer.y >= this.gameArea.clientHeight) {
                layer.y = 0;
            }
            layer.element.style.transform = `translateY(${layer.y}px)`;
        });
    } */

    handleKeyDown(e) {

        if (this.isPaused && e.key !== 'Escape') {
            return;
        }

        console.log('Key pressed:', e.key);
        if (e.key === 'ArrowLeft') {
            this.keys.left = true;
            if (!this.lastPressedKey.includes('ArrowLeft')) {
                this.lastPressedKey.push('ArrowLeft');
            }
            // this.player.moveLeft();
        } else if (e.key === 'ArrowRight') {
            this.keys.right = true;
            if (!this.lastPressedKey.includes('ArrowRight')) {
                this.lastPressedKey.push('ArrowRight');
            }
            // this.player.moveRight();
        } else if (e.key === ' ') {
            this.keys.space = true;
            // this.shootBullet();
        } else if (e.key === 'Escape') {
            this.togglePause();
        }
    }

    handleKeyUp(e) {

        if (this.isPaused && e.key !== 'Escape') {
            return;
        }

        if (e.key === 'ArrowLeft') {
            this.keys.left = false;
            this.lastPressedKey = this.lastPressedKey.filter(key => key !== 'ArrowLeft');
        } else if (e.key === 'ArrowRight') {
            this.keys.right = false;
            this.lastPressedKey = this.lastPressedKey.filter(key => key !== 'ArrowRight');
        } else if (e.key === ' ') {
            this.keys.space = false;
        }
        // if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        //     this.player.stopMoving();
        // }
    }

    shootBullet() {
        const currentTime = Date.now();
        if (currentTime - this.lastBulletTime > this.bulletCooldown) {
            const bullets = this.player.shoot();
            this.bullets.push(...bullets.map(b => new Bullet(b.x, b.y, b.angle, this.player.bulletDamage, this.gameArea)));
            this.lastBulletTime = currentTime;
            this.audioManager.playSound('shoot');
            console.log('Bullet shot, total bullets:', this.bullets.length);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isGameOver) return;
        this.ui.togglePauseMenu(this.isPaused);
        if (this.isPaused) {
            this.audioManager.stopBackgroundMusic();
            this.audioManager.playSound('pause');
            this.enemies.forEach(enemy => enemy.pause());
            this.bullets.forEach(bullet => bullet.pause());
            // player should stop moving when paused
            this.keys.left = false;
            this.keys.right = false;
            this.keys.space = false;
            // this.player.speed = 0;
            this.player.stopMoving();
            this.lastPressedKey = [];
            this.player.pauseMoving();
        } else {
            this.audioManager.playSound('pause');
            this.audioManager.playBackgroundMusic();
            this.enemies.forEach(enemy => enemy.unpause());
            this.bullets.forEach(bullet => bullet.unpause()); 
            // player should start moving again
            // this.player.speed = 300;
            this.player.unpauseMoving();
            this.lastTime = performance.now();
            this.gameLoop();
        }
        console.log('Game paused:', this.isPaused);
    }

    gameOver() {
        this.isGameOver = true;
        this.ui.showGameOver(this.score);
        this.audioManager.stopBackgroundMusic();
        this.audioManager.playSound('gameOver');
        console.log('Game over, final score:', this.score);
    }

    restartGame() {
        this.audioManager.stopBackgroundMusic();
        this.ui.togglePauseMenu(false);
        this.isGameOver = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.timeRemaining = 60;
        this.lastTime = 0;
        this.enemies.forEach(enemy => enemy.remove());
        this.bullets.forEach(bullet => bullet.remove());
        this.enemies = [];
        this.bullets = [];
        this.level = 1;
        this.enemiesDefeated = 0;
        this.enemySpawnInterval = 1000;
        this.lastEnemySpawn = 0;
        this.player.reset();
        console.log('Game restarted');
        this.startGame();
    }
}

console.log('Initializing game');
const game = new Game();
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    game.startGame();
});