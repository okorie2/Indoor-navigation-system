export const normalize = (x: number, y: number) => {
  const length = Math.sqrt(x * x + y * y);
  return { x: x / length, y: y / length };
};
