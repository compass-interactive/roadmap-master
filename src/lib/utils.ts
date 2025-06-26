import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jsPDF from "jspdf"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function buildTree(nodes, edges) {
  // Map nodeId to node
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  // Map nodeId to children
  const childrenMap = {};
  nodes.forEach(n => { childrenMap[n.id] = []; });
  edges.forEach(e => {
    if (e.source_node_id && e.target_node_id) {
      childrenMap[e.source_node_id].push(e.target_node_id);
    }
  });
  // Find root(s): nodes that are not a target in any edge
  const allTargets = new Set(edges.map(e => e.target_node_id));
  const roots = nodes.filter(n => !allTargets.has(n.id));
  // Recursively build tree
  function buildSubtree(nodeId) {
    return {
      node: nodeMap[nodeId],
      children: childrenMap[nodeId].map(buildSubtree)
    };
  }
  return roots.map(r => buildSubtree(r.id));
}

// Improved tree layout: returns width of subtree and assigns x/y positions
function layoutTreeProper(subtree, x, y, nodeWidth, nodeHeight, levelGap, nodeGap, positions) {
  if (!subtree.children || subtree.children.length === 0) {
    positions[subtree.node.id] = { x, y };
    return nodeWidth;
  }
  // Layout children first
  let childWidths = subtree.children.map(child =>
    layoutTreeProper(child, 0, y + nodeHeight + levelGap, nodeWidth, nodeHeight, levelGap, nodeGap, positions)
  );
  let totalWidth = childWidths.reduce((a, b) => a + b, 0) + nodeGap * (subtree.children.length - 1);
  // Position children
  let childX = x - totalWidth / 2;
  subtree.children.forEach((child, i) => {
    let cx = childX + childWidths[i] / 2;
    layoutTreeProper(child, cx, y + nodeHeight + levelGap, nodeWidth, nodeHeight, levelGap, nodeGap, positions);
    childX += childWidths[i] + nodeGap;
  });
  // Position parent centered above children
  positions[subtree.node.id] = { x, y };
  return Math.max(totalWidth, nodeWidth);
}

export function exportRoadmapToPDF({
  title,
  description,
  nodes,
  edges
}: {
  title: string;
  description?: string;
  nodes: Array<any>;
  edges: Array<any>;
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 40;
  doc.setFontSize(24);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 24;
  if (description) {
    doc.setFontSize(12);
    doc.text(doc.splitTextToSize(description, pageWidth - 80), pageWidth / 2, y, { align: 'center' });
    y += 24 + Math.ceil(description.length / 90) * 10;
  }
  // Tree layout params
  const nodeWidth = 160;
  const nodeHeight = 60;
  const levelGap = 80;
  const nodeGap = 40;
  // Build tree
  const trees = buildTree(nodes, edges);
  // Layout
  let positions = {};
  let totalTreeWidth = 0;
  let treeWidths = [];
  // First, measure total width needed
  trees.forEach(tree => {
    const w = layoutTreeProper(tree, 0, 0, nodeWidth, nodeHeight, levelGap, nodeGap, {});
    treeWidths.push(w);
    totalTreeWidth += w + nodeGap;
  });
  totalTreeWidth -= nodeGap;
  // Now, assign positions centered on page
  let startX = (pageWidth - totalTreeWidth) / 2 + nodeWidth / 2;
  trees.forEach((tree, i) => {
    layoutTreeProper(tree, startX + treeWidths[i] / 2 - nodeWidth / 2, y + 40, nodeWidth, nodeHeight, levelGap, nodeGap, positions);
    startX += treeWidths[i] + nodeGap;
  });
  // Draw nodes (boxes) first
  nodes.forEach(n => {
    const pos = positions[n.id];
    if (!pos) return;
    doc.setFillColor(n.bgcolor || '#ffffff');
    doc.setDrawColor(60, 60, 60);
    doc.roundedRect(pos.x, pos.y, nodeWidth, nodeHeight, 10, 10, 'FD');
    doc.setFontSize(14);
    doc.setTextColor(n.fontcolor || '#222222');
    doc.setFont(undefined, 'bold');
    const titleY = pos.y + 22;
    if (n.resource) {
      doc.textWithLink(n.title, pos.x + nodeWidth / 2, titleY, {
        url: n.resource,
        align: 'center'
      });
    } else {
      doc.text(n.title, pos.x + nodeWidth / 2, titleY, { align: 'center' });
    }
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80);
    const desc = n.description ? (n.description.length > 80 ? n.description.slice(0, 77) + '...' : n.description) : '';
    doc.text(doc.splitTextToSize(desc, nodeWidth - 20), pos.x + nodeWidth / 2, pos.y + 40, { align: 'center' });
  });
  // Draw edges (lines) after all positions are set
  edges.forEach(e => {
    const from = positions[e.source_node_id];
    const to = positions[e.target_node_id];
    if (from && to) {
      doc.setDrawColor(180);
      doc.setLineWidth(2);
      doc.line(
        from.x + nodeWidth / 2,
        from.y + nodeHeight,
        to.x + nodeWidth / 2,
        to.y
      );
    }
  });
  doc.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roadmap.pdf`);
}
