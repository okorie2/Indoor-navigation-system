import * as Location from "expo-location";
import React from "react";
import { useEffect } from "react";

export default function useHeading() {
  const [trueHeading, setTrueHeading] = React.useState<number | null>(null);
  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }

      subscription = await Location.watchHeadingAsync((heading) => {
        setTrueHeading(heading.trueHeading);
        console.log("Magnetic heading:", heading.magHeading);
        console.log("True heading:", heading.trueHeading);
      });
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);
  return { trueHeading };
}
