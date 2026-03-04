import { TestBed } from '@angular/core/testing';
import { GameStateService, GROUND_LEVEL, DRAGON_X } from './game-state.service';
import { GameLoopService } from './game-loop.service';

describe('Game Services Integration', () => {
  let gameState: GameStateService;
  let gameLoop: GameLoopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    gameState = TestBed.inject(GameStateService);
    gameLoop = TestBed.inject(GameLoopService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    gameLoop.stopGameLoop();
    gameState.resetGameState();
    jest.useRealTimers();
  });

  describe('Complete Game Flow', () => {
    it('should handle full game lifecycle', () => {
      gameState.setTimerValue(10);
      gameState.startGame();
      gameLoop.startGameLoop();

      expect(gameState.isRunning()).toBe(true);
      expect(gameState.isPaused()).toBe(false);
      expect(gameState.gameStatus()).toBe('RUNNING');

      gameState.jump();
      expect(gameState.dragonState()).toBe('jumping');

      gameState.togglePause();
      expect(gameState.isPaused()).toBe(true);

      gameState.endGame();
      expect(gameState.isGameOver()).toBe(true);
    });

    it('should manage score progression', () => {
      gameState.startGame();
      const initialScore = gameState.score();

      gameState.updateScore();

      expect(gameState.score()).toBe(initialScore + 1);
    });

    it('should handle obstacle spawning and movement', () => {
      gameState.startGame();

      gameState.spawnObstacle();
      expect(gameState.obstacles().length).toBe(1);

      gameState.moveObstacles();
      expect(gameState.obstacles()[0].x).toBeLessThan(100);
    });

    it('should detect collisions', () => {
      gameState.startGame();
      gameState.obstacles.set([{ x: DRAGON_X - 30, width: 10, height: 20 }]);

      const hasCollision = gameState.checkCollisions();

      expect(hasCollision).toBe(true);
      expect(gameState.isGameOver()).toBe(true);
    });
  });

  describe('Dragon Movement', () => {
    beforeEach(() => gameState.startGame());

    it('should handle jump mechanics', () => {
      const initialY = gameState.dragonY();

      gameState.jump();

      expect(gameState.dragonState()).toBe('jumping');
      expect(gameState.dragonY()).toBe(initialY + 50);
      expect(gameState.canJump()).toBe(false);
    });

    it('should prevent jump when paused', () => {
      gameState.togglePause();

      expect(gameState.canJump()).toBe(false);

      gameState.jump();
      expect(gameState.dragonState()).toBe('jumping');
    });

    it('should handle collision during jump', () => {
      gameState.obstacles.set([{ x: DRAGON_X - 30, width: 10, height: 20 }]);

      gameState.dragonY.set(80);
      expect(gameState.checkCollisions()).toBe(false);

      gameState.dragonY.set(GROUND_LEVEL);
      expect(gameState.checkCollisions()).toBe(true);
    });
  });

  describe('Timer and Speed', () => {
    beforeEach(() => gameState.startGame());

    it('should update speed based on survival time', () => {
      const initialSpeed = gameState.speed();

      gameState.timeSurvived.set(10);
      gameState.updateSpeed();

      expect(gameState.speed()).toBeGreaterThan(initialSpeed);
    });

    it('should manage timer countdown', () => {
      gameState.timeRemaining.set(5);
      gameState.updateTimer();
      expect(gameState.timeRemaining()).toBeLessThan(5);
    });

    it('should stop timer at zero', () => {
      gameState.timeRemaining.set(0);
      gameState.updateTimer();
      expect(gameState.timeRemaining()).toBe(0);
    });
  });

  describe('Game Loop', () => {
    beforeEach(() => {
      gameState.startGame();
      gameLoop.startGameLoop();
    });

    afterEach(() => gameLoop.stopGameLoop());

    it('should handle pause/resume cycles', () => {
      gameState.togglePause();
      expect(gameState.isPaused()).toBe(true);

      gameState.togglePause();
      expect(gameState.isPaused()).toBe(false);
    });

    it('should maintain game state consistency', () => {
      gameState.spawnObstacle();
      gameState.moveObstacles();
      gameState.updateScore();

      expect(gameState.obstacles().length).toBeGreaterThan(0);
      expect(gameState.score()).toBeGreaterThan(0);
      expect(gameState.isRunning()).toBe(true);
    });

    it('should handle game over state', () => {
      gameState.obstacles.set([{ x: 0, width: 100, height: 60 }]);
      gameState.checkCollisions();

      expect(gameState.isGameOver()).toBe(true);
      expect(gameState.isRunning()).toBe(false);
    });
  });

  describe('Reset and Restart', () => {
    it('should reset all game state', () => {
      gameState.startGame();
      gameState.score.set(100);
      gameState.obstacles.set([{ x: 50, width: 10, height: 20 }]);
      gameState.jump();

      gameState.resetGameState();

      expect(gameState.score()).toBe(0);
      expect(gameState.obstacles()).toEqual([]);
      expect(gameState.dragonY()).toBe(GROUND_LEVEL);
      expect(gameState.dragonState()).toBe('running');
      expect(gameState.isRunning()).toBe(false);
    });

    it('should restart game after reset', () => {
      gameState.startGame();
      gameState.endGame();

      gameState.resetGameState();
      gameState.startGame();

      expect(gameState.isRunning()).toBe(true);
      expect(gameState.isPaused()).toBe(false);
      expect(gameState.score()).toBe(0);
    });
  });

  describe('High Score', () => {
    it('should update high score across sessions', () => {
      gameState.startGame();
      gameState.score.set(150);
      gameState.endGame();

      const firstHigh = gameState.highScore();

      gameState.resetGameState();
      gameState.startGame();
      gameState.score.set(200);
      gameState.endGame();

      expect(gameState.highScore()).toBeGreaterThan(firstHigh);
    });

    it('should not decrease high score', () => {
      gameState.startGame();
      gameState.score.set(100);
      gameState.endGame();

      const initialHigh = gameState.highScore();

      gameState.resetGameState();
      gameState.startGame();
      gameState.score.set(50);
      gameState.endGame();

      expect(gameState.highScore()).toBe(initialHigh);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple obstacle collisions', () => {
      gameState.startGame();
      gameState.obstacles.set([
        { x: DRAGON_X - 30, width: 10, height: 20 },
        { x: DRAGON_X + 20, width: 10, height: 20 },
      ]);

      const hasCollision = gameState.checkCollisions();
      expect(hasCollision).toBe(true);
    });

    it('should handle collision during jump cleanup', () => {
      gameState.startGame();
      gameState.jump();
      gameState.obstacles.set([{ x: DRAGON_X - 30, width: 40, height: 20 }]);

      gameState.dragonY.set(GROUND_LEVEL);
      const hasCollision = gameState.checkCollisions();

      expect(hasCollision).toBe(true);
    });

    it('should handle rapid state changes', () => {
      gameState.startGame();

      for (let i = 0; i < 5; i++) {
        gameState.togglePause();
        gameState.updateScore();
        gameState.updateTimer();
      }

      expect(gameState.isRunning()).toBe(true);
    });
  });
});
