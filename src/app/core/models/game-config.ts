export const GAME_LOOP_INTERVAL_MS = 16;
export const TIMER_TICK_SECONDS = GAME_LOOP_INTERVAL_MS / 1_000;

export const SPAWN_MIN_DELAY_MS = 1_800;
export const SPAWN_RANDOM_DELAY_MS = 1_200;

export const GROUND_LEVEL = 50;

export const DRAGON_X = 30;
export const DRAGON_HEIGHT = 40;
export const DRAGON_HITBOX_LEFT_OFFSET = 41;
export const DRAGON_HITBOX_RIGHT_OFFSET = 21;

export const JUMP_HEIGHT = 60;
export const JUMP_DURATION_MS = 500;

export const OBSTACLE_START_X = 100;
export const OBSTACLE_DEFAULT_WIDTH = 10;
export const OBSTACLE_DEFAULT_HEIGHT = 20;
export const OBSTACLE_GROUND_LEVEL = 40;

export const SCORE_PER_TICK = 1;
export const BONUS_POINTS_PER_JUMP = 100;

export const SPEED_BASE = 1;
export const SPEED_PER_SECOND = 0.02;

export const MIN_TIMER_SECONDS = 10;
export const MAX_TIMER_SECONDS = 300;
export const DEFAULT_TIMER_SECONDS = 60;

export const HIGH_SCORE_STORAGE_KEY = 'dragon_runner_high_score';