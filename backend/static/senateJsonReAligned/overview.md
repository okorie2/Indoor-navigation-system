# 🏢 Senate Building Navigation System

This JSON file contains a complete indoor navigation map for the Senate building with 5 floors (F0, F1, F2, F3, F4). It's designed for an indoor navigation application that helps people find their way around the building.

📍 What the Data Contains:

1. Location Points (Nodes) - 132 total

Physical locations like entrances, rooms, corridors, toilets, lifts, and staircases
Each node has coordinates (x, y), floor number, and building name
Examples:
northEntrance (main building entrance)
SN001_Bloomberg_Finance_Lab (specific room)
lift_F0_North (elevator location)
staircase_F2_west (stairwell)
Catering_Servery_Space_F1 (cafeteria area) 2. Navigation Connections (Graph) - 134 entries

How to get from one point to another
Each connection includes:
Destination ("to")
Difficulty/cost ("weight" - usually 0 for direct connections)
Turn-by-turn directions ("path" with direction and distance)
🏗️ Building Layout:
Floor Distribution:

F0 (Ground): 16 locations (entrances, reception, basic facilities)
F1: 27 locations (offices, meeting rooms, research spaces)
F2: 28 locations (academic workspaces, research labs)
F3: 33 locations (meeting rooms, collaboration spaces, offices)
F4 (Top): 28 locations (various academic and administrative spaces)
🚶 Navigation Features:
Horizontal Movement:

Corridors connect rooms within each floor
Spine corridors (North, Central, South) run the length of the building
East/West corridors provide cross-building access
Vertical Movement:

Lifts (elevators) connect all floors up/down
Staircases (East and West sides) provide alternative vertical access
Example: lift_F0_North connects to lift_F1_North with "dir": "up"
Room Access:

Direct connections from corridors to specific rooms
Facility access (toilets, catering areas, emergency exits)
🎯 How the Navigation Works:
When someone wants to go from Point A to Point B:

Find the starting node (current location)
Find the destination node (where they want to go)
Calculate the optimal path using the graph connections
Provide turn-by-turn directions using the path data
Example Path:

From southEntrance → go north → reach spine_S corridor
From lift_F0_North → go up → reach lift_F1_North on next floor
📊 Data Structure Purpose:
This is essentially a graph database for indoor navigation, similar to how Google Maps works for outdoor navigation, but designed specifically for building interiors with multiple floors, corridors, and vertical transportation systems.

The system can answer questions like:

"How do I get from the north entrance to room SN201?"
"What's the fastest way to the catering area on F1?"
"Show me the route from the reception to the Bloomberg Finance Lab"
The data supports both pedestrian navigation (walking directions) and accessibility features (lift vs stairs options).

## OpenAi Smart Seeaching umplemntation

```js
// ...existing code...

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store your API key securely in environment variables
});

// Function to process user query with NLP
async function processNavigationQuery(userQuery, navigationData) {
  try {
    const prompt = `
You are an indoor navigation assistant for the Senate building. Use the following data to understand and respond to user queries about navigation.

Building Data: ${JSON.stringify(navigationData)}

User Query: "${userQuery}"

Extract the following if present:
- Start location
- Destination location
- Any preferences (e.g., stairs vs lift, accessibility)

Provide a response that includes:
1. Interpreted intent
2. Suggested route if applicable
3. Any clarifications needed
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or 'gpt-4' for better accuracy
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3,
    });

    const aiResponse = response.choices[0].message.content;
    return aiResponse;
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "Sorry, I couldn't process your query right now.";
  }
}

// Example usage in an Express route
app.post("/api/navigation/query", async (req, res) => {
  const { query } = req.body;
  const navigationData = require("../static/senate.json"); // Load your navigation data

  const result = await processNavigationQuery(query, navigationData);
  res.json({ response: result });
});

// ...existing code...
```
