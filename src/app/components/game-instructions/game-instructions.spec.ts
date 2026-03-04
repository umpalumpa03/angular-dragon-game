import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInstructions } from './game-instructions';

describe('GameInstructions', () => {
  let component: GameInstructions;
  let fixture: ComponentFixture<GameInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInstructions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameInstructions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
