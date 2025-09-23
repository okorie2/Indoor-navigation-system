# Senate Indoor Navigation — Data README

## What this file is

`senate_building.json` is the source of truth for the indoor navigation graph of the **Senate** building. It defines:

- every **navigable node** (entrances, hubs, corridors, rooms, lifts, stairs, toilets, etc.)
- every **edge** (walkable connection) between nodes
- **vertical connectors** (stairs/lifts) between floors

All metric values are placeholders right now (`x`, `y`, `distance`, `weight` = `0`). Please keep the structure; just fill in coordinates and distances.

---

## File structure (high-level)

```json
{
  "building": "Senate",
  "floors": {
    "F0": { "nodes": { ... }, "graph": { ... } },
    "F1": { "nodes": { ... }, "graph": { ... } },
    "F2": { "nodes": { ... }, "graph": { ... } },
    "F3": { "nodes": { ... }, "graph": { ... } },
    "F4": { "nodes": { ... }, "graph": { ... } }
  }
}
```

### Nodes

Each node is a POI or junction:

```json
"Some_Node_Id": { "x": 0, "y": 0, "floor": "F#", "building": "Senate" }
```

- `x`,`y`: map coordinates in your chosen floor coordinate system (fill these in)
- `floor`: one of `F0`…`F4`
- `building`: `"Senate"` (constant)

### Graph (edges)

Each key in `graph` is a **source node id** with an array of **outgoing edges**:

```json
"sourceNodeId": [
  {
    "to": "targetNodeId",
    "weight": 0,
    "path": [
      { "dir": "north|south|east|west|up|down", "distance": 0 }
    ]
  }
]
```

- `to`: the target node id
- `weight`: placeholder for routing weight (keep `0` for now; we’ll derive from distance or access rules later)
- `path`: optional sequence of segments to describe simple turn-by-turn from source → target

  - `dir`: compass direction on the floor (`north/south/east/west`) or vertical (`up/down`)
  - `distance`: segment length (set now to `0`; fill later if you like)

> **Bidirectionality**: If a connection is two-way, you’ll see **reciprocal edges** (A→B and B→A). If a connection is one-way/restricted, **omit** the reciprocal.

---

## Naming & layout conventions (what the ids mean)

### Spines (central north–south hallway)

- `spine_S` → south segment
- `spine_C` → central segment (near reception/foyer)
- `spine_N` → north segment
  These act as the **main north–south backbone** per floor. Moving **up** the drawing from the south entrance means **north**.

### Corridors (east–west)

- `eastCorridor` → the principal corridor on the **east** wing
- `westCorridor` → the principal corridor on the **west** wing

Rooms and facilities are connected to whichever corridor they front.

### Entrances / ends

- Ground floor physical entrances: `southEntrance`, `northEntrance`
- Upper floors use `southEntrance_F#` / `northEntrance_F#` as **north/south ends of the spine** (not street doors).
  These help routing language stay consistent (e.g., “walk north to the north end”).

### Vertical connectors

- Lifts: `lift_F#_North`, `lift_F#_West`
- Stairs: `staircase_F#_east`, `staircase_F#_west`
  Each lift/stair node on a floor **links to the same stack** on the floor above/below via `dir: "up"`/`"down"`.

### Facilities

- Toilets: `Toilets_F#`
- Catering: `Catering_Servery_Space_F#`
- Terraces: `External_Terrace_F#`
- Admin/teaching/workspace: `Facilities_Back_of_House_F#`, `General_Teaching_F#`, `Academic_Workspace_F#`, `Office_of_the_Vice_Chancellor_F#`
- Meeting/Collab (upper floors): `Meeting_Rooms_F#`, `Collaboration_Circulation_F#`, `Void_F#` (void is a POI, usually not navigable)

### Rooms

- Ground: `SN001_Bloomberg_Finance_Lab`, `SN002`, `SN003`
- F1: `SN101`…`SN110`
- F2: `SN201`…`SN215`
- F3: `SN301`…`SN315`
- F4: `SN401`…`SN407`

> Convention: `SNxYY` lives on floor `Fx` (e.g., `SN207` is on `F2`).

---

## What’s already modeled per floor (summary)

- **F0**: true **south** and **north** entrances; reception by `spine_C`; east & west corridors; lifts (North/West); stairs (east/west); catering, toilets, Bloomberg Lab, admin spaces, plant/BOH/emergency exit.
- **F1–F4**: same backbone (spine & corridors). Upper-floor “entrances” are **north/south ends** for orientation. Each floor has toilets, catering servery **space** (not the full servery), research/teaching/admin/terrace as labeled.
- **Vertical stacks** are consistent and fully linked:

  - North lift: F0 ⇄ F1 ⇄ F2 ⇄ F3 ⇄ F4
  - West lift: F0 ⇄ F1 ⇄ F2 ⇄ F3 ⇄ F4 (F4 only down)
  - East & West stairs connect adjacent floors.

All edges are present with `path.dir` set to the correct **compass directions** (or `up/down` for vertical).

---

