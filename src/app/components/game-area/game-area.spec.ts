import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameArea } from './game-area';
import { GameStateService } from '../../core/services/game-state.service';
import { GameLoopService } from '../../core/services/game-loop.service';

describe('GameArea', () => {
  let component: GameArea;
  let fixture: ComponentFixture<GameArea>;
  let gameState: GameStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameArea],
    }).compileComponents();

    fixture = TestBed.createComponent(GameArea);
    component = fixture.componentInstance;
    gameState = TestBed.inject(GameStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have DRAGON_X constant', () => {
    expect(component.DRAGON_X).toBeDefined();
    expect(typeof component.DRAGON_X).toBe('number');
  });

  it('should have access to game state', () => {
    expect(component.gameState).toBe(gameState);
  });

  describe('Dragon Position', () => {
    it('should track dragon Y position', () => {
      expect(typeof gameState.dragonY()).toBe('number');
    });

    it('should track dragon state', () => {
      expect(['running', 'jumping', 'falling']).toContain(gameState.dragonState());
    });
  });

  describe('Game Restart', () => {
    afterEach(() => {
      const gameLoop = TestBed.inject(GameLoopService);
      gameLoop.stopGameLoop();
    });

    it('should restart game correctly', () => {
      gameState.startGame();
      gameState.score.set(100);

      component.onRestart();

      expect(gameState.score()).toBe(0);
      expect(gameState.isRunning()).toBe(true);
    });

    it('should reset obstacles on restart', () => {
      gameState.obstacles.set([{ x: 50, width: 10, height: 20 }]);

      const resetSpy = jest.spyOn(gameState, 'resetGameState');
      const startSpy = jest.spyOn(gameState, 'startGame');

      component.onRestart();

      expect(resetSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
      expect(gameState.score()).toBe(0);
    });
  });

  describe('Obstacles', () => {
    it('should have access to obstacles', () => {
      expect(Array.isArray(gameState.obstacles())).toBe(true);
    });

    it('should track obstacle positions', () => {
      gameState.obstacles.set([
        { x: 100, width: 10, height: 20 },
        { x: 50, width: 15, height: 25 },
      ]);

      const obstacles = gameState.obstacles();
      expect(obstacles[0].x).toBe(100);
      expect(obstacles[1].x).toBe(50);
    });
  });

  describe('Integration', () => {
    it('should reflect game status', () => {
      expect(gameState.gameStatus()).toBe('STOPPED');
      gameState.startGame();
      expect(gameState.gameStatus()).toBe('RUNNING');
    });

    it('should detect collisions', () => {
      gameState.startGame();
      gameState.obstacles.set([{ x: component.DRAGON_X - 30, width: 10, height: 20 }]);

      const hasCollision = gameState.checkCollisions();
      expect(hasCollision).toBe(true);
    });
  });
});
