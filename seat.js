let selectedMatch = {};
try {
  selectedMatch = JSON.parse(localStorage.getItem("selectedMatch") || "{}");
} catch (error) {
  selectedMatch = {};
}

if (!selectedMatch._id) {
  alert("Match data missing.");
  window.location.href = "/home";
}

const stadium = document.getElementById("stadium");

let selectedPrice = null;
let selectedCount = 0;

const cx = 250;
const cy = 250;

const outerOuter = 240;
const outerInner = 177; // reduced gap between upper and lower blocks

const innerOuter = 175; // keep outer radius of lower block
const innerInner = 125; // move inner radius closer to center for taller lower blocks

const GAP = 2;
const LABEL_FONT_SIZE = 5;
const LABEL_LINE_GAP = 6.5;

// Ã¢Å“â€¦ ARC
async function loadSeatGroupsFromBackend() {
  try {
    const res = await fetch("https://bookmyshow-ipl.in/api/seat-groups");
    const data = await res.json();

    if (!data.success) return;

    const backendGroups = data.data;

    backendGroups.forEach(bg => {
      const localGroup = blockGroups.find(g => g.name === bg.name);

      if (localGroup) {
        localGroup.price = bg.price ?? localGroup.price;
        localGroup.isActive = bg.isActive ?? localGroup.isActive;
        localGroup.bookedSeats = bg.bookedSeats ?? localGroup.bookedSeats;
      }
    });

    regeneratePriceMap();
    generateFilterButtons();

  } catch (err) {
    console.log("SeatGroup fetch error:", err);
  }
}

function drawArc(start, end, outerR, innerR, color, label) {

  const rad = Math.PI / 180;
  const largeArc = (end - start) > 180 ? 1 : 0;
  const blockName = label.split("\n")[0];
  const disabled = isBlockDisabled(blockName);

  const x1 = cx + outerR * Math.cos(start * rad);
  const y1 = cy + outerR * Math.sin(start * rad);

  const x2 = cx + outerR * Math.cos(end * rad);
  const y2 = cy + outerR * Math.sin(end * rad);

  const x3 = cx + innerR * Math.cos(end * rad);
  const y3 = cy + innerR * Math.sin(end * rad);

  const x4 = cx + innerR * Math.cos(start * rad);
  const y4 = cy + innerR * Math.sin(start * rad);

  const pathData = `
    M ${x1} ${y1}
    A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
    L ${x3} ${y3}
    A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}
    Z
  `;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");



  // Ã°Å¸â€Â¥ SELECTED STORE & PATH REGISTRY
  // (Declare globally if not already)
  if (typeof window.selectedSeats === 'undefined') {
    window.selectedSeats = [];
  }
  if (typeof window.allArcPaths === 'undefined') {
    window.allArcPaths = [];
  }
  let selectedSeats = window.selectedSeats;
  let allArcPaths = window.allArcPaths;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill", disabled ? "#cccccc" : color);
  path.setAttribute("data-label", blockName);
  path.setAttribute("data-price", priceMap[blockName] || 0);
  path.setAttribute("data-start", start);
  path.setAttribute("data-end", end);
  path.setAttribute("data-outer-r", outerR);
  path.setAttribute("data-inner-r", innerR);
  path.setAttribute("data-disabled", disabled ? "true" : "false");


  // Register this path and its original color
  allArcPaths.push({ path, color, label });

  // Make seat arcs clickable (pointer cursor)
  path.style.cursor = disabled ? "not-allowed" : "pointer";

  // Ã Â¤ÂªÃ Â¤Â¹Ã Â¤Å¡Ã Â¤Â¾Ã Â¤Â¨ (block Ã Â¤Â¯Ã Â¤Â¾ seat)
  const isSeat = label.match(/[A-Z]\d+/);

  // CLICK EVENT
  const handleArcClick = () => {
    if (isBlockDisabled(blockName)) {
      return;
    }
    // Same block clicked Ã¢â€ â€™ do nothing
    if (path.classList.contains("active")) {
      return;
    }

    // If already viewing a block, just clean up old one (no zoom out)
    if (window.seatViewBlock) {
      cleanupSeatView();
    }

    const blockPrice = Number(path.getAttribute("data-price"));
    let allArcPaths = window.allArcPaths;

    // Grey all, select this
    allArcPaths.forEach(obj => {
      const currentBlockName = obj.path.getAttribute("data-label");
      obj.path.classList.remove("active");
      obj.path.setAttribute("fill", isBlockDisabled(currentBlockName) ? "#cccccc" : "#d3d3d3");
    });

    selectedPrice = blockPrice;
    document.querySelectorAll(".filter-pill").forEach(p => {
      p.classList.toggle(
        "active",
        Number(p.dataset.price) === blockPrice && !p.classList.contains("disabled")
      );
    });

    path.classList.add("active");
    path.setAttribute("fill", color);

    // Enter seat view Ã¢â€ â€™ zoom into block and show individual seats
    var sa = Number(path.getAttribute("data-start"));
    var ea = Number(path.getAttribute("data-end"));
    var oR = Number(path.getAttribute("data-outer-r"));
    var iR = Number(path.getAttribute("data-inner-r"));
    enterSeatView(path, sa, ea, oR, iR, color, blockName, blockPrice);
  };

  if (!disabled) {
    path.addEventListener("click", handleArcClick);
  }

  // text
  const mid = (start + end) / 2;

  const tx = cx + ((outerR + innerR) / 2) * Math.cos(mid * rad);
  const ty = cy + ((outerR + innerR) / 2) * Math.sin(mid * rad);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

  text.setAttribute("x", tx);
  text.setAttribute("y", ty);
  text.setAttribute("fill", "black");
  text.setAttribute("font-size", String(LABEL_FONT_SIZE));
  text.setAttribute("text-anchor", "middle");

  text.setAttribute("transform", `rotate(${mid + 90}, ${tx}, ${ty})`);

  // Always render in two lines: split at \n or after first word
  let lines = [];
  if (label.includes("\n")) {
    lines = label.split("\n");
  } else {
    const idx = label.indexOf(" ");
    if (idx !== -1) {
      lines = [label.slice(0, idx), label.slice(idx + 1)];
    } else {
      lines = [label, ""];
    }
  }
  lines.forEach((line, i) => {
    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.setAttribute("x", tx);
    tspan.setAttribute("dy", i === 0 ? "0" : String(LABEL_LINE_GAP));
    tspan.textContent = line;
    text.appendChild(tspan);
  });

  g.appendChild(path);
  g.appendChild(text);

  stadium.appendChild(g);
}


