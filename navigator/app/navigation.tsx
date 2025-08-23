import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  MapPin,
  Navigation,
  Users,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react-native";
import Svg, {
  Line,
  Circle,
  Text as SvgText,
  Rect,
  Defs,
  Pattern,
  Path,
  G,
} from "react-native-svg";
import {
  Position,
  GeneratedPath,
  PathCoordinate,
  Connection,
  PathStep,
} from "./_types";
import {
  floorPlanData,
  pathToFollow,
  testEastPath,
  testWestPath,
} from "./_data";

const { width: screenWidth } = Dimensions.get("window");
const PX_SCALE = 20; //20 pixels per meter
const CM_SCALE = 210; // 210 cm per meter
const angleMap = {
  east: 0,
  south: 90,
  west: 180,
  north: 270,
};
export default function NavigationScreen() {
  const { buildingId, buildingName, currentLocation, destination } =
    useLocalSearchParams<{
      buildingId: string;
      buildingName: string;
      currentLocation: string;
      destination: string;
    }>();

  // Complete sample data structure

  // User's specific route
  const userRoute = ["SN211", "passage_F2_east", "SN214", "passage_F2_west"];

  const [showAllPaths, setShowAllPaths] = useState(true);
  const [showWeights, setShowWeights] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const getXYPosition = (edge: PathStep) => {
    //dx=cos(angleMap[edge.dir] * Math.pi/180) * edge.distance * SCALE
    const rad = (angleMap[edge.dir] * Math.PI) / 180;
    const dx = Math.cos(rad) * edge.distance * PX_SCALE * CM_SCALE;
    const dy = Math.sin(rad) * edge.distance * PX_SCALE * CM_SCALE;
    return { dx, dy };
  };

  const getAggregatedEdgePositions = (
    start: { x: number; y: number },
    path: PathStep[]
  ) => {
    //the position of the every node in the path  would be it's aggregate
    //direction-distance + the position of the previous node
    //the previous node is the start position
    let { x, y } = start;
    path.forEach((edge) => {
      const { dx, dy } = getXYPosition(edge);
      x += dx;
      y += dy;
    });
    return { x, y };
  };

  const getBasePosition = (pathToFollow: Connection[]) => {
    const positions = [{ x: 0, y: 0 }];
    return pathToFollow.map((step, index) => {
      const start = positions[index];
      const aggregatedPos = getAggregatedEdgePositions(start, step.path);
      positions.push(aggregatedPos);
      return {
        to: step.to,
        x: aggregatedPos.x,
        y: aggregatedPos.y,
      };
    });
  };
  console.log("west paths:", getBasePosition(testWestPath));
  console.log("east paths:", getBasePosition(testEastPath));

  // Generate node positions based on a simple layout algorithm
  const nodePositions = useMemo(() => {
    return getBasePosition(pathToFollow);
  }, []);

  // Generate all paths with coordinates
  const allPaths = useMemo((): GeneratedPath[] => {
    const paths: GeneratedPath[] = [];
    const directions = {
      north: { x: 0, y: -1 },
      south: { x: 0, y: 1 },
      east: { x: 1, y: 0 },
      west: { x: -1, y: 0 },
    };
    const scale = 4;

    Object.entries(floorPlanData).forEach(([fromNode, connections], index) => {
      const startPos = nodePositions[index];
      if (!startPos) return;

      connections.forEach((connection, connIndex) => {
        const pathCoords: PathCoordinate[] = [{ ...startPos, node: fromNode }];
        let currentPos = { ...startPos };

        connection.path.forEach((step, stepIndex) => {
          const dir = directions[step.dir];
          const newPos: PathCoordinate = {
            x: currentPos.x + dir.x * step.distance * scale,
            y: currentPos.y + dir.y * step.distance * scale,
            direction: step.dir,
            distance: step.distance,
            node:
              stepIndex === connection.path.length - 1
                ? connection.to
                : undefined,
          };
          pathCoords.push(newPos);
          //   currentPos = newPos;
        });

        paths.push({
          id: `${fromNode}-${connection.to}-${connIndex}`,
          from: fromNode,
          to: connection.to,
          weight: connection.weight,
          coordinates: pathCoords,
          isUserPath: false,
        });
      });
    });

    return paths;
  }, [nodePositions]);

  // Generate user's specific path
  const userPath = useMemo((): GeneratedPath[] => {
    const path: GeneratedPath[] = [];
    for (let i = 0; i < userRoute.length - 1; i++) {
      const from = userRoute[i];
      const to = userRoute[i + 1];

      const connection = floorPlanData[from]?.find((conn) => conn.to === to);
      if (connection) {
        const pathSegment = allPaths.find(
          (p) => p.from === from && p.to === to
        );
        if (pathSegment) {
          path.push({ ...pathSegment, isUserPath: true, stepIndex: i });
        }
      }
    }
    return path;
  }, [allPaths]);

  // Auto-advance simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < userPath.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentStep, userPath.length]);

  const getNodeIcon = (
    nodeId: string,
    isCurrent: boolean,
    isDestination: boolean
  ) => {
    const size = isCurrent ? 24 : 20;
    const color = isCurrent ? "#3B82F6" : isDestination ? "#EF4444" : "#10B981";

    if (nodeId.startsWith("SN")) return <Users size={size} color={color} />;
    if (nodeId.includes("passage"))
      return <Navigation size={size} color={color} />;
    if (nodeId.includes("staircase"))
      return <Building size={size} color={color} />;
    return <MapPin size={size} color={color} />;
  };

  const bounds = useMemo(() => {
    const allCoords = Object.values(nodePositions);
    if (allCoords.length === 0)
      return { minX: 0, maxX: 500, minY: 0, maxY: 500 };

    const xs = allCoords.map((p) => p.x);
    const ys = allCoords.map((p) => p.y);
    return {
      minX: Math.min(...xs) - 100,
      maxX: Math.max(...xs) + 100,
      minY: Math.min(...ys) - 100,
      maxY: Math.max(...ys) + 100,
    };
  }, [nodePositions]);

  const viewBoxWidth = bounds.maxX - bounds.minX;
  const viewBoxHeight = bounds.maxY - bounds.minY;

  const handleBackHome = () => {
    router.push("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2563EB" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Floor Plan Navigation</Text>
          <Text style={styles.subtitle}>Floor 2 - {buildingName}</Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              showAllPaths && styles.controlButtonActive,
            ]}
            onPress={() => setShowAllPaths(!showAllPaths)}
          >
            {showAllPaths ? (
              <Eye size={16} color="#ffffff" />
            ) : (
              <EyeOff size={16} color="#6B7280" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              showWeights && styles.controlButtonActive,
            ]}
            onPress={() => setShowWeights(!showWeights)}
          >
            <Text
              style={[
                styles.controlButtonText,
                showWeights && styles.controlButtonTextActive,
              ]}
            >
              W
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route Progress */}
      <View style={styles.routeProgress}>
        <Text style={styles.routeLabel}>Route Progress:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.routeContainer}
        >
          {userRoute.map((node, index) => (
            <View key={node} style={styles.routeItem}>
              <View
                style={[
                  styles.routeNode,
                  index <= currentStep && styles.routeNodeCompleted,
                  index === currentStep && styles.routeNodeCurrent,
                  index === userRoute.length - 1 && styles.routeNodeDestination,
                ]}
              >
                <Text
                  style={[
                    styles.routeNodeText,
                    (index <= currentStep || index === userRoute.length - 1) &&
                      styles.routeNodeTextActive,
                  ]}
                >
                  {node
                    .replace("SN", "")
                    .replace("passage_F2_", "")
                    .replace("staircase_F2_", "Stairs")}
                </Text>
              </View>
              {index < userRoute.length - 1 && (
                <ArrowRight
                  size={16}
                  color="#6B7280"
                  style={styles.routeArrow}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Floor Plan */}
        <View style={styles.floorPlanContainer}>
          <Svg
            width={screenWidth - 48}
            height={400}
            viewBox={`${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid Background */}
            <Defs>
              <Pattern
                id="grid"
                patternUnits="userSpaceOnUse"
                width="25"
                height="25"
              >
                <Path
                  d="M 25 0 L 0 0 0 25"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grid)" />

            {/* All Available Paths (Background) */}
            {showAllPaths &&
              allPaths.map((path) => {
                if (userPath.find((up) => up.id === path.id)) return null;

                return (
                  <G key={path.id} opacity="0.3">
                    {path.coordinates.slice(0, -1).map((coord, index) => {
                      const nextCoord = path.coordinates[index + 1];
                      return (
                        <G key={`${path.id}-segment-${index}`}>
                          <Line
                            x1={coord.x}
                            y1={coord.y}
                            x2={nextCoord.x}
                            y2={nextCoord.y}
                            stroke="#6b7280"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                          />
                          {nextCoord.distance && (
                            <SvgText
                              x={(coord.x + nextCoord.x) / 2}
                              y={(coord.y + nextCoord.y) / 2 - 8}
                              textAnchor="middle"
                              fontSize="10"
                              fill="#9CA3AF"
                            >
                              {nextCoord.distance}m
                            </SvgText>
                          )}
                        </G>
                      );
                    })}

                    {showWeights && (
                      <SvgText
                        x={
                          (path.coordinates[0].x +
                            path.coordinates[path.coordinates.length - 1].x) /
                          2
                        }
                        y={
                          (path.coordinates[0].y +
                            path.coordinates[path.coordinates.length - 1].y) /
                            2 +
                          20
                        }
                        textAnchor="middle"
                        fontSize="10"
                        fill="#F59E0B"
                        fontWeight="bold"
                      >
                        W:{path.weight}
                      </SvgText>
                    )}
                  </G>
                );
              })}

            {/* User's Path (Highlighted) */}
            {userPath.map((path, pathIndex) => {
              const isCurrentPath = pathIndex === currentStep;
              const isCompletedPath = pathIndex < currentStep;

              return (
                <G key={`user-${path.id}`}>
                  {path.coordinates.slice(0, -1).map((coord, index) => {
                    const nextCoord = path.coordinates[index + 1];
                    return (
                      <G key={`user-${path.id}-segment-${index}`}>
                        <Line
                          x1={coord.x}
                          y1={coord.y}
                          x2={nextCoord.x}
                          y2={nextCoord.y}
                          stroke={
                            isCompletedPath
                              ? "#10b981"
                              : isCurrentPath
                              ? "#3b82f6"
                              : "#f59e0b"
                          }
                          strokeWidth="4"
                          opacity={isCurrentPath ? 1 : 0.8}
                        />

                        {/* Direction Arrows */}
                        <Circle
                          cx={(coord.x + nextCoord.x) / 2}
                          cy={(coord.y + nextCoord.y) / 2}
                          r="8"
                          fill={
                            isCompletedPath
                              ? "#10b981"
                              : isCurrentPath
                              ? "#3b82f6"
                              : "#f59e0b"
                          }
                        />
                        <SvgText
                          x={(coord.x + nextCoord.x) / 2}
                          y={(coord.y + nextCoord.y) / 2 + 3}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="white"
                        >
                          {nextCoord.direction?.charAt(0).toUpperCase()}
                        </SvgText>

                        {/* Distance Labels */}
                        {nextCoord.distance && (
                          <SvgText
                            x={(coord.x + nextCoord.x) / 2}
                            y={(coord.y + nextCoord.y) / 2 - 15}
                            textAnchor="middle"
                            fontSize="12"
                            fontWeight="600"
                            fill="white"
                          >
                            {nextCoord.distance}m
                          </SvgText>
                        )}
                      </G>
                    );
                  })}
                </G>
              );
            })}

            {/* All Nodes */}
            {nodePositions.map((node) => {
              const isCurrentNode = node.to === userRoute[currentStep];
              const isDestination = node.to === userRoute[userRoute.length - 1];
              const isOnUserRoute = userRoute.includes(node.to);

              return (
                <G key={`node-${node.to}`}>
                  {/* Node Circle */}
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={isCurrentNode ? 18 : isOnUserRoute ? 15 : 12}
                    fill={
                      isCurrentNode
                        ? "#3b82f6"
                        : isDestination
                        ? "#ef4444"
                        : isOnUserRoute
                        ? "#10b981"
                        : "#6b7280"
                    }
                    stroke="#1f2937"
                    strokeWidth="2"
                  />

                  {/* Pulsing animation for current node */}
                  {isCurrentNode && (
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r="25"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  )}

                  {/* Node Label */}
                  <SvgText
                    x={node.x}
                    y={node.y - 25}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill={isOnUserRoute ? "white" : "#9CA3AF"}
                  >
                    {node.to}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>

        {/* Navigation Status Panel */}
        <View style={styles.statusPanel}>
          <Text style={styles.statusTitle}>Navigation Status</Text>

          {/* Current Location */}
          <View style={styles.currentLocationCard}>
            <Text style={styles.currentLocationLabel}>CURRENT LOCATION</Text>
            <Text style={styles.currentLocationText}>
              {userRoute[currentStep]}
            </Text>
          </View>

          {/* Available Paths from Current Location */}
          <View style={styles.availablePathsContainer}>
            <Text style={styles.availablePathsLabel}>AVAILABLE PATHS</Text>
            <View style={styles.pathsList}>
              {floorPlanData[userRoute[currentStep]]?.map(
                (connection, index) => {
                  const isUserChoice =
                    currentStep < userRoute.length - 1 &&
                    connection.to === userRoute[currentStep + 1];

                  return (
                    <View
                      key={index}
                      style={[
                        styles.pathItem,
                        isUserChoice && styles.pathItemSelected,
                      ]}
                    >
                      <View style={styles.pathHeader}>
                        <Text
                          style={[
                            styles.pathDestination,
                            isUserChoice && styles.pathDestinationSelected,
                          ]}
                        >
                          {connection.to}
                        </Text>
                        <Text
                          style={[
                            styles.pathWeight,
                            isUserChoice && styles.pathWeightSelected,
                          ]}
                        >
                          Weight: {connection.weight}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.pathDetails,
                          isUserChoice && styles.pathDetailsSelected,
                        ]}
                      >
                        {connection.path
                          .map(
                            (step, i) =>
                              `${step.dir} ${step.distance}m${
                                i < connection.path.length - 1 ? " → " : ""
                              }`
                          )
                          .join("")}
                      </Text>
                    </View>
                  );
                }
              )}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>LEGEND</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendLine, { backgroundColor: "#3B82F6" }]}
                />
                <Text style={styles.legendText}>Current path segment</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendLine, { backgroundColor: "#10B981" }]}
                />
                <Text style={styles.legendText}>Completed segments</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendLine,
                    { backgroundColor: "#6B7280", opacity: 0.5 },
                  ]}
                />
                <Text style={styles.legendText}>Alternative paths</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendCircle, { backgroundColor: "#3B82F6" }]}
                />
                <Text style={styles.legendText}>Current location</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendCircle, { backgroundColor: "#EF4444" }]}
                />
                <Text style={styles.legendText}>Destination</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Demo Notice */}
        <View style={styles.demoNotice}>
          <Text style={styles.demoText}>
            Demo: Auto-advancing every 3 seconds • Toggle controls to show/hide
            paths and weights
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.endButton} onPress={handleBackHome}>
          <Text style={styles.endButtonText}>End Navigation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 2,
  },
  headerControls: {
    flexDirection: "row",
    gap: 8,
  },
  controlButton: {
    backgroundColor: "#374151",
    borderRadius: 6,
    padding: 8,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: {
    backgroundColor: "#2563EB",
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  controlButtonTextActive: {
    color: "#ffffff",
  },
  routeProgress: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  routeLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  routeContainer: {
    flexDirection: "row",
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeNode: {
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  routeNodeCompleted: {
    backgroundColor: "#10B981",
  },
  routeNodeCurrent: {
    backgroundColor: "#3B82F6",
  },
  routeNodeDestination: {
    backgroundColor: "#EF4444",
  },
  routeNodeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  routeNodeTextActive: {
    color: "#ffffff",
  },
  routeArrow: {
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  floorPlanContainer: {
    backgroundColor: "#1F2937",
    margin: 24,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusPanel: {
    backgroundColor: "#1F2937",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 16,
  },
  currentLocationCard: {
    backgroundColor: "#1E40AF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  currentLocationLabel: {
    fontSize: 12,
    color: "#BFDBFE",
    marginBottom: 4,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  availablePathsContainer: {
    marginBottom: 20,
  },
  availablePathsLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  pathsList: {
    gap: 8,
  },
  pathItem: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#4B5563",
  },
  pathItemSelected: {
    backgroundColor: "#065F46",
    borderColor: "#10B981",
  },
  pathHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  pathDestination: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  pathDestinationSelected: {
    color: "#ffffff",
  },
  pathWeight: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  pathWeightSelected: {
    color: "#D1FAE5",
  },
  pathDetails: {
    fontSize: 10,
    color: "#9CA3AF",
    lineHeight: 14,
  },
  pathDetailsSelected: {
    color: "#D1FAE5",
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 16,
  },
  legendTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendLine: {
    width: 16,
    height: 4,
    marginRight: 8,
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  demoNotice: {
    backgroundColor: "#1F2937",
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 8,
  },
  demoText: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#1F2937",
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  endButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
