export default class Player {
    constructor(x, y, gameArea) {
        this.gameArea = gameArea;
        this.width = 75;
        this.height = 75;
        this.speed = 300;
        this.savedDirection = 0;
        this.element = document.getElementById('player');
        this.reset();
        // console.log('Player created/reset at:', this.x, this.y);
    }

    update(deltaTime) {
        this.x += this.direction * this.speed * (deltaTime / 1000);
        this.x = Math.max(0, Math.min(this.x, this.gameArea.clientWidth - this.width));
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        // console.log('Player position updated:', this.x, this.y);
        // console.log('Player element style:', this.element.style.left, this.element.style.top);
    }

    moveLeft() {
        this.direction = -1;
    }

    moveRight() {
        this.direction = 1;
    }

    stopMoving() {
        this.direction = 0;
    }

    reset() {
        this.x = this.gameArea.clientWidth / 2 - this.width / 2;
        this.y = this.gameArea.clientHeight - this.height - 10;
        this.direction = 0;
        this.spreadShot = false;
        this.bulletDamage = 1;
        this.updatePosition();
        // console.log('Player created/reset at:', this.x, this.y);
    }

    shoot() {
        // math is fun ha!
        if (this.spreadShot) {
            return [
                { x: this.x + this.width / 2 -20, y: this.y, angle: -Math.PI / 12 },
                { x: this.x + this.width / 2 -20, y: this.y, angle: 0 },
                { x: this.x + this.width / 2 -20, y: this.y, angle: Math.PI / 12 }
            ];
        } else {
            return [{ x: this.x + this.width / 2 - 20, y: this.y, angle: 0 }];
        }
    }

    upgradeWeapon(level) {
        if (level % 2 === 0) {
            this.speed = Math.min(500, this.speed + 25);
        }
        if (level % 3 === 0) {
            this.spreadShot = true;
        }
        if (level % 4 === 0) {
            this.bulletDamage++;
        }
    }

    updateBoundaries(width, height) {
        this.x = Math.min(this.x, width - this.width);
        this.y = height - this.height - 10;
        this.updatePosition();
    }

    pauseMoving() {
        // save the current position
        this.savedDirection = this.direction;
    }

    unpauseMoving() {
        // restore the saved position
        this.direction = this.savedDirection;
    }
}
