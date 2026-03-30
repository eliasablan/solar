# Gravity Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Solar Simulator with real-time planetary positions, density-based collisions with debris and growth, a 60-second time rewind, and a modern responsive UI.

**Architecture:** 
- Implement Keplerian orbital elements for real-time initial state.
- Update `collisions.ts` to spawn debris and `engine.ts` for spiral-in forces and mass-to-radius growth.
- Use a `useRef` history buffer in `usePhysics.ts` for 60s rewind.
- Implement responsive CSS/Tailwind layouts for mobile Sheets and a smooth camera reset animation.

**Tech Stack:** React 19, Next.js 16, Three.js 0.160, Tailwind CSS v4.

---

### Task 1: Real-Time Orbital Calculations

**Files:**
- Modify: `src/lib/physics/constants.ts` (Add orbital elements)
- Modify: `src/lib/physics/engine.ts` (Add `getPlanetaryState` function)
- Modify: `src/hooks/usePhysics.ts` (Use real-time initialization)

- [ ] **Step 1: Add Keplerian elements to constants.ts**
```typescript
export const J2000_PLANETS = {
  mercury: { a: 0.387, e: 0.2056, L: 252.25, p: 77.45, i: 7.005 },
  // ... (Full data for all planets)
};
```

- [ ] **Step 2: Implement getPlanetaryState in engine.ts**
```typescript
export function getPlanetaryState(name: string, date: Date) {
  // Calculate position (X, Z) based on heliocentric longitude
  // Return THREE.Vector3 for position and velocity
}
```

- [ ] **Step 3: Update usePhysics.ts to use real-time positions**
```typescript
const [bodies, setBodies] = useState<CelestialBody[]>(() => 
  INITIAL_BODIES.map(b => {
    const realState = getPlanetaryState(b.id, new Date());
    return { ...b, position: realState.pos, velocity: realState.vel };
  })
);
```

- [ ] **Step 4: Commit**
```bash
git add src/lib/physics/constants.ts src/lib/physics/engine.ts src/hooks/usePhysics.ts
git commit -m "feat: real-time planetary positions on launch"
```

---

### Task 2: Advanced Physics (Density & Growth)

**Files:**
- Modify: `src/types/index.ts` (Add `targetPlanetId` to `CelestialBody`)
- Modify: `src/lib/physics/collisions.ts` (Fragmentation logic)
- Modify: `src/lib/physics/engine.ts` (Spiral-in and Growth logic)

- [ ] **Step 1: Update type definitions**
```typescript
export interface CelestialBody {
  // ...
  targetPlanetId?: string; // For debris spiraling
}
```

- [ ] **Step 2: Update collisions.ts for Fragmentation**
```typescript
if (impactEnergy > threshold) {
  // Spawn debris with targetPlanetId
}
```

- [ ] **Step 3: Update engine.ts for Spiral-in and Radius Growth**
```typescript
// Inside stepSimulation
if (body.targetPlanetId) {
  // Apply force towards target planet surface
}
// When collision detected with surface:
planet.mass += debris.mass;
planet.radius = Math.cbrt((3 * planet.mass) / (4 * Math.PI * planet.density));
```

- [ ] **Step 4: Commit**
```bash
git add src/types/index.ts src/lib/physics/collisions.ts src/lib/physics/engine.ts
git commit -m "feat: density-based fragmentation and gradual planet growth"
```

---

### Task 3: Time Rewind (History Buffer)

**Files:**
- Modify: `src/hooks/usePhysics.ts` (History buffer logic)
- Modify: `src/components/TimeControls.tsx` (Rewind buttons)

- [ ] **Step 1: Implement history buffer in usePhysics.ts**
```typescript
const historyRef = useRef<CelestialBody[][]>([]);
// In updateSimulation:
if (frame % 6 === 0) historyRef.current.push(cloneBodies(currentBodies));
if (historyRef.current.length > 600) historyRef.current.shift();
```

- [ ] **Step 2: Add stepBack function**
```typescript
const stepBack = () => {
  if (historyRef.current.length > 0) {
    const prevState = historyRef.current.pop();
    setBodies(prevState);
  }
};
```

- [ ] **Step 3: Update UI in TimeControls.tsx**
```tsx
{isPaused && (
  <button onClick={stepBack}><SkipBackIcon /></button>
)}
```

- [ ] **Step 4: Commit**
```bash
git add src/hooks/usePhysics.ts src/components/TimeControls.tsx
git commit -m "feat: 60-second time rewind buffer and controls"
```

---

### Task 4: Responsive UI & Onboarding

**Files:**
- Modify: `src/components/SolarSimulator.tsx` (Sheet logic)
- Create: `src/components/OnboardingModal.tsx`
- Modify: `src/components/Scene3D.tsx` (Camera reset animation)

- [ ] **Step 1: Implement Adaptive Sheet in SolarSimulator.tsx**
```tsx
<div className="fixed bottom-0 left-0 w-full portrait:block landscape:hidden">...</div>
<div className="fixed top-0 right-0 h-full landscape:block portrait:hidden">...</div>
```

- [ ] **Step 2: Create OnboardingModal with signature**
```tsx
// Modal logic with localStorage check
// Footer: Created by eliasablan.dev
```

- [ ] **Step 3: Implement Smooth Camera Reset in Scene3D.tsx**
```typescript
// Use lerp to move camera to [0, 150, 300] over time
```

- [ ] **Step 4: Commit**
```bash
git add src/components/SolarSimulator.tsx src/components/OnboardingModal.tsx src/components/Scene3D.tsx
git commit -m "ui: responsive mobile sheets, onboarding modal, and smooth camera reset"
```

---

### Task 5: Testing & Verification (STOP HERE)

- [ ] **Step 1: Verify Planet Growth**
- [ ] **Step 2: Verify Rewind Functionality**
- [ ] **Step 3: Verify Mobile Sheet Responsiveness**
- [ ] **Step 4: Verify Onboarding Persistence**