// === DYNAMIC STADIUM SEGMENT SYSTEM ===
// Group sizes (change these to control proportions)
const sizeA = 18; // small (H1/H, G1/G, F1/F)
const sizeB = 28; // normal (K1/K, L1/L, B1/B, C1/C)
const sizeC = 30; // big (J, E) - now half size
const sizeD = 36; // medium-large (D1/D)

// Gaps
const gapSmall = 0.5;
const gapNormal = 0.5;

// Segment structure: { group, outer, inner, fullHeight, gap, outerLabel, innerLabel }
const segments = [
  // Group C (big, full height)
  { group: 'C', outer: "J BLOCK", outerLabel: "J BLOCK\n(JOY PAVILION)", fullHeight: true, gap: gapSmall },
  // Group A (small)
  { group: 'A', outer: "H1 BLOCK", inner: "H BLOCK", outerLabel: "H1 BLOCK\n(JOY PAVILION)", innerLabel: "H BLOCK\n(JOY PAVILION)", gap: gapSmall },
  { group: 'A', outer: "G1 BLOCK", inner: "G BLOCK", outerLabel: "G1 BLOCK\n(VIDA PAVILION)", innerLabel: "G BLOCK\n(VIDA PAVILION)", gap: gapSmall },
  { group: 'A', outer: "F1 BLOCK", inner: "F BLOCK", outerLabel: "F1 BLOCK\n(JIO PAVILION)", innerLabel: "F BLOCK\n(JIO PAVILION)", gap: gapSmall },
  // Group C (big, full height)
  { group: 'C', outer: "E BLOCK", outerLabel: "E BLOCK\n(BKT TYRES PAVILION)", fullHeight: true, gap: gapSmall },
  // Group D (medium-large)
  { group: 'D', outer: "D1 BLOCK", inner: "D BLOCK", outerLabel: "D1 BLOCK\n(VIDA PAVILION)", innerLabel: "D BLOCK\n(VIDA PAVILION)", gap: gapNormal },
  // Group B (normal)
  { group: 'B', outer: "C1 BLOCK", inner: "C BLOCK", outerLabel: "C1 BLOCK\n(RR KABEL PAVILION)", innerLabel: "C BLOCK\n(RR KABEL PAVILION)", gap: gapNormal },
  { group: 'B', outer: "B1 BLOCK", inner: "B BLOCK", outerLabel: "B1 BLOCK\n(BKT TYRES PAVILION)", innerLabel: "B BLOCK\n(BKT TYRES PAVILION)", gap: gapNormal },
  { group: 'B', outer: "K1 BLOCK", inner: "K BLOCK", outerLabel: "K1 BLOCK\n(JIO PAVILION)", innerLabel: "K BLOCK\n(JIO PAVILION)", gap: gapNormal },
  { group: 'B', outer: "L1 BLOCK", inner: "L BLOCK", outerLabel: "L1 BLOCK\n(JAC OLIVOL PAVILION)", innerLabel: "L BLOCK\n(JAC OLIVOL PAVILION)", gap: gapNormal },
  // New CLUB HOUSE block (paired like I blocks)
  { group: 'B', outer: "CLUB HOUSE UPPER TIER", inner: "CLUB HOUSE LOWER TIER", outerLabel: "CLUB HOUSE UPPER TIER", innerLabel: "CLUB HOUSE LOWER TIER", gap: gapNormal }
];

// === ANGLE ASSIGNMENT ===
function assignAngles(segments, sizeA, sizeB, sizeC, sizeD) {
  // Count segments per group
  const countA = segments.filter(s => s.group === 'A').length;
  const countB = segments.filter(s => s.group === 'B').length;
  const countC = segments.filter(s => s.group === 'C').length;
  const countD = segments.filter(s => s.group === 'D').length;

  // Sum all gaps
  const totalGap = segments.reduce((sum, s) => sum + (s.gap || 0), 0);

  // Remaining angle for blocks
  const angleAvailable = 360 - totalGap;

  // Total size units
  const totalUnits = countA * sizeA + countB * sizeB + countC * sizeC + countD * sizeD;

  // Angle per unit
  const anglePerUnit = angleAvailable / totalUnits;

  // Assign final angle to each segment
  segments.forEach(s => {
    if (s.group === 'A') s.finalAngle = sizeA * anglePerUnit;
    if (s.group === 'B') s.finalAngle = sizeB * anglePerUnit;
    if (s.group === 'C') s.finalAngle = sizeC * anglePerUnit;
    if (s.group === 'D') s.finalAngle = sizeD * anglePerUnit;
  });
}


// Ã°Å¸Å½Â¨ BLOCK GROUPS (color + price = source of truth)
// Same color = Same price = Same filter group
const blockGroups = [
  {
    groupId: 1,
    name: "Ultra VIP",
    color: "#E53935",
    price: 8500,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["VIP B"]
  },
  {
    groupId: 2,
    name: "VIP",
    color: "#43A047",
    price: 5000,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["CLUB HOUSE LOWER TIER", "VIP L"]
  },
  {
    groupId: 3,
    name: "Premium",
    color: "#5C6BC0",
    price: 3500,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["B BLOCK"]
  },
  {
    groupId: 4,
    name: "Mid Premium",
    color: "#8E24AA",
    price: 3300,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["L BLOCK"]
  },
  {
    groupId: 5,
    name: "Standard (Club)",
    color: "#FB8C00",
    price: 3000,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["CLUB HOUSE UPPER TIER"]
  },
  {
    groupId: 6,
    name: "Standard",
    color: "#26A69A",
    price: 2000,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["C BLOCK", "F BLOCK", "G BLOCK", "K BLOCK"]
  },
  {
    groupId: 7,
    name: "Budget Plus",
    color: "#7B1FA2",
    price: 1500,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["B1 BLOCK", "D BLOCK", "E BLOCK", "F1 BLOCK", "H BLOCK", "J BLOCK", "L1 BLOCK"]
  },
  {
    groupId: 8,
    name: "Budget",
    color: "#EC407A",
    price: 1200,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["C1 BLOCK", "G1 BLOCK", "H1 BLOCK", "K1 BLOCK"]
  },
  {
    groupId: 9,
    name: "Economy",
    color: "#29B6F6",
    price: 1000,
    totalSeats: 9999,
    bookedSeats: 0,
    isActive: true,
    blocks: ["D1 BLOCK"]
  }
];

