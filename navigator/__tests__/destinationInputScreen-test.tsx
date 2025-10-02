// __tests__/DestinationInputScreen.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";
import DestinationInputScreen from "@/app/destination-input";

// Mock router
jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: () => ({ currentLocation: "Lobby" }),
}));

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Alert
jest.spyOn(Alert, "alert");

describe("DestinationInputScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with current location", () => {
    const { getByText } = render(<DestinationInputScreen />);
    expect(getByText("Current Location")).toBeTruthy();
    expect(getByText("Lobby")).toBeTruthy();
    expect(
      getByText(
        "Start typing to see suggestions or enter the room number/location name"
      )
    ).toBeTruthy();
  });

  it("calls router.back when back button pressed", () => {
    const { getByTestId, getByRole } = render(<DestinationInputScreen />);
    const backBtn = getByRole("button");
    fireEvent.press(backBtn);
    expect(router.back).toHaveBeenCalled();
  });

  it("shows dropdown after typing and selecting a location", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { nodes: ["SN401", "Library"] },
    });

    const { getByPlaceholderText, getByText } = render(
      <DestinationInputScreen />
    );
    const input = getByPlaceholderText("e.g., SN401");

    fireEvent.changeText(input, "SN");
    // Wait for axios and dropdown to appear
    await waitFor(() => {
      expect(getByText("SN401")).toBeTruthy();
    });

    fireEvent.press(getByText("SN401"));
    expect(getByText("SN401")).toBeTruthy();
  });

  it("selects a popular destination", () => {
    const { getByText } = render(<DestinationInputScreen />);
    const libraryBtn = getByText("Library");
    fireEvent.press(libraryBtn);
    expect(getByText("Library")).toBeTruthy();
  });

  it("shows alert if trying to start navigation with no destination", () => {
    const { getByText } = render(<DestinationInputScreen />);
    const startBtn = getByText("Start Navigation");

    fireEvent.press(startBtn);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Destination Required",
      "Please enter your destination."
    );
  });

  it("navigates when destination is set", () => {
    const { getByText } = render(<DestinationInputScreen />);
    const cafeteriaBtn = getByText("Cafeteria");

    fireEvent.press(cafeteriaBtn);
    const startBtn = getByText("Start Navigation");
    fireEvent.press(startBtn);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/navigation",
      params: {
        currentLocation: "Lobby",
        destination: "Cafeteria",
      },
    });
  });
});
