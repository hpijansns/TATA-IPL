import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    
    // Elements pakadna
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const popup = document.getElementById('seat-popup');
    const openBtn = document.getElementById('open-seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    // ==========================================
    // 🟢 STEP 1: LOAD FROM LOCAL STORAGE (FAST)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    
    if (rawData) {
        const match = JSON.parse(rawData);
        
        // 1. Title Set Karo
        if (matchTitleEl) matchTitleEl.innerText = match.title || "Match Details";
        
        // 2. Price Set Karo
        if (priceEl) priceEl.innerText = `₹${match.price || 0} onwards`;
        
        // 3. Venue Image Set Karo (Priority: venue_img -> banner)
        if (venueImgEl) {
            const imageUrl = match.venue_img || match.banner;
            if (imageUrl) {
                venueImgEl.src = imageUrl;
                venueImgEl.style.display = 'block';
            }
        }
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
    // 🔴 STEP 3: POPUP CONTROLS
    // ==========================================
    if (openBtn) {
        openBtn.onclick = () => popup.classList.add('active');
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            popup.classList.remove('active');
            // Yahan se aap next page (e.g. layout.html) par bhej sakte hain
            // window.location.href = "layout.html";
        };
    }

    // FIREBASE SYNC (Background mein agar matchId hai)
    const matchId = localStorage.getItem("matchId");
    if (matchId && db) {
        get(ref(db, `matches/${matchId}`)).then(snap => {
            if (snap.exists()) {
                const data = snap.val();
                if (venueImgEl && data.venue_img) venueImgEl.src = data.venue_img;
            }
        });
    }
});
