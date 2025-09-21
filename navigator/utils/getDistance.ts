import { Position } from "@/app/_types";

export const getDistance = (p1: Position, p2: Position): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};
