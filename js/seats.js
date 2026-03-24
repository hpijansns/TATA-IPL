import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    const matchId = localStorage.getItem('matchId');

    // --- INITIAL DATA SETUP ---
    window.sPrice = 0; // Per ticket price
    window.sQty = 1;   // Default quantity
    window.sType = "None";

    // ==========================================
    // 1. 🔥 FIREBASE DATA & VENUE REPLACEMENT 🔥
    // ==========================================
    if (matchId && db) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Match Title update
                if (matchTitleEl) matchTitleEl.innerText = data.title || "Match Details";
                
                // Hide Static Image to show Dynamic SVG Layout instead
                if (venueImgEl) {
                    venueImgEl.style.display = 'none';
                }
            }
        } catch (e) {
            console.log("Firebase sync skipped, moving to local logic.");
            if (venueImgEl) venueImgEl.style.display = 'none';
        }
    }

    // ==========================================
    // 2. 🔥 DYNAMIC STADIUM LAYOUT GENERATION 🔥
    // ==========================================
    
    // Create SVG element dynamically and place it near the hidden image
    let stadium = document.getElementById("stadium");
    if (!stadium && venueImgEl) {
        stadium = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        stadium.setAttribute("id", "stadium");
        stadium.setAttribute("viewBox", "0 0 500 500");
        stadium.style.width = "100%";
        stadium.style.maxWidth = "450px";
        stadium.style.margin = "0 auto";
        stadium.style.display = "block";
        venueImgEl.parentNode.insertBefore(stadium, venueImgEl.nextSibling);
    }

    if(stadium) {
        const cx = 250;
        const cy = 250;

        const outerOuter = 240;
        const outerInner = 177; 

        const innerOuter = 175; 
        const innerInner = 125; 

        const GAP = 2;

        // 🔥 PRICE MAPPING (Yahan aap har block ka price set kar sakte ho)
        function getPriceForBlock(blockName) {
            if (blockName.includes("CLUB HOUSE UPPER")) return 5000;
            if (blockName.includes("CLUB HOUSE LOWER")) return 7000;
            if (blockName.includes("J BLOCK") || blockName.includes("E BLOCK")) return 3500;
            if (blockName.includes("1")) return 2500; // All upper blocks like H1, G1
            return 1500; // All standard lower blocks like H, G, F
        }

        window.selectedSeats = [];
        window.allArcPaths = [];

        // ✅ ARC DRAWING FUNCTION
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

            // CLICK EVENT LOGIC
            path.addEventListener("click", () => {
                // Deselect toggle
                if (path.classList.contains("active")) {
                    path.classList.remove("active");
                    window.selectedSeats = [];
                    window.allArcPaths.forEach(obj => {
                        obj.path.classList.remove("active");
                        obj.path.setAttribute("fill", obj.color);
                    });
                    
                    // Reset old pricing UI
                    window.sPrice = 0;
                    window.sType = "None";
                    document.getElementById('res-type').innerText = "None";
                    document.getElementById('res-price').innerText = "₹0";
                    const btn = document.getElementById('final-btn');
                    if(btn) {
                        btn.disabled = true;
                        btn.classList.remove('active');
                        btn.innerText = "Select a Seat First";
                    }
                    refreshTotal();
                    return;
                }

                // Deselect all others
                window.allArcPaths.forEach(obj => {
                    obj.path.classList.remove("active");
                    obj.path.setAttribute("fill", "#d3d3d3");
                });

                // Select this one
                path.classList.add("active");
                if (isSeat) {
                    path.setAttribute("fill", "#2ecc71");
                } else {
                    path.setAttribute("fill", color);
                }
                window.selectedSeats = [label];
                
                // --- BRIDGE TO PRICING LOGIC ---
                let blockName = label;
                if(label.includes('\n')) blockName = label.split('\n')[0]; // Extract "J BLOCK" from "J BLOCK\n(JOY PAVILION)"
                
                const blockPrice = getPriceForBlock(blockName);
                
                // Clear active state from HTML cards (if user has them)
                document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
                
                window.sType = blockName;
                window.sPrice = blockPrice;

                // UI Update
                const resTypeEl = document.getElementById('res-type');
                const resPriceEl = document.getElementById('res-price');
                if(resTypeEl) resTypeEl.innerText = blockName;
                if(resPriceEl) resPriceEl.innerText = `₹${blockPrice}`;
                
                // Button Active
                const btn = document.getElementById('final-btn');
                if(btn) {
                    btn.disabled = false;
                    btn.classList.add('active');
                    btn.innerText = "Continue to Payment";
                }

                refreshTotal();
            });

            // TEXT LOGIC
            const mid = (start + end) / 2;
            const tx = cx + ((outerR + innerR) / 2) * Math.cos(mid * rad);
            const ty = cy + ((outerR + innerR) / 2) * Math.sin(mid * rad);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", tx);
            text.setAttribute("y", ty);
            text.setAttribute("fill", "white"); // Made text white for better visibility
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

        // SEGMENTS SETUP
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
            { group: 'B', outer: "CLUB HOUSE UPPER", inner: "CLUB HOUSE LOWER", outerLabel: "CLUB UPPER", innerLabel: "CLUB LOWER", gap: gapNormal }
        ];

        // ANGLE ASSIGNMENT
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
            "CLUB HOUSE UPPER": "#ff8800", 
            "CLUB HOUSE LOWER": "#1e7d32"   
        };

        const seatConfig = {
            "B BLOCK": 5, "C BLOCK": 4, "K BLOCK": 5, "L BLOCK": 4,
        };

        // DRAW ALL
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

        // 🎯 CENTER GROUND
        const ground = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        ground.setAttribute("cx", cx);
        ground.setAttribute("cy", cy);
        ground.setAttribute("r", 120); 
        ground.setAttribute("fill", "#1e7d32");
        stadium.appendChild(ground);

        // 🏏 CRICKET PITCH
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

    // ==========================================
    // 3. 🔥 ORIGINAL SEAT & CALCULATION LOGIC 🔥
    // ==========================================

    // HTML Cards Backup Select Function (agar HTML cards bhi use kar rahe ho to)
    window.setSeat = (name, price, el) => {
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
        if(el) el.classList.add('selected');

        window.sType = name;
        window.sPrice = price;

        const resTypeEl = document.getElementById('res-type');
        const resPriceEl = document.getElementById('res-price');
        if(resTypeEl) resTypeEl.innerText = name;
        if(resPriceEl) resPriceEl.innerText = `₹${price}`;
        
        const btn = document.getElementById('final-btn');
        if(btn) {
            btn.disabled = false;
            btn.classList.add('active');
            btn.innerText = "Continue to Payment";
        }

        // SVG Selections Reset if user clicks HTML card
        if (window.allArcPaths) {
            window.allArcPaths.forEach(obj => {
                obj.path.classList.remove("active");
                obj.path.setAttribute("fill", obj.color);
            });
        }

        refreshTotal();
    };

    // Quantity Increase/Decrease (+/-)
    window.updateQty = (val) => {
        let n = window.sQty + val;
        if (n >= 1 && n <= 10) {
            window.sQty = n;
            const resQtyEl = document.getElementById('res-qty');
            if(resQtyEl) resQtyEl.innerText = n;
            refreshTotal();
        }
    };

    // Price calculation update
    function refreshTotal() {
        const total = window.sQty * window.sPrice;
        const resTotalEl = document.getElementById('res-total');
        if(resTotalEl) resTotalEl.innerText = `₹${total}`;
        
        localStorage.setItem("finalPrice", total);
        localStorage.setItem("selectedSeatType", window.sType);
        localStorage.setItem("seatQuantity", window.sQty);
    }

    // Next Page Redirection
    window.goNext = () => {
        if (window.sPrice > 0) {
            window.location.href = "payment.html";
        } else {
            alert("Kripya pehle seat block select karein!");
        }
    };
});