// Ã°Å¸â€Â§ Auto-generate colors from groups
const colors = {};
blockGroups.forEach(group => {
  group.blocks.forEach(block => {
    colors[block] = group.color;
  });
});

// Ã°Å¸â€Â§ Auto-generate priceMap from groups (same color = same price)
const priceMap = {};
function regeneratePriceMap() {
  Object.keys(priceMap).forEach(block => {
    delete priceMap[block];
  });

  blockGroups.forEach(group => {
    group.blocks.forEach(block => {
      priceMap[block] = group.price;
    });
  });
}

regeneratePriceMap();

// Ã°Å¸â€Â§ Helper: get group for a block
function getBlockGroup(blockName) {
  for (const group of blockGroups) {
    if (group.blocks.includes(blockName)) return group;
  }
  return null;
}

function isBlockDisabled(blockName) {
  const group = getBlockGroup(blockName);
  if (!group) return false;
  if (group.isActive === false) return true;
  if (group.bookedSeats >= group.totalSeats) return true;
  return false;
}

function isPriceGroupDisabled(price) {
  const groupsAtPrice = blockGroups.filter(group => group.price === price);
  if (!groupsAtPrice.length) return false;
  return groupsAtPrice.every(group => {
    if (group.isActive === false) return true;
    if (group.bookedSeats >= group.totalSeats) return true;
    return false;
  });
}

// Price filter buttons (BMS style - sorted low to high, colored pills)
function generateFilterButtons() {
  const filterDiv = document.getElementById("price-filter");
  if (!filterDiv) return;
  filterDiv.innerHTML = "";

  // Collect unique prices with their color, sorted ascending
  const seen = new Map();
  blockGroups.forEach(group => {
    if (!seen.has(group.price)) {
      seen.set(group.price, group.color);
    }
  });
  const sorted = [...seen.entries()].sort((a, b) => a[0] - b[0]);

  sorted.forEach(([price, color]) => {
    const pill = document.createElement("div");
    const disabled = isPriceGroupDisabled(price);
    const pillColor = disabled ? "#9e9e9e" : color;
    pill.classList.add("filter-pill");
    if (disabled) pill.classList.add("disabled");
    pill.innerHTML = `<div class="pill-price" style="color:${color}">Ã¢â€šÂ¹${price.toLocaleString("en-IN")}</div><div class="pill-tag" style="color:${color}">Fast Filling</div>`;
    pill.innerHTML = `<div class="pill-price" style="color:${pillColor}">\u20B9${price.toLocaleString("en-IN")}</div><div class="pill-tag" style="color:${pillColor}">Fast Filling</div>`;
    pill.setAttribute("data-price", price);
    pill.style.borderColor = "#ddd";

    if (disabled) {
      filterDiv.appendChild(pill);
      return;
    }

    pill.onclick = () => {
      // If in seat view, exit first Ã¢â€ â€™ zoom out, reset block
      if (window.seatViewBlock) {
        exitSeatView();
      }

      // Remove active from all pills
      filterDiv.querySelectorAll(".filter-pill").forEach(p => {
        p.classList.remove("active");
        p.style.borderColor = "#ddd";
      });
      // Activate this pill
      pill.classList.add("active");
      pill.style.borderColor = color;

      filterPrice(price);
    };

    filterDiv.appendChild(pill);
  });
}

function refreshRenderedBlockStates() {
  if (!Array.isArray(window.allArcPaths)) return;

  window.allArcPaths.forEach(obj => {
    const blockName = obj.path.getAttribute("data-label");
    const disabled = isBlockDisabled(blockName);

    obj.path.setAttribute("data-price", priceMap[blockName] || 0);
    obj.path.setAttribute("data-disabled", disabled ? "true" : "false");
    obj.path.style.cursor = disabled ? "not-allowed" : "pointer";

    if (obj.path.classList.contains("active") && disabled) {
      obj.path.classList.remove("active");
    }

    if (!obj.path.classList.contains("active")) {
      obj.path.setAttribute("fill", disabled ? "#cccccc" : obj.color);
    }
  });
}


const lowerBlockPremiumRatio = 0.4;

const splitLowerBlocks = {
  "B BLOCK": {
    premiumKey: "VIP B",
    premiumLabel: "VIP B\n(BKT TYRES\nPAVILION)",
    normalLabel: "B BLOCK\n(BKT TYRES\nPAVILION)"
  },
  "L BLOCK": {
    premiumKey: "VIP L",
    premiumLabel: "VIP L\n(VIDA\nPAVILION)",
    normalLabel: "L BLOCK\n(JAC OLIVOL\nPAVILION)"
  }
};

function getArcMidX(start, end, outerR, innerR) {
  const rad = Math.PI / 180;
  const mid = (start + end) / 2;
  const radius = (outerR + innerR) / 2;
  return cx + radius * Math.cos(mid * rad);
}

function drawLowerBlock(start, end, seg) {
  const splitConfig = splitLowerBlocks[seg.inner];

  if (!splitConfig) {
    drawArc(start, end, innerOuter, innerInner, colors[seg.inner], seg.innerLabel || seg.inner);
    return;
  }

  const totalAngle = end - start;
  const premiumAngle = totalAngle * lowerBlockPremiumRatio;
  const premiumAtStartX = getArcMidX(start, start + premiumAngle, innerOuter, innerInner);
  const premiumAtEndX = getArcMidX(end - premiumAngle, end, innerOuter, innerInner);
  const premiumOnStartSide = premiumAtStartX < premiumAtEndX;

  const premiumStart = premiumOnStartSide ? start : end - premiumAngle;
  const premiumEnd = premiumOnStartSide ? start + premiumAngle : end;
  const normalStart = premiumOnStartSide ? premiumEnd : start;
  const normalEnd = premiumOnStartSide ? end : premiumStart;

  drawArc(
    premiumStart,
    premiumEnd,
    innerOuter,
    innerInner,
    colors[splitConfig.premiumKey],
    splitConfig.premiumLabel
  );

  drawArc(
    normalStart,
    normalEnd,
    innerOuter,
    innerInner,
    colors[seg.inner],
    splitConfig.normalLabel || seg.innerLabel || seg.inner
  );
}

