import json
import heapq
import math
from pathlib import Path

# Load the retrofitted JSON
BASE_DIR = Path(__file__).resolve().parent
with open(BASE_DIR / "static" / "senate.json") as f:
    data = json.load(f)

nodes = data["nodes"]


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
    g_score[start] = 0  # giving the start a goal score of 0

    f_score = {node: float("inf") for node in graph}
    f_score[start] = heuristic(start, goal)  # why?

    while open_set:
        _, current_node = heapq.heappop(open_set)

        if current_node == goal:
            # reconstruct path
            path = [current_node]
            while current_node in came_from:
                current_node = came_from[current_node]
                path.append(current_node)
            return path[::-1]

        # considering the edges of the current node
        for edge_details in graph.get(current_node, []):
            edge_name = edge_details["to"]
            edge_weight = edge_details["weight"]
            # on first iteration, g_score[current] is 0, so tentative_g is just the weight of the edge
            tentative_g = g_score[current_node] + edge_weight
            # comparing tentative_g with the current g_score of the neighbor. on first iteration, g_score[neighbor] is inf
            if tentative_g < g_score.get(edge_name, float("inf")):
                # print(current, "current")
                came_from[edge_name] = current_node
                g_score[edge_name] = tentative_g
                f_score[edge_name] = tentative_g + heuristic(edge_name, goal)
                heapq.heappush(open_set, (f_score[edge_name], edge_name))
                # print(came_from, "came_from")

    return None


print(a_star(data["graph"], "northEntrance", "office of the vc"))
