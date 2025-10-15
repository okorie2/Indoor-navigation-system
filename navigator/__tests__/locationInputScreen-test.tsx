import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import axios from "axios";
import LocationInputScreen from "@/app/location-input";

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock("expo-camera", () => ({
  CameraView: ({ children }: any) => <>{children}</>,
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
}));

jest.mock("axios");

describe("LocationInputScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders input and allows typing", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { nodes: ["SN201"] },
    });

    const { getByPlaceholderText, getAllByText } = render(
      <LocationInputScreen />
    );

    const input = getByPlaceholderText("e.g., SN201");
    fireEvent.changeText(input, "SN201");

    await waitFor(() => {
      expect(getAllByText("SN201")[0]).toBeTruthy();
    });
  });

  it("navigates when continue is pressed", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { nodes: ["SN201"] },
    });
    const { getByPlaceholderText, getByText, getByTestId, getAllByText } =
      render(<LocationInputScreen />);

    const input = getByPlaceholderText("e.g., SN201");
    fireEvent.changeText(input, "SN201");

    await waitFor(() => {
      expect(getAllByText("SN201")[0]).toBeTruthy();
    });

    const locationOption = getByTestId("SN201");
    fireEvent.press(locationOption);

    const continueBtn = getByText("Continue");
    fireEvent.press(continueBtn);

    expect(router.push).toHaveBeenCalledWith({
      pathname: "/destination-input",
      params: { currentLocation: "SN201" },
    });
  });
});