## What you (building team) need to fill in

1. **Coordinates (`x`,`y`)** for every node

   - Use a consistent floor coordinate system (e.g., top-left origin in px or meters).
   - Same vertical stack should share the _same_ `x,y` across floors, if floors align.

2. **Edge lengths (`distance`)** inside each `path` segment

   - Use meters if possible. If multiple segments are needed (e.g., “north 8m, east 3m”), split them into multiple `path` entries.

3. **Weights**

   - If you keep weights proportional to total `distance`, set `weight = distance`.
   - Or keep all `weight = 1` to represent unit cost per edge and let the router prefer fewer hops.

4. **Access rules**

   - For restricted/one-way doors (e.g., terraces, emergency exits), **remove** the reciprocal edge to make it one-way.
   - For staff-only areas, either remove the edge or set a high `weight` as a soft deterrent.

---

## Quick examples

### A corridor→room edge with real metrics

```json
"eastCorridor": [
  {
    "to": "SN205",
    "weight": 11.0,
    "path": [
      { "dir": "east", "distance": 9.0 },
      { "dir": "south", "distance": 2.0 }
    ]
  }
]
```

### A two-way connection (remember to add both)

```json
"SN205": [
  { "to": "eastCorridor", "weight": 11.0, "path": [ { "dir": "west", "distance": 9.0 }, { "dir": "north", "distance": 2.0 } ] }
]
```

### A vertical link (stairs up/down)

```json
"staircase_F2_east": [
  { "to": "staircase_F3_east", "weight": 1, "path": [ { "dir": "up", "distance": 1 } ] },
  { "to": "eastCorridor", "weight": 3, "path": [ { "dir": "west", "distance": 3 } ] },
  { "to": "staircase_F1_east", "weight": 1, "path": [ { "dir": "down", "distance": 1 } ] }
]
```

---

## Validation checklist (use this when you edit)

- [ ] Every node has `x`, `y`, `floor`, `building`.
- [ ] Each **two-way** corridor connection has a **reciprocal** edge.
- [ ] Every **lift/stair** on `F#` connects to the same stack on `F#±1`.
- [ ] All `SNxYY` are attached to the correct corridor (east or west) for that floor.
- [ ] Distances are in a consistent unit (recommend meters).
- [ ] Any restricted or one-way doors (terraces, emergency exits) have only the permitted direction modeled.
- [ ] No dangling node ids (every `to` exists in `nodes` on that floor).
- [ ] Naming stays consistent: `…_F#` suffix for floor-scoped spaces; `SNxYY` for rooms.

---

## Open questions for the building team (please annotate on the PDFs or reply with lists)

### Ground → F4 general

- Are **any doors one-way** (e.g., to terraces or emergency exits)? If yes, list them so we remove the reciprocal edges.
- Do **any corridors** jog around obstacles enough to justify breaking `path` into multiple segments (e.g., north then east)? If yes, note typical segment lengths so we can encode accurate turn-by-turn.

### F1

- If some `SN10x` rooms are actually on the **west** wing, tell us which ones to reattach to `westCorridor`.
- If `External_Terrace_F1` or any door is restricted/one-way, confirm direction.
- If there’s **no foyer** on F1, we can remove `Reception_F1` and keep `spine_C ↔ eastCorridor`.

### F2

- `SN201–SN215` are currently on **eastCorridor**. Which ones (if any) belong to **westCorridor**?
- Are any doors (e.g., `External_Terrace_F2`) restricted/one-way?
- Confirm any long dog-legs so we split `path` into multiple segments.

### F3

- `SN301–SN315` are attached to **eastCorridor** by default. Which should move to **westCorridor**?
- Are `External_Terrace_F3`, `Collaboration_Circulation_F3`, or `Void_F3` access-controlled?

  - If `Void_F3` is purely visual, we can keep it as a non-connected POI or drop it.

- Any one-way circulation we should encode?

### F4

- `SN401–SN407` are on **eastCorridor** now. Which (if any) belong to **westCorridor**?
- Is `External_Terrace_F4` one-way or time-restricted?
- Any staff-only rooms we should either disconnect or mark with high `weight`?

---

## Implementation notes

- **Coordinates:** If you’re exporting from CAD or a floor-plan tool, it’s easiest to pick the **same origin** and **scale** for all floors (e.g., building grid origin), so vertical stacks line up perfectly.
- **Distances & weights:**

  - Simple approach: set `distance = straight-line` and `weight = distance`.
  - Advanced: model accurate turns via multiple `path` segments and optionally add small turn penalties to `weight`.

- **Searchability:** Room numbers and official names are the node ids. If a space is known by multiple names, we can add an alias map later.

---

## TL;DR for editors

1. Keep the JSON shape exactly as-is.
2. Fill **`x,y`** for every node (same units across the board).
3. Fill **`distance`** per edge path (split into multiple segments where helpful).
4. Set **`weight`** (either equal to total distance or simple `1`s).
5. Tell us about **one-way/restricted** doors and any rooms that belong to the **other** corridor wing.
