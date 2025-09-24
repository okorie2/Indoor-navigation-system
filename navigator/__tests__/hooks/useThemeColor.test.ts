import { useThemeColor } from "@/hooks/useThemeColor"; // adjust path
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// // Mock the useColorScheme hook
// jest.mock("../../hooks/useColorScheme", () => ({
//   useColorScheme: jest.fn(),
// }));


describe("useThemeColor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns light color from props when theme=light", () => {
    (useColorScheme as jest.Mock).mockReturnValue("light");
    const color = useThemeColor({ light: "red" }, "text");
    expect(color).toBe("red");
  });

  it("returns dark color from props when theme=dark", () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");
    const color = useThemeColor({ dark: "blue" }, "text");
    expect(color).toBe("blue");
  });

  it("falls back to Colors.light when theme=light and no props provided", () => {
    (useColorScheme as jest.Mock).mockReturnValue("light");
    const color = useThemeColor({}, "text");
    expect(color).toBe(Colors.light.text);
  });

  it("falls back to Colors.dark when theme=dark and no props provided", () => {
    (useColorScheme as jest.Mock).mockReturnValue("dark");
    const color = useThemeColor({}, "text");
    expect(color).toBe(Colors.dark.text);
  });
});
