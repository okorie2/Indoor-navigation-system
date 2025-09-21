import { useEffect, useMemo, useState } from "react";
import { Position, Travelling } from "@/app/_types";
import { getDistance } from "@/utils/getDistance";
import {
  PX_SCALE,
  CM_SCALE,
  CORRECTIBLE_DEVIATION,
  DISTANCE_TOLERANCE,
} from "@/constants/navigation";
import { isEmpty } from "lodash";
import { normalize } from "@/utils/normalizeVector";
import { getTurnDirection } from "@/utils/getTurnDirection";

export function useRouteSimulator(
  getTurnDirectionsThroughDestinationPath: () => Travelling[][],
  userPosition: Position,
  heading: Position,
  nodesXYPosition: Position[][]
) {
  const turnDirections = useMemo(
    () => getTurnDirectionsThroughDestinationPath(),
    [getTurnDirectionsThroughDestinationPath]
  );

  const [turnMainIndex, setTurnMainIndex] = useState(0);
  const [nodeMainIndex, setNodeMainIndex] = useState(0);
  const [nodeSubIndex, setNodeSubIndex] = useState(0);
  const [messaging, setMessaging] = useState("");
  const [isUserOnTrack, setIsUserOnTrack] = useState(true);
  const [deviationDistance, setDeviationDistance] = useState(0);
  const [arrivedDestination, setArrivedDestination] = useState(false);

  const getNodeXY = (mainIndex: number, subIndex: number) =>
    nodesXYPosition[mainIndex][subIndex];

  const handleNextNodeTurn = (
    nextMainIndex: number,
    nextSubIndex: number,
    normUser: Position
  ) => {
    const nextNode = getNodeXY(nextMainIndex, nextSubIndex);
    const normNext = normalize(nextNode.x, nextNode.y);
    const userVector = heading ?? { x: 0, y: 0 };
    const nextVector = normalize(
      nextNode.x - userPosition.x,
      nextNode.y - userPosition.y
    );
    console.log(
      "next node :",
      normNext,
      "user pos :",
      normUser,
      "direction :",
      getTurnDirection(normUser, normNext)
    );

    return getTurnDirection(userVector, nextVector);
  };

  const handleMessaging = (turnDirection: string | null) => {
    setMessaging(
      turnDirection !== "Straight"
        ? `Make a ${turnDirection}`
        : "Continue Straight"
    );
  };

  const directionsToNextNode: Travelling[] = useMemo(() => {
    if (turnDirections.length === 0) return [];
    return turnDirections[turnMainIndex];
  }, [turnMainIndex, turnDirections]);

  const advanceSubNode = (normUser: Position) => {
    const turnDirection = handleNextNodeTurn(
      nodeMainIndex,
      nodeSubIndex + 1,
      normUser
    );
    handleMessaging(turnDirection);
    setNodeSubIndex((prev) => prev + 1);
  };

  const advanceMainNode = (normUser: Position) => {
    const turnDirection = handleNextNodeTurn(nodeMainIndex + 1, 0, normUser);
    handleMessaging(turnDirection);

    if (nodeMainIndex !== 0) {
      setTurnMainIndex((prev) => Math.min(prev + 1, turnDirections.length - 1));
    }
    setNodeMainIndex((prev) => prev + 1);
    setNodeSubIndex(0);
  };

  useEffect(() => {
    if (nodesXYPosition.length === 0 || isEmpty(userPosition)) return;

    const nodeXY = getNodeXY(nodeMainIndex, nodeSubIndex);
    const distanceToNode =
      getDistance(nodeXY, userPosition) / (PX_SCALE * CM_SCALE);

    if (distanceToNode < DISTANCE_TOLERANCE) {
      setDeviationDistance(0);
      setIsUserOnTrack(true);
      if (nodeSubIndex + 1 < nodesXYPosition[nodeMainIndex].length) {
        advanceSubNode(userPosition);
      } else if (nodeMainIndex + 1 < nodesXYPosition.length) {
        advanceMainNode(userPosition);
      } else {
        console.log("Arrived at destination");
        setArrivedDestination(true);
        setMessaging("You have arrived at your destination.");
      }
      return;
    }

    const turnDirection = handleNextNodeTurn(
      nodeMainIndex,
      nodeSubIndex,
      userPosition
    );

    if (turnDirection !== "Straight") {
      setIsUserOnTrack(false);
      setDeviationDistance(distanceToNode);

      if (distanceToNode > CORRECTIBLE_DEVIATION) {
        setMessaging(`You're ${Math.round(distanceToNode)}m off course.`);
      } else {
        setMessaging(
          `You are starting to deviate from course. Make a ${turnDirection} from where you are.`
        );
      }
    } else {
      setIsUserOnTrack(true);
      setMessaging(
        `You are right on track. Continue straight for ${distanceToNode} meters.`
      );
    }
  }, [userPosition]);

  return {
    currentSteps: directionsToNextNode,
    messaging,
    isUserOnTrack,
    deviationDistance,
    nodeSubIndex,
    nodeMainIndex,
    arrivedDestination,
  };
}
