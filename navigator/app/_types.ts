export interface PathStep {
  dir: "north" | "south" | "east" | "west";
  distance: number;
}

export interface Connection {
  to: string;
  weight: number;
  path: PathStep[];
}

export interface UserRoute {
  start: string;
  edges: Connection[];
}

export interface FloorPlanData {
  [key: string]: Connection[];
}

export interface Travelling {
  meters: number;
  turn: string;
}

export interface Position {
  x: number;
  y: number;
  node?: string;
}

export interface PathCoordinate extends Position {
  node?: string;
  direction?: string;
  distance?: number;
}

export interface GeneratedPath {
  id: string;
  from: string;
  to: string;
  weight: number;
  coordinates: PathCoordinate[];
  isUserPath: boolean;
  stepIndex?: number;
}
