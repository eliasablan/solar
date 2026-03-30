# Design Spec: Gravity Evolution & Real-Time Simulation

**Date:** 2026-03-30  
**Topic:** Gravity Evolution & Real-Time Simulation  
**Author:** Gemini CLI (for Elias Ablan)  
**Status:** Approved  

## 1. Project Overview
This update transforms the Solar Simulator from a static model into a dynamic, "living" universe. Key improvements include real-time planetary positioning, physics-based growth/destruction, and a robust time-control system (Rewind/Stepping).

## 2. Core Features

### 2.1 Real-Time Planetary Positions
*   **Goal:** Start the simulation with planets in their actual current heliocentric longitudes.
*   **Implementation:** 
    *   Implement `getPlanetaryState(planet, timestamp)` in `lib/physics/engine.ts`.
    *   Use J2000 epoch Keplerian elements (Semi-major axis, eccentricity, mean longitude).
    *   At app launch, set initial positions based on `new Date()`.
*   **Fallback:** If calculation fails, use the original hardcoded distances.

### 2.2 Density-Based Collisions & Slow Growth
*   **The "Fragmentation" Rule:**
    *   If `(asteroid.density * velocity) > PlanetStrengthThreshold`, the planet takes "damage."
    *   Instead of instant absorption, the impact spawns 10-20 "Debris" fragments.
*   **The "Slow Absorption" Loop:**
    *   Debris are physical objects with a `targetPlanetId`.
    *   A spiral-in force is applied to debris in the physics engine: `Force = Gravity + TangentialSpiralDrag`.
    *   When Debris touches the surface:
        1. `Planet.mass += Debris.mass`
        2. `Planet.radius = Math.cbrt((3 * mass) / (4 * PI * density))`
        3. Visual mesh scales smoothly to the new radius.

### 2.3 Time Rewind (60s Buffer)
*   **History Buffer:** `historyRef` in `usePhysics.ts` will store a snapshot of all bodies every 100ms.
*   **Rewind Logic:** When `isPaused`, the user can "Step Back" through the buffer.
*   **Memory Management:** Buffer is capped at 600 entries (60 seconds). Entries older than 60s are shifted out.
*   **UI:** Add `SkipBack` and `SkipForward` buttons to `TimeControls.tsx` (only visible when paused).

### 2.4 Responsive UI (Mobile Sheets)
*   **Adaptive Layout:**
    *   **Portrait:** Controls appear in a Bottom Sheet (Slide-up menu).
    *   **Landscape:** Controls move to a Right Sheet (Sidebar).
*   **Persistence:** Menu does not close on interaction. Only the "Close" button or background click dismisses it.
*   **Onboarding Modal:** 
    *   Displays on first load using `localStorage.getItem('seen_onboarding')`.
    *   Explains controls and features.
    *   Footer Signature: "Created by [eliasablan.dev](https://eliasablan.dev)".

### 2.5 Camera Smoothing
*   **Goal:** Smoothly restore view when "Reset" is clicked.
*   **Implementation:** Use `THREE.MathUtils.lerp` or a dedicated animation loop in `Scene3D.tsx` to transition `OrbitControls.target` and `Camera.position` over 1 second.

## 3. Technical Requirements
*   **Physics:** Motor de integración Verlet personalizado (keep existing engine structure).
*   **State:** Use `useRef` for history to avoid React re-render lag during physics steps.
*   **Styling:** Tailwind CSS v4.

## 4. Testing & Verification
*   **Physics Test:** Spawn high-density asteroid and verify planet radius increase after 3 seconds.
*   **Rewind Test:** Run simulation for 10s, pause, rewind 5s, and verify positions match previous state.
*   **UI Test:** Rotate device between Portrait and Landscape; verify menu switches from Bottom to Right.

## 5. Success Criteria
1. Planets start in real-world relative positions.
2. Collisions trigger visible debris and gradual planetary growth.
3. User can rewind exactly 60 seconds of history.
4. Camera reset is a smooth "flight" rather than a jump.
5. Onboarding modal correctly remembers "dismissed" state.
