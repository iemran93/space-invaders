export default class UI {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.timerElement = document.getElementById('timer');
        this.levelElement = document.getElementById('level');
        this.levelUpMessage = document.getElementById('level-up-message');
        this.pauseMenu = document.getElementById('pause-menu');
    }

    updateScoreboard(score, lives, timeRemaining, level) {
        this.scoreElement.textContent = `Score: ${score}`;
        this.livesElement.textContent = `Lives: ${lives}`;
        this.timerElement.textContent = `Time: ${Math.max(0, Math.floor(timeRemaining))}`;
        this.levelElement.textContent = `Level: ${level}`;
        console.log('Scoreboard updated:', score, lives, timeRemaining, level);
    }

    togglePauseMenu(isPaused) {
        this.pauseMenu.classList.toggle('hidden', !isPaused);
    }

    showGameOver(score) {
        this.pauseMenu.innerHTML = `
            <h2>Game Over</h2>
            <p>Your score: ${score}</p>
            <button id="restart">Restart</button>
        `;
        this.pauseMenu.classList.remove('hidden');
        document.getElementById('restart').addEventListener('click', () => window.location.reload());
    }

    showLevelUpMessage(levelMsg) {
        if (levelMsg) {
            this.levelUpMessage.classList.remove('hidden');
            this.levelUpMessage.innerHTML = `
            <p>${levelMsg}</p>
            `
        } else {
            this.levelUpMessage.innerHTML = '';
            this.levelUpMessage.classList.add('hidden');
        }
    }
}
