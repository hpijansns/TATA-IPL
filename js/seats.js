import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    const stadium = document.getElementById("stadium");
    const matchId = localStorage.getItem('matchId');

    // --- 1. INITIAL DATA SETUP ---
    window.sPrice = 0; 
    window.sQty = 1;   
    window.sType = "None";

    // --- 2. FIREBASE DATA SYNC & IMAGE HIDE ---
    if (matchId && db) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Update Title
                if (matchTitleEl) matchTitleEl.innerText = data.title || "Match Details";
                
                // Hide Old Static Image because we have SVG now
                if (venueImgEl) venueImgEl.style.display = 'none';
            }
        } catch (e) {
            console.log("Firebase sync skipped, loading offline stadium layout.");
            if (venueImgEl) venueImgEl.style.display = 'none';
        }
    }

    // --- 3. DYNAMIC STADIUM LAYOUT GENERATION ---
    if (stadium) {
        const cx = 250;
        const cy = 250;
        const outerOuter = 240;
        const outerInner = 177; 
        const innerOuter = 175; 
        const innerInner = 125; 

        window.selectedSeats = [];
        window.allArcPaths = [];

        // 🔥 PRICE MATCHING LOGIC (Cards ke hisab se set kiya hai)
        function getPriceForBlock(blockName) {
            if (blockName.includes("CLUB HOUSE UPPER")) return 3999; // Skybox
            if (blockName.includes("CLUB HOUSE LOWER")) return 2599; // Corporate Box
            if (blockName.includes("J BLOCK") || blockName.includes("E BLOCK")) return 1599; // Pavilion Stand
            if (blockName.includes("1")) return 999; // Premium Stand (H1, G1, etc)
            return 599; // General Stand (H, G, F, etc)
        }

        // ARC DRAWING FUNCTION
        function drawArc(start, end, outerR, innerR, color, label) {
            const rad = Math.PI / 180;
            const largeArc = (end - start) > 180 ? 1 : 0;

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
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            
            path.setAttribute("d", pathData);
            path.setAttribute("fill", color);

            window.allArcPaths.push({ path, color, label });
            path.style.cursor = "pointer";

            const isSeat = label.match(/[A-Z]\d+/);

            // ON CLICK LOGIC FOR MAP
            path.addEventListener("click", () => {
                
                // Agar pehle se selected hai, toh deselect karo
                if (path.classList.contains("active")) {
                    path.classList.remove("active");
                    window.selectedSeats = [];
                    window.allArcPaths.forEach(obj => {
                        obj.path.classList.remove("active");
                        obj.path.setAttribute("fill", obj.color);
                    });
                    
                    window.sType = "None";
                    window.sPrice = 0;
                    document.getElementById('res-type').innerText = "None";
                    document.getElementById('res-price').innerText = "₹0";
                    const btn = document.getElementById('final-btn');
                    if(btn) {
                        btn.disabled = true;
                        btn.classList.remove('active');
                        btn.innerText = "Select a Seat";
                    }
                    if(window.refreshTotal) window.refreshTotal();
                    return;
                }

                // Deselect everything else
                window.allArcPaths.forEach(obj => {
                    obj.path.classList.remove("active");
                    obj.path.setAttribute("fill", "#d3d3d3");
                });

                // Select current
                path.classList.add("active");
                if (isSeat) {
                    path.setAttribute("fill", "#2ecc71"); // Green for selected
                } else {
                    path.setAttribute("fill", color);
                }
                window.selectedSeats = [label];
                
                // Get Clean Block Name
                let blockName = label;
                if(label.includes('\n')) blockName = label.split('\n')[0];
                
                const blockPrice = getPriceForBlock(blockName);
                
                // Deselect HTML Cards
                document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
                
                // Update Variables
                window.sType = blockName;
                window.sPrice = blockPrice;

                // Update UI Texts
                const resTypeEl = document.getElementById('res-type');
                const resPriceEl = document.getElementById('res-price');
                if(resTypeEl) resTypeEl.innerText = blockName;
                if(resPriceEl) resPriceEl.innerText = `₹${blockPrice.toLocaleString('en-IN')}`;
                
                // Enable Button
                const btn = document.getElementById('final-btn');
                if(btn) {
                    btn.disabled = false;
                    btn.classList.add('active');
                    btn.innerText = "Continue to Payment";
                }

                if(window.refreshTotal) window.refreshTotal();
            });

            // ADD TEXT TO ARCS
            const mid = (start + end) / 2;
            const tx = cx + ((outerR + innerR) / 2) * Math.cos(mid * rad);
            const ty = cy + ((outerR + innerR) / 2) * Math.sin(mid * rad);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("fill", "white");
            text.setAttribute("font-size", "7");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("transform", `rotate(${mid + 90}, ${tx}, ${ty})`);

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
                tspan.setAttribute("dy", i === 0 ? "0" : "8");
                tspan.textContent = line;
                text.appendChild(tspan);
            });

            g.appendChild(path);
            g.appendChild(text);
            stadium.appendChild(g);
        }

        // --- STADIUM BLOCKS & SIZES ---
        const sizeA = 18, sizeB = 28, sizeC = 30, sizeD = 36;
        const gapSmall = 0.5, gapNormal = 0.5;

        const segments = [
            { group: 'C', outer: "J BLOCK", outerLabel: "J BLOCK\n(JOY PAVILION)", fullHeight: true, gap: gapSmall },
            { group: 'A', outer: "H1 BLOCK", inner: "H BLOCK", outerLabel: "H1 BLOCK\n(JOY PAVILION)", innerLabel: "H BLOCK\n(JOY PAVILION)", gap: gapSmall },
            { group: 'A', outer: "G1 BLOCK", inner: "G BLOCK", outerLabel: "G1 BLOCK\n(VIDA PAVILION)", innerLabel: "G BLOCK\n(VIDA PAVILION)", gap: gapSmall },
            { group: 'A', outer: "F1 BLOCK", inner: "F BLOCK", outerLabel: "F1 BLOCK\n(JIO PAVILION)", innerLabel: "F BLOCK\n(JIO PAVILION)", gap: gapSmall },
            { group: 'C', outer: "E BLOCK", outerLabel: "E BLOCK\n(BKT TYRES)", fullHeight: true, gap: gapSmall },
            { group: 'D', outer: "D1 BLOCK", inner: "D BLOCK", outerLabel: "D1 BLOCK\n(VIDA PAVILION)", innerLabel: "D BLOCK\n(VIDA)", gap: gapNormal },
            { group: 'B', outer: "C1 BLOCK", inner: "C BLOCK", outerLabel: "C1 BLOCK\n(RR KABEL)", innerLabel: "C BLOCK\n(RR KABEL)", gap: gapNormal },
            { group: 'B', outer: "B1 BLOCK", inner: "B BLOCK", outerLabel: "B1 BLOCK\n(BKT TYRES)", innerLabel: "B BLOCK\n(BKT TYRES)", gap: gapNormal },
            { group: 'B', outer: "K1 BLOCK", inner: "K BLOCK", outerLabel: "K1 BLOCK\n(JIO PAVILION)", innerLabel: "K BLOCK\n(JIO)", gap: gapNormal },
            { group: 'B', outer: "L1 BLOCK", inner: "L BLOCK", outerLabel: "L1 BLOCK\n(JAC OLIVOL)", innerLabel: "L BLOCK\n(JAC OLIVOL)", gap: gapNormal },
            { group: 'B', outer: "CLUB HOUSE UPPER TIER", inner: "CLUB HOUSE LOWER TIER", outerLabel: "CLUB HOUSE UPPER", innerLabel: "CLUB HOUSE LOWER", gap: gapNormal }
        ];

        // ANGLE CALCULATIONS
        const countA = segments.filter(s => s.group === 'A').length;
        const countB = segments.filter(s => s.group === 'B').length;
        const countC = segments.filter(s => s.group === 'C').length;
        const countD = segments.filter(s => s.group === 'D').length;
        const totalGap = segments.reduce((sum, s) => sum + (s.gap || 0), 0);
        const angleAvailable = 360 - totalGap;
        const totalUnits = countA * sizeA + countB * sizeB + countC * sizeC + countD * sizeD;
        const anglePerUnit = angleAvailable / totalUnits;

        segments.forEach(s => {
            if (s.group === 'A') s.finalAngle = sizeA * anglePerUnit;
            if (s.group === 'B') s.finalAngle = sizeB * anglePerUnit;
            if (s.group === 'C') s.finalAngle = sizeC * anglePerUnit;
            if (s.group === 'D') s.finalAngle = sizeD * anglePerUnit;
        });

        // COLORS
        const colors = {
            "J BLOCK": "#7d3c98",
            "H1 BLOCK": "#ff2d95", "H BLOCK": "#6c3483",
            "G1 BLOCK": "#ff2d95", "G BLOCK": "#1f8a9b",
            "F1 BLOCK": "#8e44ad", "F BLOCK": "#1f8a9b",
            "E BLOCK": "#8e44ad",
            "D1 BLOCK": "#1da1c2", "D BLOCK": "#6c3483",
            "C1 BLOCK": "#ff2d95", "C BLOCK": "#1f8a9b",
            "B1 BLOCK": "#7d3c98", "B BLOCK": "#a569bd",
            "K1 BLOCK": "#ff2d95", "K BLOCK": "#1f8a9b",
            "L1 BLOCK": "#7d3c98", "L BLOCK": "#00b3b3",
            "CLUB HOUSE UPPER TIER": "#ff8800",
            "CLUB HOUSE LOWER TIER": "#1e7d32"   
        };

        const seatConfig = {
            "B BLOCK": 5, "C BLOCK": 4, "K BLOCK": 5, "L BLOCK": 4,
        };

        // START DRAWING MAP
        let currentAngle = -90;
        segments.forEach(seg => {
            const gap = seg.gap || 0;
            const start = currentAngle + gap / 2;
            const end = currentAngle + seg.finalAngle - gap / 2;

            let customOuterInner = outerInner;
            if (seg.inner && seatConfig[seg.inner]) {
                customOuterInner = outerInner + 25; 
            }

            if (seg.fullHeight && seg.outer) {
                drawArc(start, end, outerOuter, innerInner, colors[seg.outer], seg.outerLabel || seg.outer);
            } else {
                if (seg.outer) drawArc(start, end, outerOuter, customOuterInner, colors[seg.outer], seg.outerLabel || seg.outer);
                if (seg.inner) drawArc(start, end, innerOuter, innerInner, colors[seg.inner], seg.innerLabel || seg.inner);
            }

            // Draw small seat lines
            if (seg.inner && seatConfig[seg.inner]) {
                const seatCount = seatConfig[seg.inner];
                const seatGap = 0.7; 
                const seatAngle = (seg.finalAngle - seatGap * (seatCount - 1)) / seatCount;
                let seatStart = start;
                const seatBandHeight = 20; 
                const seatBandOuter = outerInner + 22; 
                const seatBandInner = seatBandOuter - seatBandHeight;
                for (let i = 0; i < seatCount; i++) {
                    const seatEnd = seatStart + seatAngle;
                    drawArc(seatStart, seatEnd, seatBandOuter, seatBandInner, "#d3d3d3", `${seg.inner[0]}${i + 1}`);
                    seatStart = seatEnd + seatGap;
                }
            }
            currentAngle += seg.finalAngle + gap;
        });

        // DRAW GROUND & PITCH
        const ground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ground.setAttribute("cx", cx);
        ground.setAttribute("cy", cy);
        ground.setAttribute("r", 120); 
        ground.setAttribute("fill", "#1e7d32");
        stadium.appendChild(ground);

        const pitchWidth = 10; 
        const pitchHeight = 50; 
        const pitch = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        pitch.setAttribute("x", cx - pitchWidth / 2);
        pitch.setAttribute("y", cy - pitchHeight / 2);
        pitch.setAttribute("width", pitchWidth);
        pitch.setAttribute("height", pitchHeight);
        pitch.setAttribute("fill", "#ffffff");
        pitch.setAttribute("stroke", "#e0e0e0");
        pitch.setAttribute("stroke-width", 0.5);
        stadium.appendChild(pitch);
    }

    // --- 4. GLOBAL CALCULATIONS & LOGIC ---

    // Backup if HTML cards are clicked
    window.setSeat = (name, price, el) => {
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
        if(el) el.classList.add('selected');
        
        window.sType = name;
        window.sPrice = price;
        
        document.getElementById('res-type').innerText = name;
        document.getElementById('res-price').innerText = `₹${price.toLocaleString('en-IN')}`;
        
        const btn = document.getElementById('final-btn');
        if(btn) {
            btn.disabled = false;
            btn.classList.add('active');
            btn.innerText = "Continue to Payment";
        }
        
        // Reset map selection visually
        if (window.allArcPaths) {
            window.allArcPaths.forEach(obj => {
                obj.path.classList.remove("active");
                obj.path.setAttribute("fill", obj.color);
            });
        }

        if(window.refreshTotal) window.refreshTotal();
    };

    window.updateQty = (val) => {
        let n = window.sQty + val;
        if(n > 10) { alert("Maximum 10 seats allowed per transaction."); return; }
        if(n < 1) return; 
        window.sQty = n;
        document.getElementById('res-qty').innerText = n;
        if(window.refreshTotal) window.refreshTotal();
    };

    window.refreshTotal = function() {
        const total = window.sQty * window.sPrice;
        document.getElementById('res-total').innerText = `₹${total.toLocaleString('en-IN')}`;
        localStorage.setItem("finalPrice", total); 
        localStorage.setItem("selectedSeatType", window.sType);
        localStorage.setItem("seatQuantity", window.sQty);
    }

    window.goNext = () => { 
        if(window.sPrice > 0) {
            window.location.href = "payment.html"; 
        } else {
            alert("Please select a seat category first!");
        }
    };
});
