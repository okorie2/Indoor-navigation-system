import { renderHook } from "@testing-library/react-hooks";
import { useRouteSimulator } from "../../hooks/useRoutesimulation";
import { Position, Travelling } from "@/app/_types";

// Mock utils
jest.mock("@/utils/getDistance", () => ({
  getDistance: jest.fn(() => 10),
}));

jest.mock("@/utils/normalizeVector", () => ({
  normalize: jest.fn((x, y) => {
    const mag = Math.sqrt(x ** 2 + y ** 2) || 1;
    return { x: x / mag, y: y / mag };
  }),
}));

jest.mock("@/utils/getTurnDirection", () => ({
  getTurnDirection: jest.fn(() => "Left"),
}));

describe("useRouteSimulator", () => {
  const mockPath: Travelling[][] = [[{ meters: 5, turn: "Straight" }]];
  const mockGetTurnDirections = jest.fn(() => mockPath);

  const userPosition: Position = { x: 0, y: 0 };
  const heading: Position = { x: 1, y: 0 };
  const nodesXY: Position[][] = [
    [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    [{ x: 20, y: 0 }],
  ];

  it("initializes with expected state", () => {
    const { result } = renderHook(() =>
      useRouteSimulator(mockGetTurnDirections, userPosition, heading, nodesXY)
    );

    expect(result.current.currentSteps).toEqual(mockPath[0]);
    expect(result.current.messaging).toBe("");
    expect(result.current.isUserOnTrack).toBe(true);
    expect(result.current.arrivedDestination).toBe(false);
  });

  it("sets messaging when user is close to node", () => {
    const { result, rerender } = renderHook(
      ({ pos }) =>
        useRouteSimulator(mockGetTurnDirections, pos, heading, nodesXY),
      { initialProps: { pos: { x: 10, y: 0 } } }
    );

    rerender({ pos: { x: 10, y: 0 } });
    expect(result.current.messaging).toContain("Continue");
  });

  it("marks user as off track when deviation detected", () => {
    const { result, rerender } = renderHook(
      ({ pos }) =>
        useRouteSimulator(mockGetTurnDirections, pos, heading, nodesXY),
      { initialProps: { pos: { x: 50, y: 50 } } }
    );

    rerender({ pos: { x: 50, y: 50 } });

    expect(result.current.isUserOnTrack).toBe(false);
    expect(result.current.messaging).toMatch(/off course|deviating/);
  });

  it("sets arrivedDestination true when last node is reached", () => {
    const { result, rerender } = renderHook(
      ({ pos }) =>
        useRouteSimulator(mockGetTurnDirections, pos, heading, [[{ x: 0, y: 0 }]]),
      { initialProps: { pos: { x: 0, y: 0 } } }
    );

    rerender({ pos: { x: 0, y: 0 } });

    expect(result.current.arrivedDestination).toBe(true);
    expect(result.current.messaging).toBe("You have arrived at your destination.");
  });
});
