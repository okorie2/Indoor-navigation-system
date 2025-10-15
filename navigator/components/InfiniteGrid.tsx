import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Defs, Pattern, Path, Rect } from "react-native-svg";
import { GestureDetector } from "react-native-gesture-handler";
import { Position, Route } from "@/app/_types";
import { MapPin, PersonStandingIcon, ToiletIcon } from "lucide-react-native";
import StairsIcon from "@/assets/jsx/stairs";
import OfficeDeskIcon from "@/assets/jsx/office-desk";
import LiftIcon from "@/assets/jsx/lift";
import useFloorCoords from "@/hooks/useFloorCoords";

type Props = {
  widthPx: number; // e.g. screenWidth - 48
  heightPx: number; // e.g. 400
  gridSize?: number; // world units per cell (default 25)
  nodePositions: Position[];
  userPosition: { x: number; y: number; node?: string };
  route: Route | null;
};

interface VisibleNode extends Position {
  screenX: number;
  screenY: number;
  priority: number;
  iconSize: number;
  fontSize: number;
  showLabel: boolean;
}

export default function InfiniteGrid({
  widthPx,
  heightPx,
  gridSize = 25,
  nodePositions,
  userPosition,
  route,
}: Props) {
  const {
    floorBorders,
    floorOffsets,
    visibleFloorLabels,
    visibleNodes,
    camX,
    camY,
    vw,
    vh,
    routeCoords,
    worldToScreen,
    scale,
    BIG,
    gridStroke,
    composed,
    getFloor,
  } = useFloorCoords({
    widthPx,
    heightPx,
    nodePositions,
    route,
  });

  const userFloor = useMemo(() => getFloor(userPosition.node), [userPosition]);

  const renderNodeIcon = (node: VisibleNode) => {
    const iconProps = {
      size: node.iconSize,
    };

    if (node.node?.includes("toilet")) {
      return <ToiletIcon {...iconProps} color="#059669" />;
    } else if (node.node?.includes("staircase")) {
      return (
        <StairsIcon
          width={node.iconSize}
          height={node.iconSize}
          color="#7C3AED"
        />
      );
    } else if (node.node?.startsWith("SN")) {
      return (
        <OfficeDeskIcon
          width={node.iconSize}
          height={node.iconSize}
          color="#EA580C"
        />
      );
    } else if (node.node?.startsWith("lift")) {
      return (
        <LiftIcon
          width={node.iconSize}
          height={node.iconSize}
          color="#EA580C"
        />
      );
    } else {
      return <MapPin {...iconProps} color="#DC2626" />;
    }
  };

  const adjustedUserPosition = useMemo(() => {
    const offset = floorOffsets.get(userFloor) || 0;
    return { x: userPosition.x, y: userPosition.y + offset };
  }, [userPosition, userFloor, floorOffsets]);

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
                stroke="#D1D5DB"
                strokeWidth={gridStroke}
                opacity={0.35}
              />
            </Pattern>
          </Defs>

          <Rect
            x={camX - BIG}
            y={camY - BIG}
            width={vw + BIG * 2}
            height={vh + BIG * 2}
            fill="url(#grid)"
          />

          {floorBorders.map((border, i) => (
            <Rect
              key={`border-${i}`}
              x={border.x}
              y={border.y}
              width={border.width}
              height={border.height}
              fill="none"
              stroke="#374151"
              strokeWidth={Math.max(2 / scale, 0.5)}
              strokeOpacity={0.5}
            />
          ))}
        </Svg>

        {[{ x: userPosition.x, y: userPosition.y }].map((n, i) => {
          const { screenX, screenY } = worldToScreen(n.x, n.y);
          const userIconSize = Math.max(
            24,
            Math.min(48, 32 * Math.sqrt(scale))
          );

          return (
            <View
              key={`user-${i}`}
              style={{
                position: "absolute",
                left: screenX - userIconSize / 2,
                top: screenY - userIconSize / 2,
                zIndex: 1000,
              }}
            >
              <View
                style={[
                  navigationStyles.userIconContainer,
                  {
                    width: userIconSize + 8,
                    height: userIconSize + 8,
                  },
                ]}
              >
                <PersonStandingIcon size={userIconSize} color="#1D4ED8" />
              </View>
            </View>
          );
        })}

        {routeCoords.map((p, i) => {
          if (i === routeCoords.length - 1) return null;
          const { screenX: x1, screenY: y1 } = worldToScreen(p.x, p.y);
          const { screenX: x2, screenY: y2 } = worldToScreen(
            routeCoords[i + 1].x,
            routeCoords[i + 1].y
          );
          const dx = x2 - x1;
          const dy = y2 - y1;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          return (
            <View
              key={`line-${i}`}
              style={[
                navigationStyles.routeLine,
                {
                  width: length,
                  height: Math.max(3, 4 * Math.sqrt(scale)),
                  top: y1,
                  left: x1,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {visibleNodes.map((n, i) => (
          <View
            key={`node-${i}`}
            style={{
              position: "absolute",
              left: n.screenX - n.iconSize / 2,
              top: n.screenY - n.iconSize / 2,
              alignItems: "center",
              zIndex: 100 + n.priority,
            }}
          >
            <View style={navigationStyles.iconContainer}>
              {renderNodeIcon(n)}
            </View>

            {n.showLabel && n.node && (
              <View style={navigationStyles.labelContainer}>
                <Text
                  style={[navigationStyles.labelText, { fontSize: n.fontSize }]}
                  numberOfLines={1}
                >
                  {n.node}
                </Text>
              </View>
            )}
          </View>
        ))}

        {visibleFloorLabels.map((label, i) => (
          <View
            key={`floor-label-${i}`}
            style={{
              position: "absolute",
              left: label.screenX,
              top: label.screenY - label.fontSize / 2,
              zIndex: 1000,
            }}
          >
            <Text
              style={{
                fontSize: label.fontSize,
                fontWeight: "bold",
                color: "#111",
              }}
            >
              Floor {label.floor}
            </Text>
          </View>
        ))}
      </View>
    </GestureDetector>
  );
}

const navigationStyles = StyleSheet.create({
  floorPlanContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userIconContainer: {
    backgroundColor: "#DBEAFE",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1D4ED8",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  routeLine: {
    position: "absolute",
    backgroundColor: "#DC2626",
    transformOrigin: "left center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  labelContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.1)",
    maxWidth: 120,
  },
  labelText: {
    color: "#374151",
    fontWeight: "500",
    textAlign: "center",
  },
});
