import json
from fastapi import FastAPI
from pathfinder import a_star
from pathfinderWithEdges import a_star as a_star_with_edges
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Load the retrofitted JSON
BASE_DIR = Path(__file__).resolve().parent
with open(BASE_DIR / "static" / "senate.json") as f:
    data = json.load(f)

app = FastAPI()

# Mount the "static" directory
app.mount("/static", StaticFiles(directory="static"), name="static")

graph = data["graph"]


@app.get("/")
def read_root():
    return {"msg": "Hello from FastAPI"}


@app.get("/hello/{name}")
def read_item(name: str):
    return {"msg": f"Hello, {name}!"}


@app.get("/pathfinding")
def get_path(start: str, end: str):
    path = a_star(graph, start, end)
    if path:
        return {"path": path}
    else:
        return {"error": "No path found"}


@app.get("/pathfindingWithEdges")
def get_path_with_edges(start: str, end: str):
    path = a_star_with_edges(graph, start, end)
    if path:
        return {"path": path, "message": "Path found successfully"}
    else:
        return {"path": None, "message": "No path found"}


@app.get("/searchNodes")
def search_nodes(query: str):
    matches = [
        node
        for node in data["graph"]
        if query.lower() in node.lower()  # like JS includes
    ]

    if matches:
        print(f"Matches for '{query}': {matches}")
        return {"nodes": matches}
    return {"message": "Location not found"}
