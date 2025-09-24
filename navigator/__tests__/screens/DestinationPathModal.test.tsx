import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import DestinationPathModal from "@/app/navigation/destinationPathModal";
import { Travelling, Route } from "@/app/_types";

// Mock the constants
jest.mock("@/constants/navigation", () => ({
  CORRECTIBLE_DEVIATION: 10,
}));

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => ({
  X: "X",
  CheckCircle: "CheckCircle",
  AlertTriangle: "AlertTriangle",
  Navigation: "Navigation",
  MapPin: "MapPin",
  RotateCcw: "RotateCcw",
  QrCode: "QrCode",
  ArrowUp: "ArrowUp",
  TurnLeft: "TurnLeft",
  TurnRight: "TurnRight",
}));

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
    nodeMainIndex: 1, // Changed from 0 to 1 to properly show journey progress
    nodeSubIndex: 0,
    isOnTrack: true,
    deviationDistance: 0,
    messaging: "Continue straight for 5m",
    arrivedDestination: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal header with current floor and navigation title", () => {
    render(<DestinationPathModal {...baseProps} />);

    expect(screen.getByText("Active Navigation")).toBeTruthy();
    expect(screen.getByText("Floor 1 - Senate")).toBeTruthy();
  });

  it("renders current location in location card", () => {
    render(<DestinationPathModal {...baseProps} />);
    
    expect(screen.getByText("Start Location")).toBeTruthy();
    expect(screen.getByText("Entrance")).toBeTruthy();
  });

  it("calls toggleModal when close button is pressed", () => {
    render(<DestinationPathModal {...baseProps} />);
    
    // Find the close button by its testID or accessible role
    const closeButton = screen.getByRole("button");
    fireEvent.press(closeButton);

    expect(baseProps.toggleModal).toHaveBeenCalledTimes(1);
  });

  it("shows success status when on track", () => {
    render(<DestinationPathModal {...baseProps} />);
    
    expect(screen.getByText("You're on the right track!")).toBeTruthy();
    expect(screen.getByText(baseProps.messaging)).toBeTruthy();
  });

  it("shows warning status when off track but deviation is correctible", () => {
    const offTrackProps = {
      ...baseProps,
      isOnTrack: false,
      deviationDistance: 5, // Less than CORRECTIBLE_DEVIATION (10)
      messaging: "Deviating slightly from route",
    };

    render(<DestinationPathModal {...offTrackProps} />);

    expect(screen.getByText("Course correction needed")).toBeTruthy();
    expect(screen.getByText("Deviating slightly from route")).toBeTruthy();
    expect(screen.getByText("Course Correction Steps")).toBeTruthy();
  });

  it("shows replanning status when deviation is too large", () => {
    const replanningProps = {
      ...baseProps,
      isOnTrack: false,
      deviationDistance: 15, // Greater than CORRECTIBLE_DEVIATION (10)
      messaging: "Too far off course",
    };

    render(<DestinationPathModal {...replanningProps} />);

    expect(screen.getByText("Replanning needed")).toBeTruthy();
    expect(screen.getByText("Too far off course")).toBeTruthy();
    expect(screen.getByText("Scan QR Code to Replan")).toBeTruthy();
    expect(screen.getByText("Open QR Scanner")).toBeTruthy();
  });

  it("renders journey steps correctly", () => {
    render(<DestinationPathModal {...baseProps} />);

    // Check for journey destinations
    expect(screen.getByText("Hallway")).toBeTruthy();
    expect(screen.getByText("Library")).toBeTruthy();
    
    // Check for journey section
    expect(screen.getByText("Your Journey")).toBeTruthy();
    expect(screen.getByText("Starting Point")).toBeTruthy();
  });

  it("renders turn steps with progress", () => {
    render(<DestinationPathModal {...baseProps} />);

    expect(screen.getByText("Turn Steps")).toBeTruthy();
    expect(screen.getByText("0/2 steps")).toBeTruthy();
    expect(screen.getByText("Straight")).toBeTruthy();
    expect(screen.getByText("Left")).toBeTruthy();
  });

  it("shows arrival status when destination is reached", () => {
    const arrivedProps = {
      ...baseProps,
      arrivedDestination: true,
      nodeMainIndex: 2, // At the end of the journey
    };

    render(<DestinationPathModal {...arrivedProps} />);

    expect(screen.getByText("Final Destination")).toBeTruthy();
    expect(screen.getByText("Arrived")).toBeTruthy();
  });

  it("renders legend with all status types", () => {
    render(<DestinationPathModal {...baseProps} />);

    expect(screen.getByText("Legend")).toBeTruthy();
    expect(screen.getByText("Completed")).toBeTruthy();
    expect(screen.getByText("Current")).toBeTruthy();
    expect(screen.getByText("Upcoming")).toBeTruthy();
    expect(screen.getByText("Destination")).toBeTruthy();
  });

  it("calls handleGoBack when 'End Navigation' button is pressed", () => {
    render(<DestinationPathModal {...baseProps} />);
    
    const endButton = screen.getByText("End Navigation");
    fireEvent.press(endButton);

    expect(baseProps.handleGoBack).toHaveBeenCalledTimes(1);
  });

  it("shows course correction steps when off track but correctible", () => {
    const offTrackProps = {
      ...baseProps,
      isOnTrack: false,
      deviationDistance: 5,
    };

    render(<DestinationPathModal {...offTrackProps} />);

    expect(screen.getByText("Course Correction Steps")).toBeTruthy();
    expect(screen.getByText("Follow these steps to get back on your original route:")).toBeTruthy();
  });

  it("displays correct step progress based on nodeSubIndex", () => {
    const progressProps = {
      ...baseProps,
      nodeSubIndex: 1, // On second step
    };

    render(<DestinationPathModal {...progressProps} />);

    expect(screen.getByText("1/2 steps")).toBeTruthy();
  });
});