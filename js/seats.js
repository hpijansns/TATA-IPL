// ⚠️ Dhyaan dein: Agar ye import fail hua toh niche ka code nahi chalega.
// Check karein ki firebase.js usi folder mein hai jahan seats.js hai.
import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Seats Page Logic Started ✅");

    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const popup = document.getElementById('seat-popup');

    // ==========================================
    // 🟢 STEP 1: LOAD FROM LOCAL STORAGE (FAST & TESTED)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    
    if (rawData) {
        try {
            const match = JSON.parse(rawData);
            console.log("Data Found:", match);

            // Title aur Price turant set karo
            if (matchTitleEl) matchTitleEl.innerText = match.title || "Match Details";
            if (priceEl) priceEl.innerText = `₹${match.price || 0} onwards`;

            // Venue Image load karo (Jo test page par chal raha tha)
            if (venueImgEl) {
                const imageUrl = match.venue_img || match.banner;
                if (imageUrl) {
                    venueImgEl.src = imageUrl;
                    venueImgEl.style.display = 'block';
                }
            }
        } catch (e) {
            console.error("Local Storage Parse Error:", e);
        }
    } else {
        console.error("LocalStorage is empty!");
    }

    // ==========================================
    // 🔵 STEP 2: NUMBERS BANAO (1-10)
    // ==========================================
    if (bubblesContainer) {
        bubblesContainer.innerHTML = ""; 
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
    // 🔴 STEP 3: FIREBASE SYNC (BACKGROUND)
    // ==========================================
    const matchId = localStorage.getItem("matchId");
    if (matchId && typeof db !== 'undefined') {
        get(ref(db, `matches/${matchId}`)).then(snap => {
            if (snap.exists()) {
                const data = snap.val();
                if (venueImgEl && data.venue_img) venueImgEl.src = data.venue_img;
            }
        }).catch(err => console.log("Firebase sync optional, working on local data."));
    }
});
