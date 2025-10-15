import { useEffect, useMemo, useState, useCallback } from "react";
import { Position, Travelling } from "@/app/_types";
import { getDistance } from "@/utils/getDistance";
import {
  PX_SCALE,
  CM_SCALE,
  CORRECTIBLE_DEVIATION,
  DISTANCE_TOLERANCE,
  ANGLE_TOLERANCE,
  TURN_ANTICIPATION_DISTANCE,
} from "@/constants/navigation";
import { normalize } from "@/utils/normalizeVector";
import { getTurnDirection } from "@/utils/getTurnDirection";
import { isEmpty } from "lodash";

function normalizeVector(x: number, y: number) {
  return normalize(x, y);
}

function getTurnToNextNodeWithTolerance(
  userPosition: Position,
  heading: Position | null,
  nextNode: Position
): string | null {
  const userVector = heading ?? { x: 0, y: 0 };
  const nextVector = normalize(
    nextNode.x - userPosition.x,
    nextNode.y - userPosition.y
  );

  const rawDirection = getTurnDirection(userVector, nextVector);

  // TODO: compute angle between vectors (dot product)
  const dot = userVector.x * nextVector.x + userVector.y * nextVector.y;
  const magUser = Math.sqrt(userVector.x ** 2 + userVector.y ** 2);
  const magNext = Math.sqrt(nextVector.x ** 2 + nextVector.y ** 2);
  const angleDeg = Math.acos(dot / (magUser * magNext)) * (180 / Math.PI);

  if (angleDeg < ANGLE_TOLERANCE) {
    return "Straight";
  }
  return rawDirection;
}

function formatMessaging(
  turnDirection: string | null,
  distance: number,
  offCourse: boolean
): string {
  if (offCourse) {
    if (distance > CORRECTIBLE_DEVIATION) {
      return `You're ${Math.round(distance)}m off course.`;
    }
    return `You're deviating. Make a ${turnDirection} to rejoin.`;
  }

  if (distance <= TURN_ANTICIPATION_DISTANCE && turnDirection !== "Straight") {
    return `Turn ${turnDirection} now.`;
  }

  if (
    distance <= TURN_ANTICIPATION_DISTANCE * 2 &&
    turnDirection !== "Straight"
  ) {
    return `Prepare to turn ${turnDirection} in ${Math.round(
      distance
    )} meters.`;
  }

  if (turnDirection && turnDirection !== "Straight") {
    return `Continue straight, then turn ${turnDirection} in ${Math.round(
      distance
    )} meters.`;
  }

  return `Continue straight for ${Math.round(distance)} meters.`;
}

export function useRouteNavigator(
  getTurnDirectionsThroughDestinationPath: () => Travelling[][],
  userPosition: Position,
  heading: Position | null,
  nodesXYPosition: Position[][]
) {
  // === NAVIGATION DATA ===
  const turnDirections = useMemo(
    () => getTurnDirectionsThroughDestinationPath(),
    [getTurnDirectionsThroughDestinationPath]
  );

  const [turnMainIndex, setTurnMainIndex] = useState(0);
  const [nodeMainIndex, setNodeMainIndex] = useState(0);
  const [nodeSubIndex, setNodeSubIndex] = useState(0);

  // === STATE ===
  const [messaging, setMessaging] = useState("");
  const [isUserOnTrack, setIsUserOnTrack] = useState(true);
  const [deviationDistance, setDeviationDistance] = useState(0);
  const [arrivedDestination, setArrivedDestination] = useState(false);
  const [distanceToNextTurn, setDistanceToNextTurn] = useState<number | null>(
    null
  );

  const getNodeXY = useCallback(
    (mainIndex: number, subIndex: number) =>
      nodesXYPosition?.[mainIndex]?.[subIndex],
    [nodesXYPosition]
  );

  const directionsToNextNode: Travelling[] = useMemo(() => {
    if (!turnDirections.length) return [];
    return turnDirections[turnMainIndex];
  }, [turnMainIndex, turnDirections]);

  const advanceSubNode = useCallback(
    (normUser: Position) => {
      const nextNode = getNodeXY(nodeMainIndex, nodeSubIndex + 1);
      if (!nextNode) return;

      const turnDirection = getTurnToNextNodeWithTolerance(
        userPosition,
        heading,
        nextNode
      );
      setMessaging(formatMessaging(turnDirection, 0, false));
      setNodeSubIndex((prev) => prev + 1);
    },
    [getNodeXY, nodeMainIndex, nodeSubIndex, userPosition, heading]
  );

  const advanceMainNode = useCallback(
    (normUser: Position) => {
      const nextNode = getNodeXY(nodeMainIndex + 1, 0);
      if (!nextNode) return;

      const turnDirection = getTurnToNextNodeWithTolerance(
        userPosition,
        heading,
        nextNode
      );
      setMessaging(formatMessaging(turnDirection, 0, false));

      if (nodeMainIndex !== 0) {
        setTurnMainIndex((prev) =>
          Math.min(prev + 1, turnDirections.length - 1)
        );
      }
      setNodeMainIndex((prev) => prev + 1);
      setNodeSubIndex(0);
    },
    [getNodeXY, nodeMainIndex, turnDirections.length, userPosition, heading]
  );

  // === EFFECTS ===
  useEffect(() => {
    if (!nodesXYPosition.length || isEmpty(userPosition) || arrivedDestination)
      return;

    const currentNode = getNodeXY(nodeMainIndex, nodeSubIndex);
    if (!currentNode) return;

    const distanceToTurn =
      getDistance(currentNode, userPosition) / (PX_SCALE * CM_SCALE);

    setDistanceToNextTurn(distanceToTurn);

    if (distanceToTurn < DISTANCE_TOLERANCE) {
      setDeviationDistance(0);
      setIsUserOnTrack(true);

      if (nodeSubIndex + 1 < nodesXYPosition[nodeMainIndex].length) {
        advanceSubNode(userPosition);
      } else if (nodeMainIndex + 1 < nodesXYPosition.length) {
        advanceMainNode(userPosition);
      } else {
        setArrivedDestination(true);
        setMessaging("You have arrived at your destination.");
      }
      return;
    }

    // Handle deviation or straight path
    const turnDirection = getTurnToNextNodeWithTolerance(
      userPosition,
      heading,
      currentNode
    );
    const offCourse = turnDirection !== "Straight";

    setIsUserOnTrack(!offCourse);
    setDeviationDistance(distanceToTurn);
    setMessaging(formatMessaging(turnDirection, distanceToTurn, offCourse));
  }, [
    userPosition,
    heading,
    nodesXYPosition,
    nodeMainIndex,
    nodeSubIndex,
    arrivedDestination,
    advanceSubNode,
    advanceMainNode,
    getNodeXY,
  ]);

  return {
    currentSteps: directionsToNextNode,
    messaging,
    isUserOnTrack,
    deviationDistance,
    nodeSubIndex,
    nodeMainIndex,
    arrivedDestination,
    distanceToNextTurn,
  };
}
