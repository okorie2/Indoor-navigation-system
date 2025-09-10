// InfiniteGrid.tsx
import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Defs,
  Pattern,
  Path,
  Rect,
  G,
  Circle,
  Text as SvgText,
} from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Position } from "@/app/_types";

type Props = {
  widthPx: number; // e.g. screenWidth - 48
  heightPx: number; // e.g. 400
  gridSize?: number; // world units per cell (default 25)
  nodePositions: Position[];
  userPosition: { x: number; y: number };
};

export default function InfiniteGrid({
  widthPx,
  heightPx,
  gridSize = 25,
  nodePositions,
  userPosition,
}: Props) {
  const PAD_CELLS = 4; // 4 grid cells of padding
  const pad = PAD_CELLS * gridSize;

  const initialBounds = useMemo(() => {
    if (!nodePositions.length) {
      return { minX: -250, maxX: 250, minY: -250, maxY: 250 };
    }
    const xs = nodePositions.map((n) => n.x);
    const ys = nodePositions.map((n) => n.y);
    return {
      minX: Math.min(...xs) - pad,
      maxX: Math.max(...xs) + pad,
      minY: Math.min(...ys) - pad,
      maxY: Math.max(...ys) + pad,
    };
  }, [nodePositions, pad]);

  const baseWidth = initialBounds.maxX - initialBounds.minX || 500;
  const baseHeight = initialBounds.maxY - initialBounds.minY || 500;

  const [scale, setScale] = useState(1);
  const [camX, setCamX] = useState(initialBounds.minX);
  const [camY, setCamY] = useState(initialBounds.minY);

  const vw = baseWidth / scale;
  const vh = baseHeight / scale;

  // Convert pan deltas (px) to world units.
  const pxToWorldX = (dxPx: number) => (dxPx * vw) / widthPx;
  const pxToWorldY = (dyPx: number) => (dyPx * vh) / heightPx;

  // 4) Keep a giant rect always covering more than the viewBox.
  const BIG = gridSize * 2000; // effectively "infinite" coverage

  // 5) Gestures: Pan + Pinch (zoom around center for simplicity)
  const panStart = useRef({ x: 0, y: 0 });
  const pinchStart = useRef({ scale: 1, centerX: 0, centerY: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      panStart.current = { x: camX, y: camY };
    })
    .onChange((e) => {
      // Dragging finger right should move world left, so camera x decreases by dx in world units
      const nextX = panStart.current.x - pxToWorldX(e.translationX);
      const nextY = panStart.current.y - pxToWorldY(e.translationY);
      setCamX(nextX);
      setCamY(nextY);
    })
    .runOnJS(true);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const pinch = Gesture.Pinch()
    .onStart(() => {
      // cache start values
      pinchStart.current.scale = scale;
      // keep the world center fixed during zoom (center-anchored)
      pinchStart.current.centerX = camX + vw / 2;
      pinchStart.current.centerY = camY + vh / 2;
    })
    .onChange((e) => {
      // new scale
      const newScale = clamp(pinchStart.current.scale * e.scale, 0.2, 20);
      const newVw = baseWidth / newScale;
      const newVh = baseHeight / newScale;

      // keep same world center
      const newCamX = pinchStart.current.centerX - newVw / 2;
      const newCamY = pinchStart.current.centerY - newVh / 2;

      setScale(newScale);
      setCamX(newCamX);
      setCamY(newCamY);
    })
    .runOnJS(true);

  const composed = Gesture.Simultaneous(pan, pinch);

  // 6) Grid pattern: keep lines roughly same thickness across zoom
  //    (scale the stroke width by 1/scale so it stays crisp)
  const gridStroke = 1 / scale;
  // console.log(camX, camY, vw, vh, BIG);

  const Nodes = (
    <>
      {nodePositions.map((n, i) => (
        <G key={`main-${n.node}-${i}`}>
          <Circle cx={n.x} cy={n.y} r={20} fill="tomato" />
          <SvgText
            x={n.x + 8}
            y={n.y}
            fontSize={12}
            fill="#fff"
            alignmentBaseline="middle"
          >
            {n.node}
          </SvgText>
        </G>
      ))}
    </>
  );

  return (
    <GestureDetector gesture={composed}>
      <View
        style={{
          ...navigationStyles.floorPlanContainer,
          width: widthPx,
          height: heightPx,
          overflow: "hidden",
        }}
      >
        <Svg
          width={widthPx}
          height={heightPx}
          viewBox={`${camX} ${camY} ${vw} ${vh}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            <Pattern
              id="grid"
              patternUnits="userSpaceOnUse"
              width={gridSize}
              height={gridSize}
            >
              <Path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke="#374151"
                strokeWidth={gridStroke}
                opacity={0.35}
              />
            </Pattern>
          </Defs>

          <Circle cx={userPosition.x} cy={userPosition.y} r={30} fill="blue" />

          {/* "Infinite" grid: always cover well beyond the current view */}
          <Rect
            x={camX - BIG}
            y={camY - BIG}
            width={vw + BIG * 2}
            height={vh + BIG * 2}
            fill="url(#grid)"
          />

          {Nodes}
        </Svg>
      </View>
    </GestureDetector>
  );
}
const navigationStyles = StyleSheet.create({
  floorPlanContainer: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
