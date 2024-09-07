
class Node {
  constructor(name) {
    this.name = name;
    this.neighbors = [];
  }

  addNeighbor(node, distance, fuelEfficiency, weather, speed) {
    this.neighbors.push({ node, distance, fuelEfficiency, weather, speed });
  }
}

class Graph {
  constructor() {
    this.nodes = new Map();
  }

  addNode(name) {
    const node = new Node(name);
    this.nodes.set(name, node);
  }

  addEdge(node1Name, node2Name, distance, fuelEfficiency, weather, speed) {
    const node1 = this.nodes.get(node1Name);
    const node2 = this.nodes.get(node2Name);
    node1.addNeighbor(node2, distance, fuelEfficiency, weather, speed);
    node2.addNeighbor(node1, distance, fuelEfficiency, weather, speed); 
  }

  getNode(name) {
    return this.nodes.get(name);
  }
}

class AStar {
  constructor(graph) {
    this.graph = graph;
  }

  heuristic(node1, node2, weather) {
    const baseHeuristic = Math.abs(node1.name.charCodeAt(0) - node2.name.charCodeAt(0));

    switch (weather) {
      case "good":
        return baseHeuristic * 0.8;
      case "moderate":
        return baseHeuristic;
      case "bad":
        return baseHeuristic * 3.5;
      default:
        return baseHeuristic;
    }
  }

  findPath(startName, endName, totalFuel) {
    const startNode = this.graph.getNode(startName);
    const endNode = this.graph.getNode(endName);

    const openSet = new Set([startNode]);
    const cameFrom = new Map();

    const gScore = new Map(); // distance
    const fuelScore = new Map(); // fuel used
    const fScore = new Map(); // A* score
    const timeScore = new Map(); // time 

    this.graph.nodes.forEach((_, nodeName) => {
      gScore.set(nodeName, Infinity);
      fuelScore.set(nodeName, Infinity);
      fScore.set(nodeName, Infinity);
      timeScore.set(nodeName, Infinity);
    });

    gScore.set(startNode.name, 0);
    fuelScore.set(startNode.name, 0); 
    timeScore.set(startNode.name, 0);
    fScore.set(startNode.name, this.heuristic(startNode, endNode, "moderate"));

    while (openSet.size > 0) {
      let current = [...openSet].reduce((a, b) =>
        fScore.get(a.name) < fScore.get(b.name) ? a : b
      );

      if (current === endNode) {
        return {
          path: this.reconstructPath(cameFrom, current),
          totalTime: timeScore.get(current.name)
        };
      }

      openSet.delete(current);

      for (let { node: neighbor, distance, fuelEfficiency, weather, speed } of current.neighbors) {
        let tentative_gScore = gScore.get(current.name) + distance;
        let fuelUsed = distance / fuelEfficiency;

        if (fuelUsed > totalFuel) {
          continue; 
        }

        let initialTime = distance / speed; 
        switch (weather) {
          case "good":
            tentative_gScore *= 0.8;
            initialTime *= 0.8;
            break;
          case "bad":
            tentative_gScore *= 3.5;
            initialTime *= 1.5; 
            break;
          case "moderate":
            break;
        }

        if (tentative_gScore < gScore.get(neighbor.name)) {
          cameFrom.set(neighbor.name, current);
          gScore.set(neighbor.name, tentative_gScore);
          fuelScore.set(neighbor.name, fuelUsed);
          timeScore.set(neighbor.name, timeScore.get(current.name) + initialTime); // Add to total time
          fScore.set(
            neighbor.name,
            tentative_gScore + this.heuristic(neighbor, endNode, weather)
          );
          if (!openSet.has(neighbor)) {
            openSet.add(neighbor);
          }
        }
      }
    }

    return "Path not found or fuel not enough!";
  }

  reconstructPath(cameFrom, current) {
    const totalPath = [current.name];
    while (cameFrom.has(current.name)) {
      current = cameFrom.get(current.name);
      totalPath.unshift(current.name);
    }
    return totalPath;
  }
}

const graph = new Graph();
['A', 'B', 'C', 'D', 'E'].forEach(node => graph.addNode(node));


graph.addEdge('A', 'B', 800, 15, "bad", 10);  // 800 km, 15 km/l fuel, good weather, Average speed = 50 km/h
graph.addEdge('A', 'C', 200, 18, "moderate", 60);
graph.addEdge('B', 'D', 150, 10, "bad", 40);
graph.addEdge('C', 'D', 100, 20, "good", 55);
graph.addEdge('D', 'E', 507, 12, "moderate", 50);
graph.addEdge('B', 'E', 300, 14, "bad", 45);

const aStar = new AStar(graph);

let totalFuel = 20; 

// find the path with fuel, speed, and weather conditions
let { path: initialPath, totalTime } = aStar.findPath('B', 'D', totalFuel);
console.log("Initial Path considering fuel, speed, and weather:", initialPath);
console.log("Total Estimated Time in hours:",  Math.floor(totalTime));


graph.addEdge('B', 'A', 200, 12, "good", 20);

let { path: updatedPath, totalTime: updatedTime } = aStar.findPath('B', 'D', totalFuel);
console.log("Updated Path considering fuel, speed, and weather:", updatedPath);
console.log("Updated Total Estimated Time of Arraival in hours:", Math.floor(updatedTime));
