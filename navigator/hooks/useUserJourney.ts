import React from "react";
import { useEffect, useState } from "react";

type Position = { x: number; y: number; node?: string };

/**
 * useUserJourney
 *
 * Simulates a user walking along a fixed route.
 * - First 5s: follows the route (first point).
 * - Next 5s: derails to an off-path coordinate.
 * - After 10s+: resumes the route until the end.
 *
 * For example/demo purposes only.
 */
const mstaticRoute: Position[][] = [
  [{ x: -1549.8, y: -2118.9, node: "SN205" }],
  [{ x: 1.230586336123218e-13, y: 2009.7 }],
  [
    { x: 2274.3, y: 0 },
    { x: -2.9163738874895065e-13, y: -1587.6 },
    { x: 1127.7, y: 0 },
  ],
];
export function useUserJourney(getRouteNodesXYPosition: () => Position[][]) {
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [phase, setPhase] = useState<"onPath" | "derailed" | "resumed">(
    "onPath"
  );
  const [stepIndex, setStepIndex] = useState(0);
  const staticRoute = React.useMemo(
    () => getRouteNodesXYPosition(),
    [getRouteNodesXYPosition]
  );

  // Flatten the route into a single sequence of positions

  useEffect(() => {
    if (staticRoute.length === 0) return;
    const flatRoute = staticRoute.flat();

    // Phase 1: Start on the path
    setUserPosition(flatRoute[0]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 2: After 5s, derail
    timers.push(
      setTimeout(() => {
        setPhase("derailed");
        setUserPosition({
          x: flatRoute[0].x + 500, // arbitrary offset to simulate derail
          y: flatRoute[0].y + 500,
        });
      }, 5000)
    );

    // Phase 3: After 10s, resume route and continue
    timers.push(
      setTimeout(() => {
        setPhase("resumed");
        setStepIndex(1);
        setUserPosition(flatRoute[1]);
      }, 10000)
    );

    // Walk through the remaining steps every 5s after resuming
    flatRoute.slice(2).forEach((pos, i) => {
      timers.push(
        setTimeout(() => {
          setStepIndex(2 + i);
          setUserPosition(pos);
        }, 10000 + (i + 1) * 5000)
      );
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [staticRoute]);

  return { userPosition, phase, stepIndex };
}
