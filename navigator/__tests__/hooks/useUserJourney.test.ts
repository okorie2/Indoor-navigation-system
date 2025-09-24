import { renderHook, act } from "@testing-library/react-hooks";
import { useUserJourney } from "@/hooks/useUserJourney"; 
jest.useFakeTimers();

describe("useUserJourney", () => {
  // fake route function
  const getRouteNodesXYPosition = () => [
    [{ x: 0, y: 0, node: "A" }],
    [{ x: 10, y: 0, node: "B" }],
    [{ x: 20, y: 0, node: "C" }],
  ];

  it("starts with null position and heading", () => {
    const { result } = renderHook(() =>
      useUserJourney(getRouteNodesXYPosition)
    );
    expect(result.current.userPosition).toBeNull();
    expect(result.current.heading).toBeNull();
  });

  it("updates userPosition over time", () => {
    const { result } = renderHook(() =>
      useUserJourney(getRouteNodesXYPosition)
    );

    // initially still null (first tick not run yet)
    expect(result.current.userPosition).toBeNull();

    // advance 1 step (2s)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.userPosition).not.toBeNull();
    expect(result.current.userPosition?.node).toBe("A"); // still on segment from A

    // advance multiple steps until we pass the first segment
    act(() => {
      jest.advanceTimersByTime(2000 * 50); // enough to reach next node
    });
    expect(result.current.userPosition?.node).toBe("B");

    // advance further until reaching C
    act(() => {
      jest.advanceTimersByTime(2000 * 50);
    });
    expect(result.current.userPosition?.node).toBe("C");
  });

  it("computes heading vector correctly", () => {
    const { result } = renderHook(() =>
      useUserJourney(getRouteNodesXYPosition)
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.heading).toEqual({ x: 1, y: 0 }); // direction rightwards
  });
});