function drawStadium() {
let currentAngle = -90;
segments.forEach(seg => {
  const gap = seg.gap || 0;
  const start = currentAngle + gap / 2;
  const end = currentAngle + seg.finalAngle - gap / 2;

  // Draw main arcs
  if (seg.fullHeight && seg.outer) {
    drawArc(start, end, outerOuter, innerInner, colors[seg.outer], seg.outerLabel || seg.outer);
  } else {
    if (seg.outer) drawArc(start, end, outerOuter, outerInner, colors[seg.outer], seg.outerLabel || seg.outer);
    if (seg.inner) drawLowerBlock(start, end, seg);
  }
  currentAngle += seg.finalAngle + gap;
});

// Ã°Å¸Å½Â¯ CENTER
const ground = document.createElementNS("http://www.w3.org/2000/svg", "circle");

ground.setAttribute("cx", cx);
ground.setAttribute("cy", cy);
  ground.setAttribute("r", 120); // increased radius for green circle
ground.setAttribute("fill", "#1e7d32");

stadium.appendChild(ground);

// Ã°Å¸ÂÂ CRICKET PITCH (rectangle at center)
const pitchWidth = 10; // units (adjustable)
const pitchHeight = 50; // units (adjustable)
const pitch = document.createElementNS("http://www.w3.org/2000/svg", "rect");
pitch.setAttribute("x", cx - pitchWidth / 2);
pitch.setAttribute("y", cy - pitchHeight / 2);
pitch.setAttribute("width", pitchWidth);
pitch.setAttribute("height", pitchHeight);
pitch.setAttribute("fill", "#ffffff");
// No border-radius for sharp 90-degree corners
pitch.setAttribute("stroke", "#e0e0e0");
pitch.setAttribute("stroke-width", 0.5);
stadium.appendChild(pitch);
}


// Continue button Ã¢â€ â€™ box office page
function getActiveBlockPath() {
  if (window.seatViewBlock) return window.seatViewBlock;
  var allArcPaths = Array.isArray(window.allArcPaths) ? window.allArcPaths : [];
  var activeEntry = allArcPaths.find(function(obj) {
    return obj.path.classList.contains("active");
  });
  return activeEntry ? activeEntry.path : null;
}

function getSelectedSeatNumbers() {
  if (Array.isArray(window.selectedSeatRecords) && window.selectedSeatRecords.length) {
    return window.selectedSeatRecords
      .slice()
      .sort(function(a, b) {
        if (a.row !== b.row) return a.row - b.row;
        if (a.col !== b.col) return a.col - b.col;
        return a.number - b.number;
      })
      .map(function(seatRecord) {
        return seatRecord.number;
      });
  }

  if (!Array.isArray(window.selectedSeats)) return [];

  return window.selectedSeats
    .map(function(seatId) {
      var match = String(seatId).match(/-(\d+)$/);
      return match ? Number(match[1]) : null;
    })
    .filter(function(seatNumber) {
      return seatNumber !== null;
    })
    .sort(function(a, b) {
      return a - b;
    });
}

function formatSelectionSummary(blockName, seatNumbers) {
  if (!blockName && !seatNumbers.length) return "No seats selected";

  var parts = [];
  if (blockName) parts.push(blockName);
  if (seatNumbers.length) {
    parts.push((seatNumbers.length === 1 ? "Seat " : "Seats ") + seatNumbers.join(", "));
  }

  return parts.join(" | ");
}

function updateTotal() {
  var safeSelectedSeats = Array.isArray(window.selectedSeats) ? window.selectedSeats : [];
  var pricePerSeat = selectedPrice || 0;
  var totalPriceValue = document.getElementById("totalPrice");
  var seatCountLabel = document.getElementById("seatCount");
  var selectionSummary = document.getElementById("selectionSummary");
  var selectionDot = document.getElementById("selectionDot");
  var btn = document.getElementById("continueBtn");
  var bottomBar = document.getElementById("bottomBar");
  var filterPanel = document.getElementById("filterPanel");
  var activeBlockPath = getActiveBlockPath();
  var blockName = activeBlockPath ? activeBlockPath.getAttribute("data-label") : "";
  var blockColor = activeBlockPath
    ? (activeBlockPath.getAttribute("stroke") || activeBlockPath.getAttribute("fill") || "#7b1fa2")
    : "#7b1fa2";
  var seatNumbers = getSelectedSeatNumbers();

  selectedCount = safeSelectedSeats.length;

  if (seatCountLabel) seatCountLabel.innerText = "Selection/s :";
  if (selectionSummary) selectionSummary.innerText = formatSelectionSummary(blockName, seatNumbers);
  if (selectionDot) selectionDot.style.background = blockColor;
  if (totalPriceValue) {
    totalPriceValue.innerText = "\u20B9" + (selectedCount * pricePerSeat).toLocaleString("en-IN");
  }

  if (btn) {
    btn.disabled = selectedCount === 0;
    btn.classList.toggle("active", selectedCount > 0);
  }

  if (bottomBar) bottomBar.style.display = selectedCount > 0 ? "block" : "none";
  if (filterPanel) filterPanel.style.display = selectedCount > 0 ? "none" : "";
}

document.getElementById("continueBtn").addEventListener("click", () => {
  if (window.selectedSeats.length === 0) return;

  const block = window.allArcPaths.find(o => o.path.classList.contains("active"))?.path.getAttribute("data-label") || "";
  const seats = window.selectedSeats;
  const price = selectedPrice;
  const total = seats.length * price;
  const cleanSeats = getSelectedSeatNumbers();

  localStorage.setItem("selectedPrice", selectedPrice);
  localStorage.setItem("selectedSeats", JSON.stringify(window.selectedSeats));
  localStorage.setItem("selectedBlock", block);

  // 🔥 IMPORTANT FIX
  localStorage.setItem("matchId", selectedMatch._id);
  localStorage.setItem("selectedMatch", JSON.stringify(selectedMatch));

  window.location.href = "/user details/details";
});

