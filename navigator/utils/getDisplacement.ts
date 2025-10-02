import { Position } from "@/app/_types";

export const getDisplacement = (pointA: Position, pointB: Position) => {
  const deltaX = pointB.x - pointA.x;
  const deltaY = pointB.y - pointA.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
};
