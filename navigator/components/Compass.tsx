import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
//@ts-ignore
import * as Heading from "react-native-heading";

export default function Compass() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    console.log("Starting heading...", Heading);
    Heading.start(1) // 1 = update rate in degrees
      .then((didStart) => {
        console.log("Heading updates started:", didStart);
      });

    const listener = Heading.on((degree) => {
      setHeading(degree); // 0 = North, 90 = East, etc.
    });

    return () => {
      Heading.stop();
      listener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 32 }}>{Math.round(heading)}°</Text>
    </View>
  );
}
