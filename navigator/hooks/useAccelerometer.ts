import { useState, useEffect } from "react";
import { DeviceMotion } from "expo-sensors";
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
    return DeviceMotion.addListener((measurement) =>
      accelerometer_thing({
        x: measurement.acceleration?.x ?? 0,
        y: measurement.acceleration?.y ?? 0,
        z: measurement.acceleration?.z ?? 0,
        timestamp: measurement.acceleration?.timestamp ?? 0,
      })
    );
  };

  useEffect(() => {
    const subscription = _subscribe();
    DeviceMotion.setUpdateInterval(500);
    return () => subscription.remove();
  }, []);

  return { x, y, z, timestamp };
};
