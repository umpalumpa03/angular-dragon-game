import { Component, inject } from '@angular/core';
import { GameStateService } from '../../core/services/game-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-header',
  imports: [CommonModule],
  templateUrl: './game-header.html',
  styleUrl: './game-header.scss',
})
export class GameHeader {
  public readonly gameState = inject(GameStateService);
}
