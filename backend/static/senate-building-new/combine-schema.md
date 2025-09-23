Single master file

One senate_building.json with:

```json
{
  "building": "Senate",
  "floors": {
    "F0": { "nodes": {...}, "graph": {...} },
    "F1": { "nodes": {...}, "graph": {...} },
    ...
  }
}

```

Notes for F1

If some SN10x rooms are actually on the west side, tell me which ones and I’ll switch their edges to westCorridor.

If External_Terrace or any door is one-way or restricted, I’ll mark those edges accordingly.

If there’s no F1 foyer, we can remove Reception_F1 and leave spine_C ↔ eastCorridor.

---

Notes for F2

Tiny notes (only if you want to refine later)

I attached SN201–SN215 to eastCorridor by default. If the plan places some on the west wing, tell me which ones and I’ll switch their edges to westCorridor.

senate-second-floor-annotated-r…

If any door (e.g., External_Terrace_F2) is restricted/one-way, we can mark its edge as one-way by removing the reciprocal.

All placeholders are set (x, y, weight, distance = 0). This should drop cleanly into your "floors" object.

---

Notes for F3
Tiny notes you can confirm (I’ll tweak if needed)

I attached SN301–SN315 to eastCorridor by default. If some are on the west wing, tell me which ones to flip to westCorridor.

senate-third-floor-annotated-ro…

If External_Terrace_F3 or any door is restricted/one-way, we can make those edges one-way by removing the reciprocal.

senate-third-floor-annotated-ro…

Void_F3 and Collaboration_Circulation_F3 are included as POI nodes for completeness; we can leave them unconnected or connect them to the most sensible corridor depending on how you want them to appear in search.

---

Notes for F4

I attached SN401–SN407 to eastCorridor by default. If any are actually in the west wing on the plan, tell me which to swap to westCorridor.

senate-fourth-floor-annotated-r…

If External_Terrace_F4 or any door is restricted/one-way, we can make that edge one-way by removing the reciprocal.

senate-fourth-floor-annotated-r…
