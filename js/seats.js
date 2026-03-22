import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const popup = document.getElementById('seat-popup');
    const openBtn = document.getElementById('open-seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    // 1. LocalStorage se sirf ID nikaalo
    const matchId = localStorage.getItem('matchId');

    if (!matchId) {
        console.error("Match ID nahi mila! Redirecting...");
        window.location.href = "index.html";
        return;
    }

    // ==========================================
    // 🟢 DIRECT FIREBASE FETCH LOGIC
    // ==========================================
    try {
        const matchRef = ref(db, `matches/${matchId}`);
        const snapshot = await get(matchRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Title & Price Set Karo
            if (matchTitleEl) matchTitleEl.innerText = data.title || "Match Details";
            if (priceEl) priceEl.innerText = `₹${data.price || 0} onwards`;

            // 🔥 VENUE IMAGE: Sirf is page par dikhegi
            if (venueImgEl && data.venue_img) {
                venueImgEl.src = data.venue_img;
                venueImgEl.style.display = 'block'; // Hide se Show kar do
                venueImgEl.onerror = () => { venueImgEl.src = data.banner; }; // Backup
            }
        } else {
            console.log("No data found for this ID in Firebase.");
        }
    } catch (error) {
        console.error("Firebase Fetch Error:", error);
    }

    // ==========================================
    // 🔵 BUBBLES GENERATION (1 to 10)
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
    // 🔴 POPUP CONTROLS
    // ==========================================
    if (openBtn) openBtn.onclick = () => popup.classList.add('active');
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            popup.classList.remove('active');
            // Yahan se Seat Layout wale page par bhej sakte hain
            // window.location.href = "seat-layout.html"; 
        };
    }
});
