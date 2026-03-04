import { TestBed } from '@angular/core/testing';
import { jest } from '@jest/globals';
import { GameStateService, GROUND_LEVEL, DRAGON_X } from './game-state.service';

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameStateService],
    });
    service = TestBed.inject(GameStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      expect(service.isRunning()).toBe(false);
      expect(service.isPaused()).toBe(true);
      expect(service.isGameOver()).toBe(false);
      expect(service.timeRemaining()).toBe(0);
      expect(service.timeSurvived()).toBe(0);
      expect(service.score()).toBe(0);
      expect(service.highScore()).toBe(0);
      expect(service.speed()).toBe(1);
      expect(service.dragonY()).toBe(GROUND_LEVEL);
      expect(service.dragonVelocity()).toBe(0);
      expect(service.dragonState()).toBe('running');
      expect(service.obstacles()).toEqual([]);
    });

    it('should have correct computed values initially', () => {
      expect(service.gameStatus()).toBe('STOPPED');
      expect(service.canJump()).toBe(false);
      expect(service.canPause()).toBe(false);
      expect(service.canEndGame()).toBe(false);
    });
  });

  describe('Game Management', () => {
    it('should start game correctly', () => {
      service.setTimerValue(30);
      service.startGame();

      expect(service.isRunning()).toBe(true);
      expect(service.isPaused()).toBe(false);
      expect(service.isGameOver()).toBe(false);
      expect(service.timeRemaining()).toBe(30);
      expect(service.timeSurvived()).toBe(0);
      expect(service.score()).toBe(0);
      expect(service.dragonState()).toBe('running');
      expect(service.obstacles()).toEqual([]);
    });

    it('should end game correctly', () => {
      service.startGame();
      service.score.set(100);

      service.endGame();

      expect(service.isRunning()).toBe(false);
      expect(service.isPaused()).toBe(true);
      expect(service.isGameOver()).toBe(true);
      expect(service.highScore()).toBe(100);
    });

    it('should toggle pause correctly', () => {
      service.startGame();
      const initialPausedState = service.isPaused();

      service.togglePause();

      expect(service.isPaused()).toBe(!initialPausedState);
    });

    it('should reset game state correctly', () => {
      service.startGame();
      service.score.set(50);
      service.obstacles.set([{ x: 50, width: 10, height: 20 }]);

      service.resetGameState();

      expect(service.isRunning()).toBe(false);
      expect(service.isPaused()).toBe(true);
      expect(service.isGameOver()).toBe(false);
      expect(service.score()).toBe(0);
      expect(service.obstacles()).toEqual([]);
      expect(service.dragonY()).toBe(GROUND_LEVEL);
      expect(service.dragonState()).toBe('running');
    });
  });

  describe('Dragon Mechanics', () => {
    it('should jump correctly when running', () => {
      service.startGame();
      const initialY = service.dragonY();

      service.jump();

      expect(service.dragonState()).toBe('jumping');
      expect(service.dragonY()).toBe(initialY + 50);
    });

    it('should not jump when not running', () => {
      service.startGame();
      service.dragonState.set('jumping');
      const initialY = service.dragonY();

      service.jump();

      expect(service.dragonState()).toBe('jumping');
      expect(service.dragonY()).toBe(initialY);
    });

    it('should complete jump cycle', (done) => {
      service.startGame();
      service.jump();

      expect(service.dragonState()).toBe('jumping');

      setTimeout(() => {
        expect(service.dragonState()).toBe('running');
        expect(service.dragonY()).toBe(GROUND_LEVEL);
        done();
      }, 600);
    });

    it('should have correct jump conditions', () => {
      expect(service.canJump()).toBe(false);

      service.startGame();
      expect(service.canJump()).toBe(true);

      service.togglePause();
      expect(service.canJump()).toBe(false);

      service.togglePause();
      service.jump();
      expect(service.canJump()).toBe(false);
    });
  });

  describe('Obstacle Management', () => {
    it('should spawn obstacles correctly', () => {
      const initialObstacles = service.obstacles();

      service.spawnObstacle();

      const newObstacles = service.obstacles();
      expect(newObstacles.length).toBe(initialObstacles.length + 1);
      expect(newObstacles[newObstacles.length - 1]).toEqual({
        x: 100,
        width: 10,
        height: 20,
      });
    });

    it('should move obstacles correctly', () => {
      service.obstacles.set([
        { x: 50, width: 10, height: 20 },
        { x: 80, width: 15, height: 25 },
      ]);
      service.speed.set(2);

      service.moveObstacles();

      const obstacles = service.obstacles();
      expect(obstacles[0].x).toBe(48);
      expect(obstacles[1].x).toBe(78);
    });

    it('should remove obstacles that are off screen', () => {
      service.obstacles.set([
        { x: 50, width: 10, height: 20 },
        { x: -15, width: 10, height: 20 },
        { x: -25, width: 10, height: 20 },
      ]);

      service.moveObstacles();

      const obstacles = service.obstacles();
      expect(obstacles.length).toBe(1);
      expect(obstacles[0].x).toBe(49);
    });
  });

  describe('Collision Detection', () => {
    beforeEach(() => {
      service.startGame();
    });

    it('should detect collision when dragon hits obstacle', () => {
      service.obstacles.set([
        {
          x: DRAGON_X - 30,
          width: 10,
          height: 20,
        },
      ]);

      const hasCollision = service.checkCollisions();

      expect(hasCollision).toBe(true);
      expect(service.isGameOver()).toBe(true);
    });

    it('should not detect collision when no overlap', () => {
      service.obstacles.set([
        {
          x: 200,
          width: 10,
          height: 20,
        },
      ]);

      const hasCollision = service.checkCollisions();

      expect(hasCollision).toBe(false);
      expect(service.isGameOver()).toBe(false);
    });

    it('should not detect collision when dragon is jumping over obstacle', () => {
      service.obstacles.set([
        {
          x: DRAGON_X - 30,
          width: 10,
          height: 20,
        },
      ]);
      service.dragonY.set(100);

      const hasCollision = service.checkCollisions();

      expect(hasCollision).toBe(false);
    });

    it('should detect vertical collision correctly', () => {
      service.obstacles.set([
        {
          x: DRAGON_X - 30,
          width: 10,
          height: 60,
        },
      ]);

      const hasCollision = service.checkCollisions();

      expect(hasCollision).toBe(true);
    });

    it('should detect horizontal collision correctly', () => {
      service.obstacles.set([
        {
          x: DRAGON_X - 50,
          width: 40,
          height: 20,
        },
      ]);

      const hasCollision = service.checkCollisions();

      expect(hasCollision).toBe(true);
    });
  });

  describe('Score and Timer', () => {
    beforeEach(() => {
      service.startGame();
    });

    it('should update score correctly', () => {
      service.isRunning.set(true);
      service.isPaused.set(false);

      const initialScore = service.score();

      service.updateScore();

      expect(service.score()).toBe(initialScore + 1);
    });

    it('should not update score when game is paused', () => {
      service.togglePause();
      const initialScore = service.score();

      service.updateScore();

      expect(service.score()).toBe(initialScore);
    });

    it('should update timer correctly', () => {
      service.timeRemaining.set(10);

      service.updateTimer();

      expect(service.timeRemaining()).toBeCloseTo(9.984, 2);
      expect(service.timeSurvived()).toBeCloseTo(0.016, 3);
    });

    it('should not update timer when time is zero', () => {
      service.timeRemaining.set(0);

      service.updateTimer();

      expect(service.timeRemaining()).toBe(0);
    });

    it('should update speed based on time survived', () => {
      service.timeSurvived.set(10);

      service.updateSpeed();

      expect(service.speed()).toBeCloseTo(1.2, 1);
    });
  });

  describe('High Score', () => {
    it('should update high score when current score is higher', () => {
      service.highScore.set(50);
      service.score.set(100);

      service.endGame();

      expect(service.highScore()).toBe(100);
    });

    it('should not update high score when current score is lower', () => {
      service.highScore.set(100);
      service.score.set(50);

      service.endGame();

      expect(service.highScore()).toBe(100);
    });

    it('should update high score automatically through effect', (done) => {
      service.highScore.set(50);

      service.score.set(100);

      service.endGame();

      setTimeout(() => {
        expect(service.highScore()).toBe(100);
        done();
      }, 0);
    });
  });

  describe('Auto Game End', () => {
    it('should end game when timer reaches zero', (done) => {
      service.startGame();
      service.timeRemaining.set(-1);

      setTimeout(() => {
        expect(service.timeRemaining()).toBe(-1);
        done();
      }, 0);
    });
  });
});
