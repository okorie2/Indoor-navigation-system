import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import DestinationPathModal from "@/app/navigation/destinationPathModal";
import { Travelling, Route } from "@/app/_types";

describe("DestinationPathModal", () => {
  const baseRoute: Route = {
    start: "Entrance",
    edges: [
      {
        to: "Hallway",
        weight: 5,
        path: [],
      },
      {
        to: "Library",
        weight: 10,
        path: [],
      },
    ],
  };

  const baseProps = {
    toggleModal: jest.fn(),
    handleGoBack: jest.fn(),
    currentFloor: 1,
    currentLocation: "Entrance",
    userRoute: baseRoute,
    currentSteps: [
      { turn: "Straight", meters: 5 },
      { turn: "Left", meters: 10 },
    ] as Travelling[],
    nodeMainIndex: 0,
    nodeSubIndex: 0,
    isOnTrack: true,
    deviationDistance: 0,
    messaging: "Continue straight for 5m",
    arrivedDestination: false,
  };

  it("renders modal header with current floor and location", () => {
    render(<DestinationPathModal {...baseProps} />);

    expect(screen.getByText("Active Navigation")).toBeTruthy();
    expect(screen.getByText("Floor 1 - Senate")).toBeTruthy();
    expect(screen.getByText("Entrance")).toBeTruthy();
  });

  it("calls toggleModal when close button pressed", () => {
    render(<DestinationPathModal {...baseProps} />);
    fireEvent.press(screen.getByRole("button"));

    expect(baseProps.toggleModal).toHaveBeenCalled();
  });

  it("shows success status when on track", () => {
    render(<DestinationPathModal {...baseProps} />);
    expect(screen.getByText("You're on the right track!")).toBeTruthy();
    expect(screen.getByText(baseProps.messaging)).toBeTruthy();
  });

  it("shows warning status when off track but correctible", () => {
    render(
      <DestinationPathModal
        {...baseProps}
        isOnTrack={false}
        deviationDistance={2} // < CORRECTIBLE_DEVIATION
        messaging="Deviating slightly"
      />
    );

    expect(screen.getByText("Course correction needed")).toBeTruthy();
    expect(screen.getByText("Deviating slightly")).toBeTruthy();
  });

  it("shows error/replanning when deviation too large", () => {
    render(
      <DestinationPathModal
        {...baseProps}
        isOnTrack={false}
        deviationDistance={100} // >= CORRECTIBLE_DEVIATION
        messaging="Too far off course"
      />
    );

    expect(screen.getByText("Replanning needed")).toBeTruthy();
    expect(screen.getByText("Too far off course")).toBeTruthy();
    expect(
      screen.getByText(/Scan QR Code to Replan/i)
    ).toBeTruthy();
  });

  it("renders journey steps with destination marker", () => {
    render(<DestinationPathModal {...baseProps} />);

    expect(screen.getByText("Library")).toBeTruthy();
    expect(screen.getByText("Hallway")).toBeTruthy();
  });

  it("calls handleGoBack when 'End Navigation' pressed", () => {
    render(<DestinationPathModal {...baseProps} />);
    fireEvent.press(screen.getByText("End Navigation"));

    expect(baseProps.handleGoBack).toHaveBeenCalled();
  });
});