// Ã°Å¸Å½Â¯ PRICE FILTER FUNCTION (group-based: same color = same price)
function filterPrice(price) {
  selectedPrice = price;
  selectedCount = 0;
  window.selectedSeats = [];
  window.selectedSeatRecords = [];

  window.allArcPaths.forEach(obj => {
    obj.path.classList.remove("active");
    const blockName = obj.path.getAttribute("data-label");
    const group = getBlockGroup(blockName);
    const blockPrice = group ? group.price : Number(obj.path.getAttribute("data-price"));
    const disabled = isBlockDisabled(blockName);

    if (blockPrice === price && !disabled) {
      obj.path.setAttribute("fill", obj.color);
    } else {
      obj.path.setAttribute("fill", disabled ? "#cccccc" : "#d3d3d3");
    }
  });

  updateTotal();
}

// Back navigation
function goBack() {
  window.history.back();
}

// Set header title from localStorage
(function setHeaderTitle() {
  if (!selectedMatch._id) return;

  const el = document.getElementById("headerTitle");
  if (el) {
    const t1 = (selectedMatch.teamA?.name || "").toUpperCase();
    const t2 = (selectedMatch.teamB?.name || "").toUpperCase();
    el.textContent = t1 + " VS " + t2;
  }
})();

// Ã¢â€â‚¬Ã¢â€â‚¬ UNIFIED VIEWBOX ZOOM & PAN (native SVG resolution at all zoom levels) Ã¢â€â‚¬Ã¢â€â‚¬
window.seatViewBlock = null;

// viewBox zoom state
var vb = { x: 0, y: 0, w: 500, h: 500 };
var vbAnimFrame = null;

(function initGlobalViewBoxZoom() {
  var container = document.getElementById('stadium-container');
  if (!container) return;

  var MAX_W = 600;   // most zoomed out (full stadium + margin)
  var MIN_W = 15;    // most zoomed in (~33x)
  var dirty = false;
  var PAN_THRESHOLD = 5;

  function applyVB() {
    stadium.setAttribute('viewBox', vb.x.toFixed(2) + ' ' + vb.y.toFixed(2) + ' ' + vb.w.toFixed(2) + ' ' + vb.h.toFixed(2));
    dirty = false;
  }
  function scheduleVB() {
    if (!dirty) { dirty = true; requestAnimationFrame(applyVB); }
  }

  function ddist(a, b) {
    var dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Pinch state
  var d0, vbW0, lx, ly;
  // Pan state
  var panning = false, panStarted = false, px0, py0, vbX0, vbY0;

  container.addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      d0 = ddist(e.touches[0], e.touches[1]);
      vbW0 = vb.w;
      var mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      var r = stadium.getBoundingClientRect();
      lx = vb.x + vb.w * ((mx - r.left) / r.width);
      ly = vb.y + vb.h * ((my - r.top) / r.height);
      panning = false;
    } else if (e.touches.length === 1) {
      panning = true;
      panStarted = false;
      px0 = e.touches[0].clientX;
      py0 = e.touches[0].clientY;
      vbX0 = vb.x;
      vbY0 = vb.y;
    }
  }, { passive: false });

  container.addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      var d = ddist(e.touches[0], e.touches[1]);
      var ratio = d0 / d;
      var nw = vbW0 * ratio;
      if (nw < MIN_W) nw = MIN_W;
      if (nw > MAX_W) nw = MAX_W;
      var ar = window.innerWidth / window.innerHeight;
      var nh = nw / ar;

      var mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      var my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      var r = stadium.getBoundingClientRect();
      var fx = (mx - r.left) / r.width;
      var fy = (my - r.top) / r.height;
      vb.w = nw;
      vb.h = nh;
      vb.x = lx - fx * nw;
      vb.y = ly - fy * nh;
      scheduleVB();
    } else if (e.touches.length === 1 && panning) {
      var dx = e.touches[0].clientX - px0;
      var dy = e.touches[0].clientY - py0;
      if (!panStarted) {
        if (Math.abs(dx) < PAN_THRESHOLD && Math.abs(dy) < PAN_THRESHOLD) return;
        panStarted = true;
      }
      e.preventDefault();
      var r = stadium.getBoundingClientRect();
      var dvx = dx * (vb.w / r.width);
      var dvy = dy * (vb.h / r.height);
      vb.x = vbX0 - dvx;
      vb.y = vbY0 - dvy;
      scheduleVB();
    }
  }, { passive: false });

  container.addEventListener('touchend', function() {
    panning = false;
    panStarted = false;
  });

  container.addEventListener('wheel', function(e) {
    e.preventDefault();
    var factor = e.deltaY > 0 ? 1.08 : 0.92;
    var nw = vb.w * factor;
    if (nw < MIN_W) nw = MIN_W;
    if (nw > MAX_W) nw = MAX_W;
    var ar = window.innerWidth / window.innerHeight;
    var nh = nw / ar;
    var r = stadium.getBoundingClientRect();
    var fx = (e.clientX - r.left) / r.width;
    var fy = (e.clientY - r.top) / r.height;
    var svgX = vb.x + vb.w * fx;
    var svgY = vb.y + vb.h * fy;
    vb.w = nw;
    vb.h = nh;
    vb.x = svgX - fx * nw;
    vb.y = svgY - fy * nh;
    applyVB();
  }, { passive: false });
})();

function calcBlockBBox(startAngle, endAngle, outerR, innerR) {
  var rad = Math.PI / 180;
  var pts = [];
  var steps = 30;
  for (var i = 0; i <= steps; i++) {
    var a = startAngle + (endAngle - startAngle) * (i / steps);
    var ar = a * rad;
    pts.push([cx + innerR * Math.cos(ar), cy + innerR * Math.sin(ar)]);
    pts.push([cx + outerR * Math.cos(ar), cy + outerR * Math.sin(ar)]);
  }
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  pts.forEach(function(p) {
    if (p[0] < minX) minX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] > maxY) maxY = p[1];
  });
  var pad = 8;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  var bw = maxX - minX;
  var bh = maxY - minY;
  // Maintain screen aspect ratio
  var screenAR = window.innerWidth / window.innerHeight;
  var boxAR = bw / bh;
  if (boxAR > screenAR) {
    var newH = bw / screenAR;
    minY -= (newH - bh) / 2;
    bh = newH;
  } else {
    var newW = bh * screenAR;
    minX -= (newW - bw) / 2;
    bw = newW;
  }
  return { x: minX, y: minY, w: bw, h: bh };
}

