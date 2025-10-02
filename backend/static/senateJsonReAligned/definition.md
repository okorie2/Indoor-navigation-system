# Senate Building Indoor Navigation System - Data Handover

## Overview

This document explains the structure and naming conventions of the navigation data for the Senate building. The data is stored in `senate.json` and represents a graph-based indoor navigation system with 5 floors (F0 to F4). All `x`, `y` coordinates, `weights`, and `distances` are currently placeholders (set to 0) and must be replaced with actual measured values.

## Data Structure

- **Nodes**: Represent physical locations (rooms, corridors, entrances, etc.). Each node has:
  - `x, y`: Coordinates (replace with real positions, e.g., in meters from a building origin).
  - `floor`: Floor level (F0 = ground, F1-F4 = upper floors).
  - `building`: Always "Senate".
- **Graph**: Defines connections between nodes. Each entry lists:
  - `to`: Target node ID.
  - `weight`: Cost/difficulty (replace with real values, e.g., 1 for stairs, 0.5 for lifts, higher for longer distances).
  - `path`: Array of turn-by-turn directions (expand with multiple steps if needed).

## Node Naming Conventions

Nodes are grouped by type. Floor-specific nodes are suffixed with `_FX` (e.g., `_F1`).

### 1. Main Corridors (Spine)

- `spine_S`: South spine corridor (runs north-south, connects south entrances and corridors).
- `spine_C`: Central spine corridor (main north-south artery, connects east/west corridors).
- `spine_N`: North spine corridor (runs north-south, connects north entrances and lifts).
- **Purpose**: Primary hallways. Shared across floors but with floor-specific connections.

### 2. East/West Corridors

- `eastCorridor`: East wing corridor (connects east-side rooms and facilities).
- `westCorridor`: West wing corridor (connects west-side rooms and offices).
- **Purpose**: Branch off spine corridors; access most rooms.

### 3. Entrances

- `northEntrance`, `southEntrance`: Main building entrances (ground floor).
- `northEntrance_FX`, `southEntrance_FX`: Floor-specific entrances (e.g., from terraces or external areas).
- **Purpose**: Entry/exit points.

### 4. Vertical Transportation (Lifts and Stairs)

- `lift_FX_Y`: Lifts (elevators) – `FX` = floor, `Y` = position (North or West).
  - E.g., `lift_F0_North`: Ground floor north lift.
- `staircase_FX_Y`: Stairwells – `FX` = floor, `Y` = side (east or west).
  - E.g., `staircase_F2_east`: Floor 2 east stairs.
- **Purpose**: Connect floors up/down. Graph includes "up"/"down" directions.

### 5. Facilities and Amenities

- `Toilets_FX`: Restrooms.
- `Catering_Servery_Space_FX`: Cafeteria/dining areas.
- `Reception_FX`: Front desk areas.
- `emergencyExit`: Emergency exit (ground floor).

### 6. Rooms and Spaces

- `SNXXX`: Room numbers (e.g., `SN001_Bloomberg_Finance_Lab`: Specific named room; `SN101`: Generic room).
- `Research_Students_FX`, `Research_Enterprise_FX`: Research areas.
- `Academic_Workspace_FX`, `General_Teaching_FX`: Teaching/learning spaces.
- `Office_of_the_Vice_Chancellor_FX`: Administrative offices.
- `Meeting_Rooms_FX`, `Collaboration_Circulation_FX`: Meeting/collaboration areas.
- `External_Terrace_FX`: Outdoor balconies.
- `Facilities_Back_of_House_FX`: Back-of-house areas (maintenance).
- `Morley_Room`: Specific named room.
- `Void_FX`: Open spaces or atria.
- `plantRoom_SN005`, `foodPreparationArea`: Utility/service areas.

## Graph Connection Patterns

- **Horizontal**: Corridors connect to rooms (e.g., `eastCorridor` to `SN001` via "east" direction).
- **Vertical**: Lifts/stairs connect floors (e.g., `lift_F0_North` to `lift_F1_North` via "up").
- **Weights**: Currently 0; assign based on effort (e.g., stairs = 2, lifts = 0.5, long corridors = distance-based).
- **Paths**: Simple single-step directions; expand for complex routes (e.g., [{"dir": "north", "distance": 10}, {"dir": "east", "distance": 5}]).

## Handover Notes for Programmers

- **Replace Placeholders**: Use laser measuring tools or CAD drawings to get accurate x/y (e.g., Cartesian coordinates from building origin). Weights should reflect user preference (e.g., prioritize lifts over stairs).
- **Validation**: Ensure all "to" IDs exist in nodes. Test graph connectivity (no dead ends).
- **Extensions**: Add more path steps for detailed turn-by-turn (e.g., multiple turns).
- **Data Sources**: Coordinate with architects/facility managers for real measurements.

This structure supports pathfinding algorithms (e.g., Dijkstra) for navigation queries. If you need examples of real values or further clarification, provide specifics.
