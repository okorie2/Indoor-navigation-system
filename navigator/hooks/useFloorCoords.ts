import { Position, Route } from "@/app/_types";
import { useMemo, useRef, useState } from "react";
import { Gesture } from "react-native-gesture-handler";
import { CM_SCALE, SVG_ANGLE_MAP } from "@/constants/navigation";

interface UseFloorCoordsProps {
  widthPx: number; // e.g. screenWidth - 48
  heightPx: number; // e.g. 400
  gridSize?: number; // world units per cell (default 25)
  nodePositions: Position[];
  route: Route | null;
}

interface FloorLabel {
  floor: number;
  x: number;
  y: number;
  screenX: number;
  screenY: number;
  fontSize: number;
}

interface VisibleNode extends Position {
  screenX: number;
  screenY: number;
  priority: number;
  iconSize: number;
  fontSize: number;
  showLabel: boolean;
}

const useFloorCoords = ({
  nodePositions,
  gridSize = 25,
  route,
  widthPx,
  heightPx,
}: UseFloorCoordsProps) => {
  const PAD_CELLS = 4; // 4 grid cells of padding
  const pad = PAD_CELLS * gridSize;
  const separator = pad * 2; // Space between floors
  const getFloor = (node?: string): number => {
    if (!node) return 0;
    if (node.includes("F4") || node.startsWith("SN4")) return 4;
    if (node.includes("F3") || node.startsWith("SN3")) return 3;
    if (node.includes("F2") || node.startsWith("SN2")) return 2;
    if (node.includes("F1") || node.startsWith("SN1")) return 1;
    if (node.includes("F0") || node.startsWith("SN0")) return 0;
    return 0;
  };

  const floorNodes = useMemo(() => {
    const map = new Map<number, Position[]>();
    for (const pos of nodePositions) {
      const floor = getFloor(pos.node);
      if (!map.has(floor)) map.set(floor, []);
      map.get(floor)!.push(pos);
    }
    return map;
  }, [nodePositions]);

  const floors = useMemo(
    () => Array.from(floorNodes.keys()).sort((a, b) => b - a),
    [floorNodes]
  );

  const floorBounds = useMemo(() => {
    const map = new Map<
      number,
      { minX: number; maxX: number; minY: number; maxY: number }
    >();
    for (const [floor, nodes] of floorNodes) {
      if (!nodes.length) continue;
      const xs = nodes.map((n) => n.x);
      const ys = nodes.map((n) => n.y);
      map.set(floor, {
        minX: Math.min(...xs) - pad,
        maxX: Math.max(...xs) + pad,
        minY: Math.min(...ys) - pad,
        maxY: Math.max(...ys) + pad,
      });
    }
    return map;
  }, [floorNodes, pad]);

  const floorOffsets = useMemo(() => {
    const map = new Map<number, number>();
    let cumulativeY = 0;
    for (const floor of floors) {
      const bounds = floorBounds.get(floor)!;
      const height = bounds.maxY - bounds.minY;
      map.set(floor, cumulativeY - bounds.minY);
      cumulativeY += height + separator;
    }
    return map;
  }, [floors, floorBounds, separator]);

  const labelMargin = gridSize * 4;

  const initialMinX = useMemo(() => {
    if (!nodePositions.length) return -250;
    const xs = nodePositions.map((n) => n.x);
    return Math.min(...xs) - pad - labelMargin;
  }, [nodePositions, pad, labelMargin]);

  const initialMaxX = useMemo(() => {
    if (!nodePositions.length) return 250;
    const xs = nodePositions.map((n) => n.x);
    return Math.max(...xs) + pad;
  }, [nodePositions, pad]);

  const adjustedNodePositions = useMemo((): Position[] => {
    return nodePositions.map((pos) => {
      const floor = getFloor(pos.node);
      const offset = floorOffsets.get(floor) || 0;
      return { ...pos, y: pos.y + offset };
    });
  }, [nodePositions, floorOffsets]);

  const adjustedPositionsMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const pos of adjustedNodePositions) {
      if (pos.node) map.set(pos.node, { x: pos.x, y: pos.y });
    }
    return map;
  }, [adjustedNodePositions]);

  const initialMinY = useMemo(() => {
    if (!adjustedNodePositions.length) return -250;
    const ys = adjustedNodePositions.map((n) => n.y);
    return Math.min(...ys) - pad;
  }, [adjustedNodePositions, pad]);

  const initialMaxY = useMemo(() => {
    if (!adjustedNodePositions.length) return 250;
    const ys = adjustedNodePositions.map((n) => n.y);
    return Math.max(...ys) + pad;
  }, [adjustedNodePositions, pad]);

  const initialBounds = useMemo(() => {
    return {
      minX: initialMinX,
      maxX: initialMaxX,
      minY: initialMinY,
      maxY: initialMaxY,
    };
  }, [initialMinX, initialMaxX, initialMinY, initialMaxY]);

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

  // Keep a giant rect always covering more than the viewBox.
  const BIG = gridSize * 2000; // effectively "infinite" coverage

  // Gestures: Pan + Pinch (zoom around center for simplicity)
  const panStart = useRef({ x: 0, y: 0 });
  const pinchStart = useRef({ scale: 1, centerX: 0, centerY: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      panStart.current = { x: camX, y: camY };
    })
    .onChange((e) => {
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
      pinchStart.current.scale = scale;
      pinchStart.current.centerX = camX + vw / 2;
      pinchStart.current.centerY = camY + vh / 2;
    })
    .onChange((e) => {
      const newScale = clamp(pinchStart.current.scale * e.scale, 0.2, 20);
      const newVw = baseWidth / newScale;
      const newVh = baseHeight / newScale;

      const newCamX = pinchStart.current.centerX - newVw / 2;
      const newCamY = pinchStart.current.centerY - newVh / 2;

      setScale(newScale);
      setCamX(newCamX);
      setCamY(newCamY);
    })
    .runOnJS(true);

  const composed = Gesture.Simultaneous(pan, pinch);

  const gridStroke = 1 / scale;

  const worldToScreen = (x: number, y: number) => {
    const scaleX = widthPx / vw;
    const scaleY = heightPx / vh;
    const uniform = Math.min(scaleX, scaleY);
    const offsetX = (widthPx - uniform * vw) / 2;
    const offsetY = (heightPx - uniform * vh) / 2;
    const screenX = offsetX + (x - camX) * uniform;
    const screenY = offsetY + (y - camY) * uniform;
    return { screenX, screenY };
  };

  const getNodePriority = (node: string): number => {
    if (node?.includes("toilet")) return 3;
    if (node?.includes("staircase")) return 4;
    if (node?.startsWith("SN")) return 2;
    return 1;
  };

  const visibleNodes = useMemo((): VisibleNode[] => {
    const MARGIN = 50;
    const MIN_DISTANCE = 40;
    const ZOOM_THRESHOLD = 1.5;

    const candidates = adjustedNodePositions
      .map((n) => {
        const { screenX, screenY } = worldToScreen(n.x, n.y);
        const priority = getNodePriority(n.node || "");

        const baseIconSize = 20;
        const iconSize = Math.max(
          16,
          Math.min(32, baseIconSize * Math.sqrt(scale))
        );
        const fontSize = Math.max(10, Math.min(14, 11 * Math.sqrt(scale)));

        return {
          ...n,
          screenX,
          screenY,
          priority,
          iconSize,
          fontSize,
          showLabel: scale > ZOOM_THRESHOLD || priority > 2,
        };
      })
      .filter(
        (n) =>
          n.screenX >= -MARGIN &&
          n.screenX <= widthPx + MARGIN &&
          n.screenY >= -MARGIN &&
          n.screenY <= heightPx + MARGIN
      )
      .sort((a, b) => b.priority - a.priority);

    const result: VisibleNode[] = [];

    for (const candidate of candidates) {
      let hasCollision = false;

      if (candidate.showLabel) {
        for (const placed of result) {
          if (placed.showLabel) {
            const dx = candidate.screenX - placed.screenX;
            const dy = candidate.screenY - placed.screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < MIN_DISTANCE) {
              hasCollision = true;
              break;
            }
          }
        }
      }

      result.push({
        ...candidate,
        showLabel: candidate.showLabel && !hasCollision,
      });
    }

    return result;
  }, [adjustedNodePositions, camX, camY, scale, widthPx, heightPx]);

  const floorLabels = useMemo(() => {
    return floors.map((floor) => {
      const originalBounds = floorBounds.get(floor)!;
      const midYOriginal = (originalBounds.minY + originalBounds.maxY) / 2;
      const adjustedY = midYOriginal + floorOffsets.get(floor)!;
      return { floor, x: initialMinX + labelMargin / 2, y: adjustedY };
    });
  }, [floors, floorBounds, floorOffsets, initialMinX, labelMargin]);

  const visibleFloorLabels = useMemo((): FloorLabel[] => {
    const MARGIN = 50;
    return floorLabels
      .map((label) => {
        const { screenX, screenY } = worldToScreen(label.x, label.y);
        const fontSize = Math.max(12, Math.min(24, 16 * Math.sqrt(scale)));
        return { ...label, screenX, screenY, fontSize };
      })
      .filter(
        (label) =>
          label.screenX >= -MARGIN &&
          label.screenX <= widthPx + MARGIN &&
          label.screenY >= -MARGIN &&
          label.screenY <= heightPx + MARGIN
      );
  }, [floorLabels, camX, camY, scale, widthPx, heightPx]);

  const floorBorders = useMemo(() => {
    return floors.map((floor) => {
      const bounds = floorBounds.get(floor)!;
      const offsetY = floorOffsets.get(floor) || 0;
      return {
        floor,
        x: bounds.minX,
        y: bounds.minY + offsetY,
        width: bounds.maxX - bounds.minX,
        height: bounds.maxY - bounds.minY,
      };
    });
  }, [floors, floorBounds, floorOffsets]);

  function buildRouteCoords(
    route: Route,
    adjustedPositionsMap: Map<string, { x: number; y: number }>
  ): { x: number; y: number }[] {
    const coords: { x: number; y: number }[] = [];
    const startPos = adjustedPositionsMap.get(route.start);
    if (!startPos) return coords;

    let currentX = startPos.x;
    let currentY = startPos.y;
    coords.push({ x: currentX, y: currentY });

    for (const edge of route.edges) {
      for (const step of edge.path) {
        const angleDeg = SVG_ANGLE_MAP[step.dir];
        const angleRad = (angleDeg * Math.PI) / 180;

        const dx = step.distance * CM_SCALE * Math.cos(angleRad);
        const dy = step.distance * CM_SCALE * Math.sin(angleRad);

        currentX += dx;
        currentY += dy;

        coords.push({ x: currentX, y: currentY });
      }

      const targetPos = adjustedPositionsMap.get(edge.to);
      if (targetPos) {
        currentX = targetPos.x;
        currentY = targetPos.y;
        if (edge.path.length > 0) {
          coords[coords.length - 1].x = currentX;
          coords[coords.length - 1].y = currentY;
        } else {
          coords.push({ x: currentX, y: currentY });
        }
      }
    }

    return coords;
  }

  const routeCoords = useMemo(() => {
    if (!route) return [];
    return buildRouteCoords(route, adjustedPositionsMap);
  }, [route, adjustedPositionsMap]);

  return {
    routeCoords,
    composed,
    floorOffsets,
    getFloor,
    camX,
    camY,
    scale,
    vw,
    vh,
    BIG,
    gridStroke,
    visibleNodes,
    visibleFloorLabels,
    floorBorders,
    worldToScreen,
  };
};

export default useFloorCoords;
