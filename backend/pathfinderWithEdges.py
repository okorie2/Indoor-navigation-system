import json
import heapq
import math
from pathlib import Path

# Load the retrofitted JSON
BASE_DIR = Path(__file__).resolve().parent
with open(BASE_DIR / "static" / "senate.json") as f:
    data = json.load(f)

nodes = data["nodes"]
graph = data["graph"]


def heuristic(node, goal):
    if node in nodes and goal in nodes:
        nx, ny = nodes[node]["x"], nodes[node]["y"]
        gx, gy = nodes[goal]["x"], nodes[goal]["y"]
        return math.sqrt((nx - gx) ** 2 + (ny - gy) ** 2)
    return 0


def a_star(graph, start, goal):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}

    g_score = {node: float("inf") for node in graph}
    g_score[start] = 0

    f_score = {node: float("inf") for node in graph}
    f_score[start] = heuristic(start, goal)

    while open_set:
        _, current_node = heapq.heappop(open_set)

        if current_node == goal:
            # reconstruct detailed path
            return reconstruct_path(came_from, start, goal, graph)

        for edge_details in graph.get(current_node, []):
            neighbor = edge_details["to"]
            weight = edge_details["weight"]

            tentative_g = g_score[current_node] + weight
            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current_node
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(open_set, (f_score[neighbor], neighbor))

    return None


def reconstruct_path(came_from, start, goal, graph):
    path = []
    current = goal
    while current in came_from:
        prev = came_from[current]

        # Find the edge details from prev -> current
        edge = next((edge for edge in graph[prev] if edge["to"] == current), None)
        if edge:
            path.append(edge)

        current = prev

    return path[::-1]  # reverse to get start -> goal order
