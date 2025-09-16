export const getCurrentFloor = (location: string): number => {
  // Convert to lowercase for case-insensitive matching
  const lowerLocation = location.toLowerCase();

  // Special cases that should return 0
  const specialCases = [
    "faculty_of_education_humanity",
    "breakout space",
    "office of the vc",
  ];

  // Check if location contains any of the special cases
  const isSpecialCase = specialCases.some((specialCase) =>
    lowerLocation.includes(specialCase.toLowerCase())
  );

  if (isSpecialCase) {
    return 0;
  }

  // Check if location starts with "SN" (case-insensitive)
  if (lowerLocation.startsWith("sn")) {
    // Extract only the first digit that follows "SN"
    const match = location.match(/^sn(\d)/i);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // If it doesn't start with SN, look for any number in the text
  const numberMatch = location.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0], 10);
  }

  // If no number found and doesn't start with SN, return 0
  return 0;
};
