import { Connection, FloorPlanData } from "./_types";

// Sample destinations - in a real app, this would come from your API/database
export const SAMPLE_DESTINATIONS = [
  { id: "1", name: "Senate Room 401", category: "Meeting Room" },
  { id: "2", name: "Senate Room 402", category: "Meeting Room" },
  { id: "3", name: "Senate Room 403", category: "Meeting Room" },
  { id: "4", name: "Library", category: "Public Space" },
  { id: "5", name: "Library - Study Room A", category: "Study Room" },
  { id: "6", name: "Library - Study Room B", category: "Study Room" },
  { id: "7", name: "Cafeteria", category: "Dining" },
  { id: "8", name: "Cafeteria - Main Hall", category: "Dining" },
  { id: "9", name: "Reception", category: "Public Space" },
  { id: "10", name: "Conference Room A", category: "Meeting Room" },
  { id: "11", name: "Conference Room B", category: "Meeting Room" },
  { id: "12", name: "Auditorium", category: "Public Space" },
  { id: "13", name: "Restroom - Floor 1", category: "Facilities" },
  { id: "14", name: "Restroom - Floor 2", category: "Facilities" },
  { id: "15", name: "Elevator Bank A", category: "Navigation" },
  { id: "16", name: "Emergency Exit", category: "Safety" },
];

export const floorPlanData: FloorPlanData = {
  SN211: [
    {
      to: "passage_F2_east",
      weight: 1,
      path: [{ dir: "north", distance: 11.5 }],
    },
    {
      to: "passage_F2_west",
      weight: 2,
      path: [
        { dir: "west", distance: 7.14 },
        { dir: "north", distance: 10.29 },
      ],
    },
  ],
  SN212: [
    {
      to: "passage_F2_east",
      weight: 2,
      path: [
        { dir: "east", distance: 7.17 },
        { dir: "north", distance: 10.83 },
      ],
    },
    {
      to: "passage_F2_west",
      weight: 1,
      path: [{ dir: "north", distance: 10.95 }],
    },
  ],
  SN213: [
    {
      to: "passage_F2_east",
      weight: 2,
      path: [
        { dir: "north", distance: 7.56 },
        { dir: "west", distance: 10.83 },
      ],
    },
    {
      to: "passage_F2_west",
      weight: 1,
      path: [{ dir: "west", distance: 10.08 }],
    },
  ],
  SN214: [
    {
      to: "passage_F2_east",
      weight: 2,
      path: [
        { dir: "east", distance: 4.29 },
        { dir: "north", distance: 7.56 },
        { dir: "west", distance: 10.83 },
      ],
    },
    {
      to: "passage_F2_west",
      weight: 1,
      path: [{ dir: "west", distance: 6.24 }],
    },
  ],
  SN215: [
    {
      to: "passage_F2_east",
      weight: 2,
      path: [
        { dir: "east", distance: 5.37 },
        { dir: "north", distance: 7.56 },
        { dir: "west", distance: 10.83 },
      ],
    },
    {
      to: "passage_F2_west",
      weight: 1,
      path: [{ dir: "west", distance: 5.25 }],
    },
  ],
  passage_F2_east: [
    {
      to: "SN211",
      weight: 1,
      path: [{ dir: "south", distance: 11.5 }],
    },
    {
      to: "SN212",
      weight: 2,
      path: [
        { dir: "south", distance: 10.83 },
        { dir: "west", distance: 7.17 },
      ],
    },
  ],
  passage_F2_west: [
    {
      to: "SN213",
      weight: 1,
      path: [{ dir: "east", distance: 10.08 }],
    },
    {
      to: "SN214",
      weight: 1,
      path: [{ dir: "east", distance: 6.24 }],
    },
    {
      to: "staircase_F2_west",
      weight: 1,
      path: [{ dir: "south", distance: 1.0 }],
    },
  ],
  staircase_F2_west: [
    {
      to: "passage_F2_west",
      weight: 1,
      path: [{ dir: "north", distance: 1.0 }],
    },
  ],
};

export const pathToFollow: Connection[] = [
  {
    to: "passage_F2_west",
    weight: 2,
    path: [
      {
        dir: "west",
        distance: 7.14,
      },
      {
        dir: "north",
        distance: 10.29,
      },
    ],
  },
  {
    to: "lift_F2_West",
    weight: 1,
    path: [
      {
        dir: "east",
        distance: 1,
      },
    ],
  },
  {
    to: "lift_F4_West",
    weight: 1,
    path: [
      {
        dir: "north",
        distance: 1,
      },
    ],
  },
  {
    to: "passage_F4_west",
    weight: 1,
    path: [
      {
        dir: "west",
        distance: 1.5,
      },
    ],
  },
  {
    to: "office of the vc",
    weight: 1,
    path: [
      {
        dir: "north",
        distance: 2.73,
      },
    ],
  },
];
