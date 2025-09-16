import { Travelling } from "@/app/_types";
import { useEffect, useState } from "react";

/**
 * useRouteSimulator
 *
 * Simulates moving through the route edge by edge.
 * Every 5 seconds, it advances to the next group of directions (an inner array).

 */
export function useRouteSimulator(directions: Travelling[][]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [directionsToNextNode, setDirectionsToNextNode] = useState<
    Travelling[]
  >(directions[currentIndex] || []);
  useEffect(() => {
    if (directions.length === 0) return;
    if (currentIndex >= directions.length) {
      setIsComplete(true);
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 < directions.length) {
          setDirectionsToNextNode(directions[prev + 1]);
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, directions.length, directions]);

  return {
    currentSteps: directionsToNextNode,
    currentIndex,
    isComplete,
  };
}
