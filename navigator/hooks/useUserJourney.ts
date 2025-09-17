import { useEffect, useState } from "react";

type Position = { x: number; y: number; node?: string };

/**
 * useUserJourney
 *
 * Simulates a real user journey along a static route.
 * Behavior:
 * - First 5s: follows the first path position.
 * - Next 5s: "derails" by moving to an off-path coordinate.
 * - After that: resumes the given route until the end.
 *
 * This is meant for demo/UX purposes, not real navigation.
 */
export function useUserJourney(route: Position[][]) {
  const [userPosition, setUserPosition] = useState<Position>({ x: 0, y: 0 });
  const [phase, setPhase] = useState<
    "onPath" | "derailed" | "resumed" | "done"
  >("onPath");

  useEffect(() => {
    if (!route || route.length === 0) return;

    let timer1: ReturnType<typeof setTimeout>;
    let timer2: ReturnType<typeof setTimeout>;
    let timer3: ReturnType<typeof setTimeout>;

    // Phase 1: follow the path (first 5s)
    timer1 = setTimeout(() => {
      setUserPosition(route[0][0]); // first path point
      setPhase("onPath");
    }, 5000);

    // Phase 2: derail (next 5s)
    timer2 = setTimeout(() => {
      setUserPosition({ x: route[0][0].x + 500, y: route[0][0].y + 500 }); // off-route point
      setPhase("derailed");
    }, 10000);

    // Phase 3: resume path (rest of route)
    timer3 = setTimeout(() => {
      const allPoints = route.flat();
      let i = 0;
      const interval = setInterval(() => {
        if (i < allPoints.length) {
          setUserPosition(allPoints[i]);
          setPhase("resumed");
          i++;
        } else {
          clearInterval(interval);
          setPhase("done");
        }
      }, 2000); // step every 2s once resuming
    }, 15000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [route]);

  return { userPosition, phase };
}
