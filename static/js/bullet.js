export default class Bullet {
    constructor(x, y, angle = 0, damage = 1, gameArea) {
        // sizes
        this.gameArea = gameArea;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;

        // bullet properties
        this.speed = 600;
        this.angle = angle;
        this.damage = damage;
        this.isDestroyed = false;
        this.pausedSpeed = 0;

        // cell element
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        this.gameArea.appendChild(this.element);
        this.updatePosition();
    }

    update(deltaTime) {
        this.y -= this.speed * Math.cos(this.angle) * (deltaTime / 1000);
        this.x += this.speed * Math.sin(this.angle) * (deltaTime / 1000);
        this.updatePosition();
    }

    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotate(${this.angle}rad)`;
    }

    isOffScreen() {
        return this.y + this.height < 0;
    }

    hit() {
        this.isDestroyed = true;
    }

    pause() {
        this.pausedSpeed = this.speed;
        this.speed = 0;
    }

    unpause() {
        this.speed = this.pausedSpeed;
    }

    remove() {
        this.gameArea.removeChild(this.element);
    }
}
