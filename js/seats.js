import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const popup = document.getElementById('seat-popup');
    const openBtn = document.getElementById('open-seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    // 1. LocalStorage se sirf ID uthao (Jo index.js ne save ki thi)
    const matchId = localStorage.getItem('matchId');

    if (!matchId) {
        console.error("Match ID missing! Going back to home.");
        window.location.href = "index.html";
        return;
    }

    // ==========================================
    // 🟢 STEP 1: DIRECT FIREBASE FETCH
    // ==========================================
    try {
        const matchRef = ref(db, `matches/${matchId}`);
        const snapshot = await get(matchRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Firebase Data Received:", data);

            // Title aur Price set karo
            if (matchTitleEl) matchTitleEl.innerText = data.title || "Match Details";
            if (priceEl) priceEl.innerText = `₹${data.price || 0} onwards`;

            // 🔥 VENUE IMAGE: Direct load
            if (venueImgEl && data.venue_img) {
                venueImgEl.src = data.venue_img;
                venueImgEl.style.display = 'block'; // Ab show karo
            } else if (venueImgEl) {
                venueImgEl.src = data.banner; // Fallback to banner if map missing
                venueImgEl.style.display = 'block';
            }
        }
    } catch (error) {
        console.error("Firebase Error:", error);
    }

    // ==========================================
    // 🔵 STEP 2: GENERATE BUBBLES (1-10)
    // ==========================================
    if (bubblesContainer) {
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active');
            btn.innerText = i;
            btn.onclick = () => {
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 🔴 STEP 3: CONTROLS
    // ==========================================
    if (openBtn) openBtn.onclick = () => popup.classList.add('active');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            popup.classList.remove('active');
            // Agla page layout wala yahan connect karein
            // window.location.href = "layout.html"; 
        };
    }
});
