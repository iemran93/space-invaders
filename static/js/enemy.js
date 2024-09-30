export default class Enemy {
    constructor(x, y, gameArea) {
        // sizes
        this.gameArea = gameArea;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;

        // cell element 
        this.element = document.createElement('div');
        this.element.className = 'enemy';
        this.gameArea.appendChild(this.element);

        // enemy properties
        this.speed = 100;
        this.isDestroyed = false;
        this.health = 1;
        this.shootInterval = null;
        this.lastShot = 0;

        // enemy levels
        this.zigzag = false;
        this.zigzagAmplitude = 0;
        this.zigzagFrequency = 0;
        this.initialX = x;
        this.isObstacle = false;
        this.isBoss = false;
        this.bulletPattern = 0;

        // pause properties
        this.isPaused = false;
        this.pausedX = 0;
        this.pausedY = 0;
        this.pausedSpeed = 0;
        this.pausedZigzagX = null;
        this.updatePosition();
        // console.log('Enemy created at', x, y);
    }

    update(deltaTime) {
        if (this.isPaused || this.isObstacle) return;

        if (this.zigzag) {
            // sin and cos :|
            this.x = this.initialX + Math.sin(this.y * this.zigzagFrequency) * this.zigzagAmplitude;
        }

        this.y += this.speed * (deltaTime / 1000);

        if (this.shootInterval) {
            this.lastShot += deltaTime;
            if (this.lastShot >= this.shootInterval) {
                this.shoot();
                this.lastShot = 0;
            }
        }

        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight;
    }

    hit() {
        this.health--;
        if (this.health <= 0) {
            this.isDestroyed = true;
        }
    }

    shoot() {
        console.log('Enemy shoot');
    }

    /* 
    pause and unpause
    save current position and speed when pausing 
    */
    pause() {

        this.isPaused = true;
        this.pausedX = this.x;
        this.pausedY = this.y;
        this.pausedSpeed = this.speed;
        this.pausedZigzagX = this.zigzag ? this.initialX : null;
        this.speed = 0;
    }

    unpause() {
        this.isPaused = false;
        this.x = this.pausedX;
        this.y = this.pausedY;
        this.speed = this.pausedSpeed;
        if (this.zigzag) {
            this.initialX = this.pausedZigzagX;
        }
        this.updatePosition();
    }

    remove() {
        this.gameArea.removeChild(this.element);
    }
}
