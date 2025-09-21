export const getTurnDirection = (
  prev: { x: number; y: number }, // value should be a normalized vector
  curr: { x: number; y: number } // value should be a normalized vector
) => {
  const dot = prev.x * curr.x + prev.y * curr.y;
  const cross = prev.x * curr.y - prev.y * curr.x;

  if (dot > 0.99) return "Straight"; // nearly same direction
  if (dot < -0.99) return "U-turn";
  if (cross > 0) return "Left";
  if (cross < 0) return "Right";
  return "Unknown";
};
