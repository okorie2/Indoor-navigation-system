import { Position, Travelling } from "@/app/_types";
import { getDistance } from "@/utils/getDistance";
import { PX_SCALE, CM_SCALE } from "@/constants/navigation";
import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { normalize } from "@/utils/normalizeVector";
import { getTurnDirection } from "@/utils/getTurnDirection";

/**
 * useRouteSimulator
 *
 * Simulates moving through the route edge by edge.
 * Every 5 seconds, it advances to the next group of directions (an inner array).
 */
export function useRouteSimulator(
  getTurnDirectionsThroughDestinationPath: () => Travelling[][],
  userPosition: Position,
  nodesXYPosition: Position[][]
) {
  const turnDirections = React.useMemo(
    () => getTurnDirectionsThroughDestinationPath(),
    [getTurnDirectionsThroughDestinationPath]
  );

  const [directionsToNextNode, setDirectionsToNextNode] = useState<
    Travelling[]
  >([]);
  const [turnMainIndex, setTurnMainIndex] = useState(0);
  const [turnSubIndex, setTurnSubIndex] = useState(0);
  const [nodeMainIndex, setNodeMainIndex] = useState(0);
  const [nodeSubIndex, setNodeSubIndex] = useState(0);
  const [messaging, setMessaging] = useState<string>("");
  const [isUserOnTrack, setIsUserOnTrack] = useState(true);
  const [deviationDistance, setDeviationDistance] = useState<number>(0);

  // console.log("turnDirections", turnMainIndex, nodeMainIndex, userPosition);
  const getNodeXY = (mainIndex: number, subIndex: number) => {
    return nodesXYPosition[mainIndex][subIndex];
  };

  function handleNextNodeTurn(
    nextMainIndex: number,
    nextSubIndex: number,
    normlizedUserPosition: Position
  ) {
    const nextNodeXY = getNodeXY(nextMainIndex, nextSubIndex);
    const normlizedNextNodePosition = normalize(nextNodeXY.x, nextNodeXY.y);

    const turnDirection = getTurnDirection(
      normlizedUserPosition,
      normlizedNextNodePosition
    );

    return turnDirection;
  }
  const handleMessaging = (turnDirection: string | null) => {
    if (turnDirection !== "Straight") {
      setIsUserOnTrack(false);
      setMessaging(`Make a ${turnDirection}`);
    } else {
      setIsUserOnTrack(true);
      setMessaging(`Continue Straight`);
    }
  };

  // Effect: check distance to next node
  useEffect(() => {
    if (nodesXYPosition.length === 0 || isEmpty(userPosition)) return;
    const nodeXY = getNodeXY(nodeMainIndex, nodeSubIndex);
    console.log("user pos", nodeXY, "and", userPosition);
    const distanceToNode =
      getDistance(nodeXY, userPosition) / (PX_SCALE * CM_SCALE);

    const normlizedUserPosition = normalize(userPosition.x, userPosition.y);

    if (distanceToNode === 0) {
      console.log("Arrived at node", userPosition);
      if (nodeSubIndex + 1 < nodesXYPosition[nodeMainIndex].length) {
        // --- case: move to next subnode ---
        const turnDirection = handleNextNodeTurn(
          nodeMainIndex,
          nodeSubIndex + 1,
          normlizedUserPosition
        );
        handleMessaging(turnDirection);
        setNodeSubIndex((prev) => prev + 1);
      } else if (nodeMainIndex + 1 < nodesXYPosition.length) {
        // --- case: move to next main node ---
        const turnDirection = handleNextNodeTurn(
          nodeMainIndex + 1,
          0,
          normlizedUserPosition
        );
        handleMessaging(turnDirection);

        setNodeMainIndex((prev) => prev + 1);
        setTurnMainIndex((prev) =>
          Math.min(prev + 1, turnDirections.length - 1)
        );
        setNodeSubIndex(0); // reset subIndex when moving to next main node
      }
    } else {
      console.log("Not Arrived at node", distanceToNode);
      const turnDirection = handleNextNodeTurn(
        nodeMainIndex,
        nodeSubIndex,
        normlizedUserPosition
      );
      if (turnDirection !== "Straight") {
        setIsUserOnTrack(false);
        setDeviationDistance(distanceToNode);
      }

      //get turn direction to next node and compare with user heading
      //if user is in the right direction. return messaging. if not, return corrective messaging
      //also find out how many meters away the user is from the next node.
    }
  }, [userPosition]);

  // Effect: update directions when turn index changes
  useEffect(() => {
    if (turnDirections.length === 0) return;
    setDirectionsToNextNode(turnDirections[turnMainIndex] || []);
  }, [turnMainIndex, turnDirections]);

  return {
    currentSteps: directionsToNextNode,
    turnMainIndex,
    turnSubIndex,
    nodeMainIndex,
    nodeSubIndex,
    messaging,
    isUserOnTrack,
    deviationDistance,
  };
}
