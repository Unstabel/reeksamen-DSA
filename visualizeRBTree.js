import RBTree from "./RBTree.js";

// Initialize RBTree instance
const rbTree = new RBTree();

// Functions triggered by buttons
window.insertNode = function () {
  const val = parseInt(document.getElementById("value").value);
  if (!isNaN(val)) {
    rbTree.insert(val);
    updateTreeDisplay();
  }
};

window.deleteNode = function () {
  const val = parseInt(document.getElementById("deleteValue").value);
  if (!isNaN(val)) {
    rbTree.remove(val);
    updateTreeDisplay();
  }
};

// Convert tree nodes into hierarchical data for d3 visualization
function convertToHierarchy(node) {
  if (!node) return null;
  return {
    name: node.value,
    color: node.color,
    children: [convertToHierarchy(node.left), convertToHierarchy(node.right)].filter((c) => c !== null),
  };
}

function updateTreeDisplay() {
  const treeData = convertToHierarchy(rbTree.root);
  renderTree(treeData);
}

function renderTree(data) {
  const width = 600;
  const height = 400;

  let svg = d3.select("#tree").select("svg");
  if (svg.empty()) {
    svg = d3
      .select("#tree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(0,40)");

    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", height);

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#6FDCE3");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#5C88C4");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#5C2FC2");
  } else {
    svg = svg.select("g");
  }

  const root = d3.hierarchy(data);
  const treeLayout = d3.tree().size([width, height - 160]);
  treeLayout(root);

  // Links
  const links = svg.selectAll(".link").data(root.links(), (d) => `${d.source.data.name}-${d.target.data.name}`);

  links
    .enter()
    .append("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    )
    .attr("stroke", "url(#link-gradient)")
    .attr("stroke-opacity", 0)
    .transition()
    .duration(750)
    .attr("stroke-opacity", 1);

  links
    .transition()
    .duration(750)
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    );

  links.exit().transition().duration(750).attr("stroke-opacity", 0).remove();

  // Nodes
  const nodes = svg.selectAll(".node").data(root.descendants(), (d) => d.data.name);

  const nodeEnter = nodes
    .enter()
    .append("g")
    .attr("class", (d) => `node ${d.data.color.toLowerCase()}`)
    .attr("transform", (d) => `translate(${d.x},${d.y})`)
    .attr("opacity", 0);

  nodeEnter.append("circle").attr("r", 10);

  nodeEnter
    .append("text")
    .attr("dy", 3)
    .attr("x", (d) => (d.children ? -15 : 15))
    .style("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) => d.data.name);

  nodeEnter.transition().duration(500).attr("opacity", 1);

  const nodeUpdate = nodes.transition().duration(500).attr("transform", (d) => `translate(${d.x},${d.y})`);

  nodeUpdate.select("circle").attr("r", 10);

  nodeUpdate.attr("class", (d) => `node ${d.data.color.toLowerCase()}`);

  nodes.exit().transition().duration(500).attr("opacity", 0).remove();
}
