import React, { useState, useMemo } from "react";
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
import { ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import axios from "axios";
import { Connection, PathStep, Position } from "./_types";
import { floorPlanData, pathToFollow } from "./_data";
import InfiniteGrid from "@/components/InfiniteGrid";

const { width: screenWidth } = Dimensions.get("window");
const PX_SCALE = 1; //5 pixels per centimeter
const CM_SCALE = 210; // 210 cm per meter
const SVGAngleMap = {
  east: 0,
  south: 90,
  west: 180,
  north: 270,
};
export default function NavigationScreen() {
  const { buildingName } = useLocalSearchParams<{
    buildingId: string;
    buildingName: string;
    currentLocation: string;
    destination: string;
  }>();

  // User's specific route
  const userRoute = ["SN211", "passage_F2_east", "SN214", "passage_F2_west"];
  const [mapData, setMapData] = useState<any>(null); // fetched map data
  const [showAllPaths, setShowAllPaths] = useState(true);
  const [showWeights, setShowWeights] = useState(false);
  const [userCurrentLocation, setUserCurrentLocation] = useState({
    x: 0,
    y: 0,
  });
  const [currentStep, _setCurrentStep] = useState(0);

  const getFastestPath = async (startNode: string, endNode: string) => {
    //fetch user path from backend
    try {
      const response = await axios.get(
        "https://3f06988550e8.ngrok-free.app/pathfindingWithEdges",
        {
          params: {
            start: startNode,
            end: endNode,
          },
        }
      );
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error fetching user path:", error);
      return error;
    }
  };

  const loadMapData = async () => {
    console.log("loading map data");
    try {
      const res = await axios.get(
        "https://3f06988550e8.ngrok-free.app/static/senate.json"
      );
      const data = res.data;
      setMapData(data);
    } catch (err) {
      console.error("Error fetching JSON:", err);
    }
  };

  const getXYPosition = (edge: PathStep) => {
    //dx=cos(angleMap[edge.dir] * Math.pi/180) * edge.distance * SCALE
    const rad = (SVGAngleMap[edge.dir] * Math.PI) / 180;
    const dx = Math.cos(rad) * edge.distance * PX_SCALE * CM_SCALE;
    const dy = Math.sin(rad) * edge.distance * PX_SCALE * CM_SCALE;
    return { dx, dy };
  };

  const getAggregatedEdgePositions = (
    start: Position | null,
    path: PathStep[] | null
  ) => {
    /*the position of the every node in the path would be its aggregate
      *direction-distance + the position of the previous node.
      The previous node is the start position*/
    try {
      if (!start || !path) return null;
      let { x, y } = start;
      path.forEach((edge) => {
        const { dx, dy } = getXYPosition(edge);
        x += dx;
        y += dy;
      });
      return { x, y };
    } catch (err) {
      console.error("Error in getAggregatedEdgePositions:", err);
      return null;
    }
  };

  const getBasePosition = (pathToFollow: Connection[]): Position[] => {
    try {
      const positions: (Position | null)[] = [{ x: 0, y: 0 }];
      return pathToFollow.map((step, index) => {
        const start = positions[index];
        const aggregatedPos = getAggregatedEdgePositions(start, step.path);
        positions.push(aggregatedPos);
        if (!aggregatedPos) {
          throw new Error(
            "Failed to compute aggregated position because start position is null"
          );
        }
        return {
          node: step.to,
          x: aggregatedPos.x,
          y: aggregatedPos.y,
        };
      });
    } catch (err) {
      console.error("Error in getBasePosition:", err);
      return [];
    }
  };

  const getAllNodesRelativeToAnchor = async (anchorNode: string) => {
    if (!mapData) return;
    try {
      const start = { x: 0, y: 0 };
      const graph = mapData.graph;

      const results = await Promise.all(
        Object.keys(graph).map(async (edge, index) => {
          if (index === 0) return null;
          const { path } = await getFastestPath(anchorNode, edge);
          if (!path) {
            throw new Error(`No path found from ${anchorNode} to ${edge}`);
          }
          return path.map((element: Connection) => ({
            ...getAggregatedEdgePositions(start, element.path),
            node: edge,
          }));
        })
      );
      console.log(results.flat().filter(Boolean) as Position[]);
      return results.flat().filter(Boolean) as Position[];
    } catch (err) {
      console.error("Error fetching all nodes relative to anchor:", err);
    }
  };

  const nodePositions = useMemo(() => {
    return getBasePosition(pathToFollow);
  }, []);

  const otherRelativePaths = useMemo(() => {
    //paths relative to the anchor node
    const anchorNode = floorPlanData["SN211"];
    return getBasePosition(anchorNode);
  }, []);

  const SPEED = 50; // pixels per second

  const simulateUserMovement = () => {
    /* Simulate user movement along the path for demo purposes. In a real app, this would be based on actual location data. */
    /* We do this by increasing userCurrentlocation by 50 pixels every second */

    let segmentIndex = 0;
    let startTime: number | null = null;

    const moveAlongSegment = (timestamp: number) => {
      if (segmentIndex >= nodePositions.length) return; // done

      if (!startTime) startTime = timestamp;

      const from =
        segmentIndex === 0 ? { x: 0, y: 0 } : nodePositions[segmentIndex - 1];
      const to = nodePositions[segmentIndex];

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // time elapsed
      const elapsed = (timestamp - startTime) / 1000; // sec
      const traveled = Math.min(elapsed * SPEED, dist);

      // normalized direction
      const nx = dx / dist;
      const ny = dy / dist;

      const newX = from.x + nx * traveled;
      const newY = from.y + ny * traveled;

      setUserCurrentLocation({ x: newX, y: newY });

      if (traveled < dist) {
        requestAnimationFrame(moveAlongSegment);
      } else {
        // reached this node → advance
        segmentIndex++;
        startTime = null;
        requestAnimationFrame(moveAlongSegment);
      }
    };

    requestAnimationFrame(moveAlongSegment);
  };

  React.useEffect(() => {
    // getFastestPath("northEntrance", "toilets");
    loadMapData();
    // getAllNodesRelativeToAnchor("northEntrance");
    // simulateUserMovement();
  }, []);

  React.useEffect(() => {
    if (mapData) {
      console.log("mapData is ready, running getAllNodesRelativeToAnchor...");
      getAllNodesRelativeToAnchor("northEntrance");
    }
  }, [mapData]);

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
        <InfiniteGrid
          widthPx={screenWidth - 48}
          heightPx={400}
          gridSize={25}
          nodePositions={nodePositions}
          otherRelativePaths={otherRelativePaths}
          yUp={true} // since your data is in math coords
          userPosition={userCurrentLocation}
        />

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

export const styles = StyleSheet.create({
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
    // padding: 16,
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
