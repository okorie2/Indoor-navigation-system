import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Menu, ArrowLeft } from "lucide-react-native";
import axios from "axios";
import { Connection, PathStep, Position, Route } from "../_types";
import InfiniteGrid from "@/components/InfiniteGrid";
import { getCurrentFloor } from "@/utils/getCurrentfloor";
import { useRouteSimulator } from "@/hooks/useRoutesimulation";
import DestinationPathModal from "./destinationPathModal";
import { useUserJourney } from "@/hooks/useUserJourney";
import { getDistance } from "@/utils/getDistance";
import { SVG_ANGLE_MAP, PX_SCALE, CM_SCALE } from "@/constants/navigation";
import { normalize } from "@/utils/normalizeVector";
import { getTurnDirection } from "@/utils/getTurnDirection";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function NavigationScreen() {
  const { currentLocation, destination } = useLocalSearchParams<{
    currentLocation: string;
    destination: string;
  }>();

  // User's specific route
  const [mapData, setMapData] = useState<any>(null); // fetched map data
  const [allNodes, setAllNodes] = useState<Position[] | null>(null); // all nodes relative to anchor
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentFloor = getCurrentFloor(currentLocation || "");
  const [route, setRoute] = useState<Route>({} as Route);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const handleGoBack = () => {
    isModalVisible && setIsModalVisible(false);
    router.back();
  };

  const getFastestPath = async (startNode: string, endNode: string) => {
    //fetch user path from backend
    try {
      const response = await axios.get(
        "http://localhost:8000/pathfindingWithEdges",
        {
          params: {
            start: startNode,
            end: endNode,
          },
        }
      );
      const data = response.data;
      return data.path;
    } catch (error) {
      console.error("Error fetching user path:", error);
      return error;
    }
  };

  const loadMapData = async () => {
    console.log("loading map data");
    try {
      const res = await axios.get("http://localhost:8000/static/senate.json");
      const data = res.data;
      setMapData(data);
    } catch (err) {
      console.error("Error fetching JSON:", err);
    }
  };

  const getXYPosition = (edge: PathStep) => {
    //dx=cos(angleMap[edge.dir] * Math.pi/180) * edge.distance * SCALE
    const rad = (SVG_ANGLE_MAP[edge.dir] * Math.PI) / 180;
    const dx = Math.cos(rad) * edge.distance * PX_SCALE * CM_SCALE;
    const dy = Math.sin(rad) * edge.distance * PX_SCALE * CM_SCALE;
    return { dx, dy };
  };

  const getRouteNodesXYPosition = React.useCallback((): Position[][] => {
    const positions: Position[][] = [];
    if (!route || !route.edges) return positions;
    const startNodePos = allNodes?.find((n) => n.node === route.start);
    if (!startNodePos) return positions;
    positions.push([startNodePos]);
    route.edges.forEach((edge) => {
      const edgePositions: Position[] = [];
      edge.path.forEach((step) => {
        const { dx: x, dy: y } = getXYPosition(step);
        edgePositions.push({ x, y });
      });
      positions.push(edgePositions);
    });
    return positions;
  }, [allNodes, route]);

  const getTurnDirectionsThroughDestinationPath = React.useCallback((): {
    meters: number;
    turn: string;
  }[][] => {
    /**
     * Generates turn-by-turn navigation instructions for the user’s route.
     *
     * It works by:
     * - Fetching the sequence of XY positions for the route (start + edge paths).
     * - Iterating through each position and finding the next position in the route
     *   (either the next step in the same edge, or the first step of the next edge).
     * - For each step, it calculates:
     *    - `meters`: the distance between the two points (currently placeholder 0).
     *    - `turn`: the turn direction (via getTurnDirection on normalized vectors).
     * - Returns a 2D array of directions, grouped by edges in the route.
     */
    try {
      const positions = getRouteNodesXYPosition();
      if (positions.length === 0) return [];
      const directions: { meters: number; turn: string }[][] = [];
      positions.forEach((pos, mainIndex) => {
        const subDirections: { meters: number; turn: string }[] = [];
        let isNewArray = false;
        pos.forEach((p, subIndex) => {
          let nextP;
          const nextMainIndex = mainIndex + 1;
          const nextSubIndex = subIndex + 1;
          if (
            subIndex === pos.length - 1 &&
            mainIndex === positions.length - 1
          ) {
            return;
          }
          if (
            subIndex === pos.length - 1 &&
            nextMainIndex <= positions.length - 1
          ) {
            isNewArray = true;
            nextP = positions[nextMainIndex][0];
          } else {
            isNewArray = false;
            nextP = pos[nextSubIndex];
          }
          const normalizedP = normalize(p.x, p.y);
          const normalizedNextP = normalize(nextP.x, nextP.y);

          subDirections.push({
            meters: (getDistance(p, nextP) / (PX_SCALE * CM_SCALE)).toFixed(
              1
            ) as unknown as number, // convert back to meters
            turn: getTurnDirection(normalizedP, normalizedNextP),
          });
        });
        if (isNewArray) {
          directions.push(subDirections);
        } else {
          directions[directions.length - 1].push(...subDirections);
        }
      });
      return directions;
    } catch (err) {
      console.error("Error in getTurnDirectionsThroughDestinationPath:", err);
      return [];
    }
  }, [getRouteNodesXYPosition]);

  const getAggregatedEdgePositions = React.useCallback(
    (start: Position | null, pathSteps: PathStep[] | null) => {
      /*the position of the every node in the path would be its aggregate
      *direction-distance + the position of the previous node.
      The previous node is the start position*/
      try {
        if (!start || !pathSteps) return { x: 0, y: 0 };
        let { x, y } = start;

        pathSteps.forEach((edge) => {
          const { dx, dy } = getXYPosition(edge);
          x += dx;
          y += dy;
        });
        return { x, y };
      } catch (err) {
        console.error("Error in getAggregatedEdgePositions:", err);
        return null;
      }
    },
    []
  );

  const getAllNodesRelativeToAnchor = React.useCallback(
    async (anchorNode: string) => {
      if (!mapData) return null;
      try {
        const start = { x: 0, y: 0 };
        const graph = mapData.graph;

        const results = await Promise.all(
          Object.keys(graph).map(async (edge, index) => {
            if (index === 0) return null;
            const { edges } = await getFastestPath(anchorNode, edge);

            if (!edges) {
              throw new Error(`No path found from ${anchorNode} to ${edge}`);
            }

            const edgePositionRelativeToAnchor = edges.reduce(
              (acc: Position, curr: Connection) => {
                const pos = getAggregatedEdgePositions(acc, curr.path ?? []);

                return { ...pos, node: curr.to };
              },
              { ...start, node: anchorNode }
            );
            return edgePositionRelativeToAnchor;
          })
        );
        setAllNodes(results.filter(Boolean) as Position[]);
      } catch (err) {
        console.error("Error fetching all nodes relative to anchor:", err);
        return null;
      }
    },
    [getAggregatedEdgePositions, mapData]
  );

  const { userPosition, heading } = useUserJourney(getRouteNodesXYPosition);

  const {
    currentSteps,
    messaging,
    isUserOnTrack,
    deviationDistance,
    nodeSubIndex,
    nodeMainIndex,
    arrivedDestination,
  } = useRouteSimulator(
    getTurnDirectionsThroughDestinationPath,
    userPosition!,
    heading!,
    getRouteNodesXYPosition()
  );

  React.useEffect(() => {
    loadMapData();
  }, []);
  React.useEffect(() => {
    getFastestPath(currentLocation!, destination!).then((data) => {
      setRoute(data);
    });
  }, []);

  React.useEffect(() => {
    if (mapData) {
      console.log("mapData is ready, running getAllNodesRelativeToAnchor...");
      getAllNodesRelativeToAnchor("northEntrance");
    }
  }, [mapData]);

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full Screen Infinite Grid */}
      <InfiniteGrid
        widthPx={screenWidth}
        heightPx={screenHeight}
        gridSize={25}
        nodePositions={allNodes || []}
        userPosition={{ x: -5.960049809750381e-13, y: -3244.5 }}
      />
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <ArrowLeft size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleModal}>
        <Menu size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal with Navigation Details */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={toggleModal}
      >
        <DestinationPathModal
          toggleModal={toggleModal}
          currentLocation={currentLocation!}
          currentFloor={currentFloor}
          userRoute={route}
          currentSteps={currentSteps}
          handleGoBack={handleGoBack}
          nodeMainIndex={nodeMainIndex}
          isOnTrack={isUserOnTrack}
          deviationDistance={deviationDistance}
          messaging={messaging}
          nodeSubIndex={nodeSubIndex}
          arrivedDestination={arrivedDestination}
        />
      </Modal>
    </View>
  );
}

export const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB", // light background
  },
  floatingButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB", // keep blue accent
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB", // lighter back button
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
