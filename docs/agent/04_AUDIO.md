# Audio Engine & Real-Time Synthesis

## Core Principle
BombTogether does not load sound files. All audio is synthesized on the fly via the Web Audio API.

## AudioContext Initialization
Browser security policies block audio from starting before user interaction.
* AudioEngine.init() must be invoked during the first user interaction event (e.g., keydown or UI button clicks).
* The context must auto-resume if suspended:
``` javascript
if (this.ctx && this.ctx.state === "suspended") {
  this.ctx.resume();
}
``` 

## Sound Synthesis Specifications

### 1. Explosions (Filtered White Noise)
* Generates an in-memory AudioBuffer populated with random samples (Math.random() * 2 - 1).
* Routed through a low-pass BiquadFilterNode:
  * Start frequency: 800 Hz
  * Exponential ramp down to: 50 Hz over 0.3s.
* Routed through a GainNode:
  * Start volume: 0.4
  * Exponential ramp down to: 0.01 over 0.3s.

### 2. Bomb Placement
* Square wave oscillator at 300 Hz for 0.08 seconds.

### 3. Power-Up Pickup
* Rapid upward arpeggio of triangle waves:
  * Notes: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz), C6 (1046.50 Hz)
  * Interval: 70ms step, duration 0.1s each.

### 4. Revive Sound
* Upward fanfare sequence of triangle waves:
  * Notes: E4 (329.63 Hz), A4 (440.00 Hz), C#5 (554.37 Hz), E5 (659.25 Hz), A5 (880.00 Hz)
  * Interval: 65ms step, duration 0.12s each.

### 5. Death
* Sawtooth oscillator descending from 150 Hz with 0.4s duration.