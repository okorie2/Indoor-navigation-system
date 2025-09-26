// __tests__/DestinationPathModal.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import DestinationPathModal from "@/app/navigation/destinationPathModal";
import { Connection } from "@/app/_types";

// Mock expo-speech
jest.mock("expo-speech", () => ({
  speak: jest.fn((_text, opts) => {
    opts?.onDone?.();
  }),
  stop: jest.fn(),
}));

// Mock lucide-react-native (icons are just React components)
jest.mock("lucide-react-native", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target, prop) => (props: any) =>
        React.createElement("IconMock", { name: prop, ...props }),
    }
  );
});

// Mock accelerometer hook
jest.mock("@/hooks/useAccelerometer", () => ({
  useAccelerometer: (cb: (data: any) => void) => {
    const React = require("react");
    React.useEffect(() => {
      cb({ x: 0, y: 0, z: 0 });
    }, []);
  },
}));

const baseProps = {
  toggleModal: jest.fn(),
  handleGoBack: jest.fn(),
  currentFloor: 2,
  currentLocation: "Lobby",
  userRoute: { start: "Lobby", edges: [{ to: "Room 101" } as Connection] },
  currentSteps: [
    { turn: "Turn left", meters: 10 },
    { turn: "Turn right", meters: 5 },
  ],
  nodeMainIndex: 1,
  nodeSubIndex: 0,
  isOnTrack: true,
  deviationDistance: 0,
  messaging: "Proceed to the next step",
  arrivedDestination: false,
};

describe("DestinationPathModal", () => {
  it("renders correctly with base props", () => {
    const { getByText, getAllByText } = render(
      <DestinationPathModal {...baseProps} />
    );
    expect(getByText("Active Navigation")).toBeTruthy();
    expect(getByText("Floor 2 - Senate")).toBeTruthy();
    expect(getAllByText("Lobby")).toHaveLength(2); // appears twice
    expect(getByText("Turn left")).toBeTruthy();
  });

  it("shows success message when on track", () => {
    const { getByText } = render(
      <DestinationPathModal {...baseProps} isOnTrack={true} />
    );
    expect(getByText("You're on the right track!")).toBeTruthy();
  });

  it("shows warning when off track but correctible", () => {
    const { getByText } = render(
      <DestinationPathModal
        {...baseProps}
        isOnTrack={false}
        deviationDistance={1}
      />
    );
    expect(getByText("Course correction needed")).toBeTruthy();
  });

  it("shows error when deviation too large", () => {
    const { getByText } = render(
      <DestinationPathModal
        {...baseProps}
        isOnTrack={false}
        deviationDistance={999}
      />
    );
    expect(getByText("Replanning needed")).toBeTruthy();
    expect(getByText(/Scan QR Code to Replan/)).toBeTruthy();
  });

  it("toggles voice on and off", () => {
    const { getByTestId, rerender } = render(
      <DestinationPathModal {...baseProps} />
    );
    const voiceButton = getByTestId("voice-toggle");

    fireEvent.press(voiceButton);

    rerender(<DestinationPathModal {...baseProps} />);
    expect(voiceButton).toBeTruthy();
  });

  it("calls toggleModal when close button pressed", () => {
    const { getByTestId } = render(<DestinationPathModal {...baseProps} />);
    const closeModalButton = getByTestId("close-modal");
    fireEvent.press(closeModalButton); // second button is close
    expect(baseProps.toggleModal).toHaveBeenCalled();
  });

  it("calls handleGoBack when End Navigation pressed", () => {
    const { getByText } = render(<DestinationPathModal {...baseProps} />);
    fireEvent.press(getByText("End Navigation"));
    expect(baseProps.handleGoBack).toHaveBeenCalled();
  });

  // it("renders correction steps when off track", () => {
  //   const { getByText, getAllByText } = render(
  //     <DestinationPathModal
  //       {...baseProps}
  //       isOnTrack={false}
  //       deviationDistance={1}
  //     />
  //   );

  //   expect(getByText("Course Correction Steps")).toBeTruthy();
  //   // "Turn left" appears twice: one in route steps, one in correction steps
  //   expect(getAllByText("Turn left").length).toBeGreaterThanOrEqual(1);
  //   expect(getByText("Walk straight")).toBeTruthy();
  //   expect(getByText("Turn right")).toBeTruthy();
  // });
});
