module.exports = calculateSummary;

function calculateSummary(tree) {
  var totalTime = 0;
  var nodes = [];
  var groupedNodes = [];
  var nodesGroupedByName = {};

  // calculate times
  tree.visitPostOrder(function (node) {
    var nonbroccoliChildrenTime = node.children.reduce(function (acc, childNode) {
      // subsume non-broccoli nodes as their ancestor broccoli nodes'
      // broccoliSelfTime
      if (childNode.id.broccoliNode) {
        return acc;
      } else {
        return acc + childNode._slowTrees.broccoliSelfTime;
      }
    }, 0);
    var time = nonbroccoliChildrenTime + node.stats.time.self;

    node._slowTrees = { broccoliSelfTime: time };
    totalTime += node.stats.time.self;

    if (node.id.broccoliNode) {
      nodes.push({
        name: node.id.name,
        selfTime: time,
      });

      if (!nodesGroupedByName[node.id.name]) {
        nodesGroupedByName[node.id.name] = {
          name: node.id.name,
          count: 0,
          averageSelfTime: 0,
          totalSelfTime: 0,
        };
        groupedNodes.push(nodesGroupedByName[node.id.name]);
      }

      var group = nodesGroupedByName[node.id.name];
      group.count++;
      group.totalSelfTime += time;
      group.averageSelfTime = group.totalSelfTime / group.count;
    }
  });

  // sort nodes
  nodes = nodes.sort(function (a, b) {
    return b.selfTime - a.selfTime;
  });

  // sort grouped nodes
  groupedNodes = groupedNodes.sort(function (a, b) {
    return b.totalSelfTime - a.totalSelfTime;
  });

  // normalize times (nanosec to ms)
  nodes.forEach(function (n) {
    n.selfTime = n.selfTime / 1e6;
  });

  // normalize times (nanosec to ms)
  groupedNodes.forEach(function (n) {
    n.averageSelfTime = n.averageSelfTime / 1e6;
    n.totalSelfTime = n.totalSelfTime / 1e6;
  });

  // normalize times (nanosec to ms)
  totalTime = totalTime / 1e6;

  return {
    totalTime: totalTime,
    nodes: nodes,
    groupedNodes: groupedNodes,
  };
}
