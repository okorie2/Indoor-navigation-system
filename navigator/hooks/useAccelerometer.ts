import { useState, useEffect } from "react";
import { Accelerometer } from "expo-sensors";
export type AccelerometerData = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
};
export const useAccelerometer = (
  accelerometer_thing: (data: AccelerometerData) => void
) => {
  const [{ x, y, z, timestamp }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });

  const _subscribe = () => {
    return Accelerometer.addListener(accelerometer_thing);
  };

  useEffect(() => {
    const subscription = _subscribe();
    Accelerometer.setUpdateInterval(500);
    return () => subscription.remove();
  }, []);

  return { x, y, z, timestamp };
};