function setViewBox(x, y, w, h, animate) {
  var str = x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2);
  if (vbAnimFrame) {
    cancelAnimationFrame(vbAnimFrame);
    vbAnimFrame = null;
  }
  if (animate) {
    var start = {
      x: vb.x,
      y: vb.y,
      w: vb.w,
      h: vb.h
    };
    var target = { x: x, y: y, w: w, h: h };
    var duration = 450;
    var startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateFrame(ts) {
      if (startTime === null) startTime = ts;
      var progress = Math.min(1, (ts - startTime) / duration);
      var eased = easeInOutCubic(progress);

      vb.x = start.x + (target.x - start.x) * eased;
      vb.y = start.y + (target.y - start.y) * eased;
      vb.w = start.w + (target.w - start.w) * eased;
      vb.h = start.h + (target.h - start.h) * eased;

      stadium.setAttribute(
        'viewBox',
        vb.x.toFixed(2) + ' ' + vb.y.toFixed(2) + ' ' + vb.w.toFixed(2) + ' ' + vb.h.toFixed(2)
      );

      if (progress < 1) {
        vbAnimFrame = requestAnimationFrame(animateFrame);
      } else {
        vb.x = target.x;
        vb.y = target.y;
        vb.w = target.w;
        vb.h = target.h;
        stadium.setAttribute('viewBox', str);
        vbAnimFrame = null;
      }
    }

    vbAnimFrame = requestAnimationFrame(animateFrame);
  } else {
    vb.x = x;
    vb.y = y;
    vb.w = w;
    vb.h = h;
    stadium.setAttribute('viewBox', str);
  }
}

function enterSeatView(blockPath, startAngle, endAngle, outerR, innerR, blockColor, blockName, blockPrice) {
  window.seatViewBlock = blockPath;
  window.selectedSeats = [];
  selectedCount = 0;

  // Hide only the selected block's text label
  var blockLabel = blockPath.nextElementSibling;
  if (blockLabel && blockLabel.tagName === 'text') {
    blockLabel.style.opacity = '0';
 }

  // Make selected block transparent with thin outline
  blockPath.setAttribute('fill-opacity', '0');
  blockPath.setAttribute('stroke', blockColor);
  blockPath.setAttribute('stroke-width', '0.5');
  blockPath.setAttribute('stroke-opacity', '0.6');

  // Calculate block bounding box and animate viewBox
  var bbox = calcBlockBBox(startAngle, endAngle, outerR, innerR);
  setViewBox(bbox.x, bbox.y, bbox.w, bbox.h, true);

  // Draw seats after viewBox animation completes
  setTimeout(function() {
    drawSeatsInSVG(startAngle, endAngle, outerR, innerR, blockColor, blockName);
  }, 500);

  // Show back button
  var backBtn = document.getElementById('seatViewBack');
  if (backBtn) backBtn.style.display = 'flex';
}

function cleanupSeatView() {
  // Remove seat SVG group
  var sg = document.getElementById('seatViewGroup');
  if (sg) sg.remove();

  // Show hidden block label
  if (window.seatViewBlock) {
    var blockLabel = window.seatViewBlock.nextElementSibling;
    if (blockLabel && blockLabel.tagName === 'text') {
      blockLabel.style.opacity = '';
    }
  }

  // Restore block opacity & remove outline
  if (window.seatViewBlock) {
    window.seatViewBlock.setAttribute('fill-opacity', '1');
    window.seatViewBlock.removeAttribute('stroke');
    window.seatViewBlock.removeAttribute('stroke-width');
    window.seatViewBlock.removeAttribute('stroke-opacity');
  }
  window.seatViewBlock = null;
  window.selectedSeats = [];
  window.selectedSeatRecords = [];
  window.seatLayout = null;
  selectedCount = 0;
  updateTotal();
}

function exitSeatView() {
  cleanupSeatView();

  // Reset all block colors
  window.allArcPaths.forEach(function(obj) {
    var blockName = obj.path.getAttribute('data-label');
    obj.path.classList.remove('active');
    obj.path.setAttribute('fill', isBlockDisabled(blockName) ? '#cccccc' : obj.color);
    obj.path.setAttribute('fill-opacity', '1');
  });

  // Animate viewBox back to full stadium
  setViewBox(0, 0, 500, 500, true);

  // Reset state
  selectedPrice = null;
  window.selectedSeats = [];
  selectedCount = 0;
  updateTotal();
  document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });

  // Hide back button
  var backBtn = document.getElementById('seatViewBack');
  if (backBtn) backBtn.style.display = 'none';
}

function syncSeatSelectionCount() {
  selectedCount = window.selectedSeats.length;
  updateTotal();
}

function selectSeatRecord(seatRecord) {
  if (!seatRecord || seatRecord.booked || seatRecord.selected) return false;

  seatRecord.selected = true;
  seatRecord.grp.classList.add('seat-selected');
  seatRecord.circle.setAttribute('fill', seatRecord.bColor);
  seatRecord.circle.setAttribute('stroke', seatRecord.bColor);
  seatRecord.text.setAttribute('fill', 'white');

  if (!Array.isArray(window.selectedSeats)) window.selectedSeats = [];
  if (!Array.isArray(window.selectedSeatRecords)) window.selectedSeatRecords = [];

  if (window.selectedSeats.indexOf(seatRecord.sid) === -1) {
    window.selectedSeats.push(seatRecord.sid);
  }
  if (window.selectedSeatRecords.indexOf(seatRecord) === -1) {
    window.selectedSeatRecords.push(seatRecord);
  }

  return true;
}

