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

const l = {
  start: "northEntrance",
  edges: [
    {
      to: "southEnthrance",
      weight: 2,
      path: [{ dir: "north", distance: 19.62 }],
    },
    {
      to: "lift_F0_West",
      weight: 2,
      path: [
        { dir: "north", distance: 1 },
        { dir: "west", distance: 1 },
        { dir: "south", distance: 1 },
      ],
    },
    { to: "lift_F4_West", weight: 1, path: [{ dir: "north", distance: 1 }] },
    {
      to: "passage_F4_west",
      weight: 1,
      path: [{ dir: "west", distance: 1.5 }],
    },
    {
      to: "office of the vc",
      weight: 1,
      path: [{ dir: "north", distance: 2.73 }],
    },
  ],
};

export function useUserJourney(getRouteNodesXYPosition: () => Position[][]) {
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [heading, setHeading] = useState<Position | null>(null);
  const staticRoute = React.useMemo(
    () => getRouteNodesXYPosition(),
    [getRouteNodesXYPosition]
  );

  useEffect(() => {
    if (staticRoute.length === 0) return;

    const flatRoute = staticRoute.flat();
    if (flatRoute.length < 2) return;

    let segmentIndex = 0;
    let progress = 0;
    const stepSize = 0.02; // 50 steps per segment
    const stepInterval = 1200; // ms per step

    const interval = setInterval(() => {
      const from = flatRoute[segmentIndex];
      const to = flatRoute[segmentIndex + 1];
      if (!to) {
        clearInterval(interval);
        return;
      }

      // Interpolated position
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;
      setUserPosition({ x, y, node: progress >= 1 ? to.node : from.node });

      // Compute heading vector (constant for each segment)
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        setHeading({ x: dx / len, y: dy / len });
      }

      progress += stepSize;
      if (progress >= 1) {
        // move to next segment
        segmentIndex++;
        progress = 0;
      }
    }, stepInterval);

    return () => clearInterval(interval);
  }, [staticRoute]);

  return { userPosition, heading };
}
