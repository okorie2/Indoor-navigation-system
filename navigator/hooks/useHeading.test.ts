import { renderHook, act } from "@testing-library/react";
import useHeading from "@/hooks/useHeading";
import * as Location from "expo-location";

describe("useHeading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null initially", () => {
    const { result } = renderHook(() => useHeading());
    expect(result.current.trueHeading).toBeNull();
  });

  it("does not subscribe if permission is denied", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "denied",
    });

    renderHook(() => useHeading());
    expect(Location.watchHeadingAsync).not.toHaveBeenCalled();
  });

  it("subscribes and updates heading when permission granted", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    });

    let callback: any;
    (Location.watchHeadingAsync as jest.Mock).mockImplementationOnce((cb) => {
      callback = cb;
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useHeading());

    // Simulate a heading update
    await act(async () => {
      callback({ trueHeading: 123, magHeading: 120, accuracy: 5 });
    });

    expect(result.current.trueHeading).toBe(123);
  });

  it("cleans up subscription on unmount", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    });

    const removeMock = jest.fn();
    (Location.watchHeadingAsync as jest.Mock).mockResolvedValueOnce(() => ({
      remove: removeMock,
    }));

    const { unmount } = renderHook(() => useHeading());
    unmount();

    expect(removeMock).toHaveBeenCalled();
  });
});