function deselectSeatRecord(seatRecord) {
  if (!seatRecord || seatRecord.booked || !seatRecord.selected) return false;

  seatRecord.selected = false;
  seatRecord.grp.classList.remove('seat-selected');
  seatRecord.circle.setAttribute('fill', 'transparent');
  seatRecord.circle.setAttribute('stroke', seatRecord.bColor);
  seatRecord.text.setAttribute('fill', seatRecord.bColor);

  var idx = window.selectedSeats.indexOf(seatRecord.sid);
  if (idx > -1) window.selectedSeats.splice(idx, 1);

  var recordIdx = window.selectedSeatRecords.indexOf(seatRecord);
  if (recordIdx > -1) window.selectedSeatRecords.splice(recordIdx, 1);

  return true;
}

function clearSelectedSeatRecords() {
  if (!Array.isArray(window.selectedSeatRecords) || !window.selectedSeatRecords.length) {
    window.selectedSeats = [];
    window.selectedSeatRecords = [];
    return;
  }

  var currentRecords = window.selectedSeatRecords.slice();
  currentRecords.forEach(function(seatRecord) {
    deselectSeatRecord(seatRecord);
  });

  window.selectedSeats = [];
  window.selectedSeatRecords = [];
}

function getContiguousRunContaining(rowSeats, col) {
  if (!rowSeats || !rowSeats[col] || rowSeats[col].booked) return [];

  var start = col;
  var end = col;

  while (start > 0 && rowSeats[start - 1] && !rowSeats[start - 1].booked) start--;
  while (end < rowSeats.length - 1 && rowSeats[end + 1] && !rowSeats[end + 1].booked) end++;

  return rowSeats.slice(start, end + 1);
}

function getAvailableRuns(rowSeats) {
  var runs = [];
  var currentRun = [];

  for (var i = 0; i < rowSeats.length; i++) {
    var seatRecord = rowSeats[i];
    if (seatRecord && !seatRecord.booked) {
      currentRun.push(seatRecord);
    } else if (currentRun.length) {
      runs.push(currentRun);
      currentRun = [];
    }
  }

  if (currentRun.length) runs.push(currentRun);

  return runs;
}

function takeSeatsFromRun(run, needed, preferredCol) {
  if (!run || !run.length || needed <= 0) return [];
  if (needed >= run.length) return run.slice();

  var takeCount = Math.min(needed, run.length);
  var relativeStart = (preferredCol - run[0].col) - Math.floor(takeCount / 2);
  var startIndex = Math.max(0, Math.min(run.length - takeCount, relativeStart));

  return run.slice(startIndex, startIndex + takeCount);
}

function getNextRowIndices(totalRows, startRow) {
  var indices = [];

  for (var offset = 1; offset < totalRows; offset++) {
    if (startRow + offset < totalRows) indices.push(startRow + offset);
    if (startRow - offset >= 0) indices.push(startRow - offset);
  }

  return indices;
}

function pickSeatsFromRow(rowSeats, needed, preferredCol) {
  if (!rowSeats || !rowSeats.length || needed <= 0) return [];

  var runs = getAvailableRuns(rowSeats);
  if (!runs.length) return [];

  var bestRun = null;
  var bestDistance = Infinity;

  for (var i = 0; i < runs.length; i++) {
    var run = runs[i];
    var runCanFit = run.length >= needed;
    var bestCanFit = bestRun ? bestRun.length >= needed : false;
    var runCenter = (run[0].col + run[run.length - 1].col) / 2;
    var distance = Math.abs(runCenter - preferredCol);

    if (!bestRun) {
      bestRun = run;
      bestDistance = distance;
      continue;
    }

    if (runCanFit && !bestCanFit) {
      bestRun = run;
      bestDistance = distance;
      continue;
    }

    if (runCanFit === bestCanFit) {
      if (!runCanFit && run.length > bestRun.length) {
        bestRun = run;
        bestDistance = distance;
        continue;
      }

      if (distance < bestDistance) {
        bestRun = run;
        bestDistance = distance;
      }
    }
  }

  return takeSeatsFromRun(bestRun, needed, preferredCol);
}

function buildAutoSelectedSeatSet(clickedSeat, maxSeats) {
  var seatLayout = window.seatLayout;
  if (!seatLayout || !seatLayout.rows || !seatLayout.rows.length) return [clickedSeat];

  var pickedSeats = [];

  function appendSeats(seats) {
    for (var i = 0; i < seats.length && pickedSeats.length < maxSeats; i++) {
      var seatRecord = seats[i];
      if (!seatRecord || seatRecord.booked || pickedSeats.indexOf(seatRecord) > -1) continue;
      pickedSeats.push(seatRecord);
    }
  }

  var sameRowRun = getContiguousRunContaining(seatLayout.rows[clickedSeat.row], clickedSeat.col);
  appendSeats(takeSeatsFromRun(sameRowRun, maxSeats, clickedSeat.col));

  if (pickedSeats.length >= maxSeats) return pickedSeats;

  var nextRows = getNextRowIndices(seatLayout.rows.length, clickedSeat.row);
  for (var i = 0; i < nextRows.length && pickedSeats.length < maxSeats; i++) {
    appendSeats(pickSeatsFromRow(
      seatLayout.rows[nextRows[i]],
      maxSeats - pickedSeats.length,
      clickedSeat.col
    ));
  }

  return pickedSeats.length ? pickedSeats : [clickedSeat];
}

function toggleSeat(seatRecord, maxSeats) {
  if (!seatRecord || seatRecord.booked) return;

  if (maxSeats <= 1) {
    if (seatRecord.selected) {
      clearSelectedSeatRecords();
    } else {
      clearSelectedSeatRecords();
      selectSeatRecord(seatRecord);
    }
    syncSeatSelectionCount();
    return;
  }

  if (seatRecord.selected) {
    clearSelectedSeatRecords();
    syncSeatSelectionCount();
    return;
  }

  var nextSeatSet = buildAutoSelectedSeatSet(seatRecord, maxSeats);

  clearSelectedSeatRecords();
  nextSeatSet.forEach(function(nextSeat) {
    selectSeatRecord(nextSeat);
  });

  syncSeatSelectionCount();
}

