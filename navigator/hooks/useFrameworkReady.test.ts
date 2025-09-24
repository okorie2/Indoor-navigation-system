import { renderHook } from "@testing-library/react";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";

describe("useFrameworkReady", () => {
  beforeEach(() => {
    // reset global between tests
    delete (window as any).frameworkReady;
  });

  it("does nothing if window.frameworkReady is not defined", () => {
    const spy = jest.spyOn(window, "frameworkReady" as any);

    renderHook(() => useFrameworkReady());

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("calls window.frameworkReady if defined", () => {
    const mockFn = jest.fn();
    window.frameworkReady = mockFn;

    renderHook(() => useFrameworkReady());

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
