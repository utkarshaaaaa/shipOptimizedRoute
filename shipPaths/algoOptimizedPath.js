// class Node {
//     constructor(name) {
//       this.name = name;
//       this.neighbors = [];
//     }
  
//     addNeighbor(node, cost) {
//       this.neighbors.push({ node, cost });
//     }
//   }
  
//   class Graph {
//     constructor() {
//       this.nodes = new Map();
//     }
  
//     addNode(name) {
//       const node = new Node(name);
//       this.nodes.set(name, node);
//     }
  
//     addEdge(node1Name, node2Name, cost) {
//       const node1 = this.nodes.get(node1Name);
//       const node2 = this.nodes.get(node2Name);
//       node1.addNeighbor(node2, cost);
//       node2.addNeighbor(node1, cost);
//     }
  
//     getNode(name) {
//       return this.nodes.get(name);
//     }
//   }
  
//   class AStar {
//     constructor(graph) {
//       this.graph = graph;
//     }
  
//     heuristic(node1, node2) {
//       return Math.abs(node1.name.charCodeAt(0) - node2.name.charCodeAt(0));
//     }
  
//     findPath(startName, endName) {
//       const startNode = this.graph.getNode(startName);
//       const endNode = this.graph.getNode(endName);
  
//       const openSet = new Set([startNode]);
//       const cameFrom = new Map();
  
//       const gScore = new Map();
//       const fScore = new Map();
  
//       this.graph.nodes.forEach((_, nodeName) => {
//         gScore.set(nodeName, Infinity);
//         fScore.set(nodeName, Infinity);
//       });
  
//       gScore.set(startNode.name, 0);
//       fScore.set(startNode.name, this.heuristic(startNode, endNode));
  
//       while (openSet.size > 0) {
//         let current = [...openSet].reduce((a, b) =>
//           fScore.get(a.name) < fScore.get(b.name) ? a : b
//         );
  
//         if (current === endNode) {
//           return this.reconstructPath(cameFrom, current);
//         }
  
//         openSet.delete(current);
  
//         for (let { node: neighbor, cost } of current.neighbors) {
//           let tentative_gScore = gScore.get(current.name) + cost;
  
//           if (tentative_gScore < gScore.get(neighbor.name)) {
//             cameFrom.set(neighbor.name, current);
//             gScore.set(neighbor.name, tentative_gScore);
//             fScore.set(
//               neighbor.name,
//               tentative_gScore + this.heuristic(neighbor, endNode)
//             );
//             if (!openSet.has(neighbor)) {
//               openSet.add(neighbor);
//             }
//           }
//         }
//       }
  
//       return "Path not found!";
//     }
  
//     reconstructPath(cameFrom, current) {
//       const totalPath = [current.name];
//       while (cameFrom.has(current.name)) {
//         current = cameFrom.get(current.name);
//         totalPath.unshift(current.name);
//       }
//       return totalPath;
//     }
//   }
  
//   const graph = new Graph();
//   ["A", "B", "C", "D", "E"].forEach((node) => graph.addNode(node));
  
//   graph.addEdge("A", "B", 800);
//   graph.addEdge("A", "C", 200);
//   graph.addEdge("B", "D", 150);
//   graph.addEdge("C", "D", 100);
//   graph.addEdge("D", "E", 507);
//   graph.addEdge("B", "E", 300);
  
//   const aStar = new AStar(graph);
//   let initialPath = aStar.findPath("A", "E");
//   console.log("Initial Path:", initialPath);
  
//   graph.addEdge("A", "B", 300);
//   graph.addEdge("B", "D", 180);
  
//   let updatedPath = aStar.findPath("A", "E");
//   console.log("Updated Path:", updatedPath);
  

class Node {
  constructor(name) {
    this.name = name;
    this.neighbors = [];
  }

  addNeighbor(node, distance, fuelEfficiency) {
    this.neighbors.push({ node, distance, fuelEfficiency });
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

  addEdge(node1Name, node2Name, distance, fuelEfficiency) {
    const node1 = this.nodes.get(node1Name);
    const node2 = this.nodes.get(node2Name);
    node1.addNeighbor(node2, distance, fuelEfficiency);
    node2.addNeighbor(node1, distance, fuelEfficiency); 
  }

  getNode(name) {
    return this.nodes.get(name);
  }
}

class AStar {
  constructor(graph) {
    this.graph = graph;
  }

  heuristic(node1, node2) {
    // Heuristic based on node names (you can use something more realistic)
    return Math.abs(node1.name.charCodeAt(0) - node2.name.charCodeAt(0));
  }

  findPath(startName, endName, totalFuel) {
    const startNode = this.graph.getNode(startName);
    const endNode = this.graph.getNode(endName);

    const openSet = new Set([startNode]);
    const cameFrom = new Map();

    const gScore = new Map(); // distance
    const fuelScore = new Map(); // fuel used
    const fScore = new Map(); // A* score

    this.graph.nodes.forEach((_, nodeName) => {
      gScore.set(nodeName, Infinity);
      fuelScore.set(nodeName, Infinity);
      fScore.set(nodeName, Infinity);
    });

    gScore.set(startNode.name, 0);
    fuelScore.set(startNode.name, 0); 
    fScore.set(startNode.name, this.heuristic(startNode, endNode));

    while (openSet.size > 0) {
      let current = [...openSet].reduce((a, b) =>
        fScore.get(a.name) < fScore.get(b.name) ? a : b
      );

      if (current === endNode) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.delete(current);

      for (let { node: neighbor, distance, fuelEfficiency } of current.neighbors) {
        let tentative_gScore = gScore.get(current.name) + distance;
        let fuelUsed = gScore.get(current.name) / fuelEfficiency;

        if (fuelUsed > totalFuel) {
      
          continue;
        }

        if (tentative_gScore < gScore.get(neighbor.name)) {
          cameFrom.set(neighbor.name, current);
          gScore.set(neighbor.name, tentative_gScore);
          fuelScore.set(neighbor.name, fuelUsed);
          fScore.set(
            neighbor.name,
            tentative_gScore + this.heuristic(neighbor, endNode)
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


graph.addEdge('A', 'B', 800, 15); // 800km, 15km/liter fuel efficiency
graph.addEdge('A', 'C', 200, 18);
graph.addEdge('B', 'D', 150, 10);
graph.addEdge('C', 'D', 100, 20);
graph.addEdge('D', 'E', 507, 12);
graph.addEdge('B', 'E', 300, 14);

const aStar = new AStar(graph);

// User input for total available fuel
//entered by user
let totalFuel = 70; 

let initialPath = aStar.findPath('A', 'E', totalFuel);
console.log("Initial Path considering fuel:", initialPath);

graph.addEdge('A', 'B', 300, 15); 


let updatedPath = aStar.findPath('A', 'E', totalFuel);
console.log("Updated Path considering fuel:", updatedPath);