function drawSeatsInSVG(startAngle, endAngle, outerR, innerR, blockColor, blockName) {
  var existing = document.getElementById('seatViewGroup');
  if (existing) existing.remove();

  var seatGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  seatGroup.id = 'seatViewGroup';
  window.seatLayout = { rows: [] };
  window.selectedSeatRecords = [];

  var rad = Math.PI / 180;
  var seatR = 1.8;
  var rowGap = 4.2;
  var padding = 1;
  var depth = outerR - innerR;
  var numRows = Math.max(6, Math.floor((depth - padding * 2) / rowGap));
  var seatNum = 1;
  var maxSeats = Number(localStorage.getItem('seatCount') || localStorage.getItem('seats') || 1);
  var blockGroup = getBlockGroup(blockName);
  var blockDisabled = isBlockDisabled(blockName);
  var isVipBlock = !!(blockGroup && /vip/i.test(blockGroup.name));

  // Deterministic seat availability so each block keeps a stable pattern.
  // Seeded pseudo-random for consistency (same block = same pattern every time)
  var seed = 0;
  for (var ci = 0; ci < blockName.length; ci++) seed += blockName.charCodeAt(ci);
  seed = seed * 9301 + 49297;
  // Helper: seeded random per block+row
  function seededRandRow(row) {
    var localSeed = seed + row * 10007;
    return function() {
      localSeed = (localSeed * 9301 + 49297) % 233280;
      return localSeed / 233280;
    };
  }

  for (var row = 0; row < numRows; row++) {
    window.seatLayout.rows[row] = [];
    // Edge rows: first 2 and last 2 rows Ã¢â€ â€™ contiguous available in middle
    var r = innerR + padding + seatR + row * rowGap;
    var arcLen = r * (endAngle - startAngle) * Math.PI / 180;
    var seatSpacing = seatR * 2 + 0.8;
    var numSeats = Math.max(1, Math.floor(arcLen / seatSpacing));
    var usedAngle = (endAngle - startAngle) - 0.8;
    var angleStep = usedAngle / numSeats;
    var aStart = startAngle + 0.4;

    var randRow = seededRandRow(row);

    // VIP sections stay mostly open; other sections keep 30% seats available.
    var availPercent = isVipBlock ? 0.50 : 0.30;
    var availableCount = 0;
    for (var col = 0; col < numSeats; col++) {
      if (randRow() < availPercent) availableCount++;
    }
    // Guarantee at least 1 available in non-VIP rows.
    if (!isVipBlock && row === 0 && availableCount === 0 && numSeats > 0) availableCount = 1;

    var availableCols = {};
    if (availableCount > 0) {
      var linedCols = Math.min(
        availableCount,
        Math.max(1, Math.round(availableCount * 0.9))
      );
      var lineStart = Math.floor(randRow() * Math.max(1, numSeats - linedCols + 1));

      for (var lineCol = 0; lineCol < linedCols; lineCol++) {
        availableCols[lineStart + lineCol] = true;
      }

      var scatteredCols = availableCount - linedCols;
      while (scatteredCols > 0) {
        var scatterCol = Math.floor(randRow() * numSeats);
        if (availableCols[scatterCol]) continue;
        availableCols[scatterCol] = true;
        scatteredCols--;
      }
    }

    for (var col = 0; col < numSeats; col++) {
      var angle = aStart + angleStep * (col + 0.5);
      var sx = cx + r * Math.cos(angle * rad);
      var sy = cy + r * Math.sin(angle * rad);
      var curNum = seatNum++;
      var seatId = blockName.replace(/ BLOCK/g, '').replace(/\s+/g, '') + '-' + curNum;

      var isAvailable = !blockDisabled && !!availableCols[col];

      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('seat-g');

      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', sx);
      circle.setAttribute('cy', sy);
      circle.setAttribute('r', seatR);

      var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', sx);
      txt.setAttribute('y', sy + 0.45);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('dominant-baseline', 'central');
      txt.setAttribute('font-size', '1.2');
      txt.setAttribute('font-weight', '700');
      txt.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
      txt.textContent = curNum;

      var seatRecord = {
        grp: g,
        circle: circle,
        text: txt,
        sid: seatId,
        number: curNum,
        bColor: blockColor,
        row: row,
        col: col,
        booked: !isAvailable,
        selected: false
      };

      g.setAttribute('data-row', row);
      g.setAttribute('data-col', col);
      g.setAttribute('data-seat-id', seatId);
      window.seatLayout.rows[row][col] = seatRecord;

      if (!isAvailable) {
        circle.setAttribute('fill', '#e0e0e0');
        circle.setAttribute('stroke', 'none');
        txt.setAttribute('fill', 'transparent');
        g.classList.add('seat-booked');
      } else {
        circle.setAttribute('fill', 'transparent');
        circle.setAttribute('stroke', blockColor);
        circle.setAttribute('stroke-width', '0.4');
        txt.setAttribute('fill', blockColor);

        (function(record) {
          var tapStartX, tapStartY, tapStartTime;
          record.grp.addEventListener('touchstart', function(e) {
            tapStartX = e.touches[0].clientX;
            tapStartY = e.touches[0].clientY;
            tapStartTime = Date.now();
          }, { passive: true });
          record.grp.addEventListener('touchend', function(e) {
            if (!tapStartTime) return;
            var ch = e.changedTouches[0];
            var dx = Math.abs(ch.clientX - tapStartX);
            var dy = Math.abs(ch.clientY - tapStartY);
            var dt = Date.now() - tapStartTime;
            tapStartTime = 0;
            if (dx > 10 || dy > 10 || dt > 400) return;
            e.stopPropagation();
            e.preventDefault();
            toggleSeat(record, maxSeats);
          });
          record.grp.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            toggleSeat(record, maxSeats);
          });
        })(seatRecord);
      }

      g.appendChild(circle);
      g.appendChild(txt);
      seatGroup.appendChild(g);
    }
  }

  stadium.appendChild(seatGroup);
}

async function initStadium() {
  await loadSeatGroupsFromBackend();

  assignAngles(segments, sizeA, sizeB, sizeC, sizeD);

  const filterDiv = document.getElementById("price-filter");
  if (filterDiv) filterDiv.innerHTML = "";

  generateFilterButtons();
  drawStadium();
  refreshRenderedBlockStates();
}

initStadium();
                                      
