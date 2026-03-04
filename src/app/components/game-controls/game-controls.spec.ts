import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameControls } from './game-controls';
import { GameStateService } from '../../core/services/game-state.service';
import { GameLoopService } from '../../core/services/game-loop.service';

describe('GameControls', () => {
  let component: GameControls;
  let fixture: ComponentFixture<GameControls>;
  let gameState: GameStateService;
  let gameLoop: GameLoopService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameControls],
    }).compileComponents();

    fixture = TestBed.createComponent(GameControls);
    component = fixture.componentInstance;
    gameState = TestBed.inject(GameStateService);
    gameLoop = TestBed.inject(GameLoopService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dragon Controls', () => {
    it('should trigger jump', () => {
      const spy = jest.spyOn(gameState, 'jump');
      component.onJump();
      expect(spy).toHaveBeenCalled();
    });

    it('should allow jump when game is running', () => {
      gameState.startGame();
      component.onJump();
      expect(gameState.dragonState()).toBe('jumping');
    });

    it('should prevent jump when paused', () => {
      gameState.startGame();
      gameState.togglePause();
      expect(gameState.canJump()).toBe(false);
    });
  });

  describe('Game Management', () => {
    it('should start game and loop', () => {
      const startSpy = jest.spyOn(gameState, 'startGame');
      const loopSpy = jest.spyOn(gameLoop, 'startGameLoop');

      component.onStartGame();

      expect(startSpy).toHaveBeenCalled();
      expect(loopSpy).toHaveBeenCalled();
    });

    it('should end game and stop loop', () => {
      const endSpy = jest.spyOn(gameState, 'endGame');
      const stopSpy = jest.spyOn(gameLoop, 'stopGameLoop');

      component.onEndGame();

      expect(endSpy).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should restart game', () => {
      const startSpy = jest.spyOn(gameState, 'startGame');
      component.onRestart();
      expect(startSpy).toHaveBeenCalled();
    });

    it('should toggle pause', () => {
      const spy = jest.spyOn(gameState, 'togglePause');
      component.onTogglePause();
      expect(spy).toHaveBeenCalled();
    });

    it('should update timer and start game', () => {
      const timerSpy = jest.spyOn(gameState, 'setTimerValue');
      const startSpy = jest.spyOn(component, 'onStartGame');

      component.onTimerChange(30);

      expect(timerSpy).toHaveBeenCalledWith(30);
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should have access to game state', () => {
      expect(component.gameState).toBe(gameState);
    });

    it('should handle collisions', () => {
      gameState.startGame();
      gameState.obstacles.set([{ x: 0, width: 100, height: 60 }]);

      const hasCollision = gameState.checkCollisions();
      expect(hasCollision).toBe(true);
    });

    it('should handle rapid actions', () => {
      gameState.startGame();
      component.onJump();
      component.onTogglePause();
      component.onTogglePause();

      expect(gameState.isRunning()).toBe(true);
    });
  });
});
