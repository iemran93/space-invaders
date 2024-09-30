/*
maybe for the future
*/

export default class AudioManager {
    constructor() {
        this.sounds = {
            backgroundMusic: new Audio('/static/audio/background-music.mp3'),
            shoot: new Audio('/static/audio/shoot.mp3'),
            explosion: new Audio('/static/audio/explosion.mp3'),
            levelUp: new Audio('/static/audio/level-up.mp3'),
            gameOver: new Audio('/static/audio/game-over.mp3'),
            playerHit: new Audio('/static/audio/lives.mp3'),
            pause: new Audio('/static/audio/pause.mp3'),
        };

        // Set background music to loop
        this.sounds.backgroundMusic.loop = true;

        // Preload all sounds
        for (let sound in this.sounds) {
            this.sounds[sound].load();
        }
    }

    playBackgroundMusic() {
        this.sounds.backgroundMusic.play();
    }

    stopBackgroundMusic() {
        this.sounds.backgroundMusic.pause();
        this.sounds.backgroundMusic.currentTime = 0;
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }

    setVolume(volume) {
        for (let sound in this.sounds) {
            this.sounds[sound].volume = volume;
        }
    }
}
