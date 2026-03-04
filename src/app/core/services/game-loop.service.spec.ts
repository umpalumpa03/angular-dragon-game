import { TestBed } from '@angular/core/testing';
import { GameLoopService } from './game-loop.service';
import { GameStateService } from './game-state.service';

describe('GameLoopService', () => {
  let service: GameLoopService;
  let gameState: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    gameState = TestBed.inject(GameStateService);
    service = TestBed.inject(GameLoopService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    service.stopGameLoop();
    jest.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Game Loop Management', () => {
    it('should start and stop game loop', () => {
      gameState.startGame();
      expect(() => service.startGameLoop()).not.toThrow();
      expect(() => service.stopGameLoop()).not.toThrow();
    });

    it('should call setInterval when starting', () => {
      const spy = jest.spyOn(global, 'setInterval');
      gameState.startGame();
      service.startGameLoop();
      expect(spy).toHaveBeenCalledWith(expect.any(Function), 16);
    });

    it('should clear intervals on cleanup', () => {
      const spy = jest.spyOn(global, 'clearInterval');
      gameState.startGame();
      service.startGameLoop();
      service.stopGameLoop();
      expect(spy).toHaveBeenCalled();
    });

    it('should clean up on destroy', () => {
      const spy = jest.spyOn(global, 'clearInterval');
      gameState.startGame();
      service.startGameLoop();
      service.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Game State Updates', () => {
    beforeEach(() => {
      gameState.startGame();
      service.startGameLoop();
    });

    it('should update game state when running', () => {
      const moveSpy = jest.spyOn(gameState, 'moveObstacles');
      const collisionSpy = jest.spyOn(gameState, 'checkCollisions');
      const scoreSpy = jest.spyOn(gameState, 'updateScore');

      jest.advanceTimersByTime(16);

      expect(moveSpy).toHaveBeenCalled();
      expect(collisionSpy).toHaveBeenCalled();
      expect(scoreSpy).toHaveBeenCalled();
    });

    it('should not update when paused', () => {
      gameState.togglePause();
      const moveSpy = jest.spyOn(gameState, 'moveObstacles');

      jest.advanceTimersByTime(16);

      expect(moveSpy).not.toHaveBeenCalled();
    });

    it('should not update when not running', () => {
      gameState.endGame();
      const moveSpy = jest.spyOn(gameState, 'moveObstacles');

      jest.advanceTimersByTime(16);

      expect(moveSpy).not.toHaveBeenCalled();
    });
  });

  describe('Obstacle Spawning', () => {
    beforeEach(() => {
      gameState.startGame();
      service.startGameLoop();
    });

    it('should spawn obstacles when running', () => {
      gameState.startGame();
      const spy = jest.spyOn(gameState, 'spawnObstacle');

      jest.runOnlyPendingTimers();

      expect(spy).toHaveBeenCalled();
    });

    it('should not spawn when paused', () => {
      gameState.togglePause();
      const spy = jest.spyOn(gameState, 'spawnObstacle');

      jest.advanceTimersByTime(3000);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should not spawn when not running', () => {
      gameState.endGame();
      const spy = jest.spyOn(gameState, 'spawnObstacle');

      jest.advanceTimersByTime(3000);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle starting without running game', () => {
      expect(() => service.startGameLoop()).not.toThrow();
    });

    it('should handle stopping when not started', () => {
      expect(() => service.stopGameLoop()).not.toThrow();
    });

    it('should handle multiple destroy calls', () => {
      expect(() => {
        service.ngOnDestroy();
        service.ngOnDestroy();
      }).not.toThrow();
    });

    it('should handle restart after stop', () => {
      gameState.startGame();
      service.startGameLoop();
      service.stopGameLoop();
      expect(() => service.startGameLoop()).not.toThrow();
    });
  });
});
