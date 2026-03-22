import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    
    const bubblesContainer = document.getElementById('qty-bubbles');
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const popup = document.getElementById('seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    let selectedQty = 1;

    // ==========================================
    // 🟢 1. GENERATE NUMBERS IMMEDIATELY (Fail-Safe)
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
                selectedQty = i;
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
        console.log("Numbers generated! ✅");
    }

    // ==========================================
    // 🔵 2. LOAD DATA (Local + Firebase Sync)
    // ==========================================
    const matchId = localStorage.getItem('matchId');
    const savedMatch = localStorage.getItem('selectedMatch');

    // Pehle LocalStorage se title dikhao (Fast)
    if (savedMatch) {
        const match = JSON.parse(savedMatch);
        if (matchTitleEl) matchTitleEl.innerText = match.title || "Match Details";
        if (priceEl) priceEl.innerText = `₹${match.price || 0} onwards`;
        if (venueImgEl && (match.venue_img || match.banner)) {
            venueImgEl.src = match.venue_img || match.banner;
            venueImgEl.style.display = 'block';
        }
    }

    // Ab Firebase se latest data lo (Deep Sync)
    if (matchId && db) {
        get(ref(db, `matches/${matchId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (matchTitleEl) matchTitleEl.innerText = data.title;
                if (priceEl) priceEl.innerText = `₹${data.price || 0} onwards`;
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = 'block';
                }
            }
        }).catch(err => console.log("Firebase sync delayed."));
    }

    // ==========================================
    // 🔴 3. BUTTON ACTIONS
    // ==========================================
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedQty);
            popup.classList.remove('active');
            // Agla step yahan dalo
            // window.location.href = "final-selection.html";
        };
    }
});
