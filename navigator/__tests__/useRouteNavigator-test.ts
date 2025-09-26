// __tests__/useRouteNavigator.test.tsx
import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { useRouteNavigator } from "@/hooks/useRouteNavigator";

// --- mock utils ---
jest.mock("@/utils/getDistance", () => ({
  getDistance: jest.fn(() => 0), // default: 0 meters
}));
jest.mock("@/utils/normalizeVector", () => ({
  normalize: jest.fn(() => ({ x: 1, y: 0 })),
}));
jest.mock("@/utils/getTurnDirection", () => ({
  getTurnDirection: jest.fn(() => "Left"),
}));
jest.mock("lodash", () => ({
  isEmpty: (obj: any) =>
    obj == null || (typeof obj === "object" && Object.keys(obj).length === 0),
}));

// constants
jest.mock("@/constants/navigation", () => ({
  PX_SCALE: 1,
  CM_SCALE: 1,
  CORRECTIBLE_DEVIATION: 5,
  DISTANCE_TOLERANCE: 1,
  ANGLE_TOLERANCE: 10,
  TURN_ANTICIPATION_DISTANCE: 2,
}));

const mockGetDistance = require("@/utils/getDistance").getDistance as jest.Mock;

describe("useRouteNavigator", () => {
  const baseNodes = [
    [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ], // main path
    [{ x: 20, y: 0 }], // second path
  ];

  const getTurnDirectionsThroughDestinationPath = jest.fn(() => [
    [{ turn: "Left", meters: 10 }],
    [{ turn: "Right", meters: 5 }],
  ]);

  const heading = { x: 1, y: 0 };

  it("marks arrival when user reaches last node", () => {
    mockGetDistance.mockReturnValueOnce(0); // at first node
    const { result, rerender } = renderHook(
      ({ userPosition }) =>
        useRouteNavigator(
          getTurnDirectionsThroughDestinationPath,
          userPosition,
          heading,
          baseNodes
        ),
      { initialProps: { userPosition: { x: 0, y: 0 } } }
    );

    expect(result.current.arrivedDestination).toBe(false);

    // simulate arrival at last node
    mockGetDistance.mockReturnValue(0);
    rerender({ userPosition: { x: 20, y: 0 } });

    expect(result.current.arrivedDestination).toBe(true);
    expect(result.current.messaging).toMatch(/arrived/i);
  });

  it("updates messaging when user deviates", () => {
    mockGetDistance.mockReturnValue(10); // > DISTANCE_TOLERANCE
    const { result } = renderHook(() =>
      useRouteNavigator(
        getTurnDirectionsThroughDestinationPath,
        { x: 5, y: 5 }, // not on path
        heading,
        baseNodes
      )
    );

    expect(result.current.isUserOnTrack).toBe(false);
    expect(result.current.deviationDistance).toBeGreaterThan(0);
    expect(result.current.messaging).toMatch(/deviating|turn/i);
  });

  it("advances sub node when within tolerance", () => {
    mockGetDistance.mockReturnValue(0.5); // within tolerance
    const { result } = renderHook(() =>
      useRouteNavigator(
        getTurnDirectionsThroughDestinationPath,
        { x: 10, y: 0 }, // reached second sub node
        heading,
        baseNodes
      )
    );

    expect(result.current.nodeSubIndex).toBeGreaterThan(0);
    expect(result.current.messaging).toBeTruthy();
  });

  it("provides currentSteps based on turnMainIndex", () => {
    const { result } = renderHook(() =>
      useRouteNavigator(
        getTurnDirectionsThroughDestinationPath,
        { x: 0, y: 0 },
        heading,
        baseNodes
      )
    );
    expect(result.current.currentSteps).toEqual([{ turn: "Left", meters: 10 }]);
  });
});
