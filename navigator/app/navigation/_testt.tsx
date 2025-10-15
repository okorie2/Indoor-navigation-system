import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { useAccelerometer } from "@/hooks/useAccelerometer";

export default function Test() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [lastTimestamp, setlastTimestamp] = useState(Date.now());

  useAccelerometer((accelData) => {
    const now = Date.now();
    const dt = (now - lastTimestamp) / 1000; // seconds
    setlastTimestamp(now);

    const ax = accelData.x * 9.81; // m/s² (Expo gives Gs)
    const ay = accelData.y * 9.81;
    const az = accelData.z * 9.81;

    // Simple integration (gravity not removed!)
    setVelocity((v) => ({
      x: v.x + ax * dt,
      y: v.y + ay * dt,
      z: v.z + az * dt,
    }));

    setPosition((p) => ({
      x: p.x + velocity.x * dt,
      y: p.y + velocity.y * dt,
      z: p.z + velocity.z * dt,
    }));

    setData(accelData);
  });

  console.log(
    "Position: x:",
    position.x.toFixed(2),
    "y:",
    position.y.toFixed(2),
    "z:",
    position.z.toFixed(2)
  );

  return (
    <View style={{ padding: 20 }}>
      <Text>
        Accel: x:{data.x.toFixed(2)} y:{data.y.toFixed(2)} z:{data.z.toFixed(2)}
      </Text>
      <Text>
        Velocity: x:{velocity.x.toFixed(2)} y:{velocity.y.toFixed(2)} z:
        {velocity.z.toFixed(2)}
      </Text>
      <Text>
        Position: x:{position.x.toFixed(2)} y:{position.y.toFixed(2)} z:
        {position.z.toFixed(2)}
      </Text>
    </View>
  );
}
