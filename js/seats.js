import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    // Elements Selectors
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');
    const openBtn = document.getElementById('open-seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    // 🚲 Vehicles Mapping
    const vehicles = {
        1: "https://in.bmscdn.com/webin/common/icons/bicycle.png",
        2: "https://in.bmscdn.com/webin/common/icons/scooter.png",
        3: "https://in.bmscdn.com/webin/common/icons/auto.png",
        4: "https://in.bmscdn.com/webin/common/icons/mini-car.png",
        5: "https://in.bmscdn.com/webin/common/icons/sedan-car.png",
        6: "https://in.bmscdn.com/webin/common/icons/suv-car.png",
        7: "https://in.bmscdn.com/webin/common/icons/suv-car.png",
        8: "https://in.bmscdn.com/webin/common/icons/suv-car.png",
        9: "https://in.bmscdn.com/webin/common/icons/suv-car.png",
        10: "https://in.bmscdn.com/webin/common/icons/suv-car.png"
    };

    let selectedSeats = 1;

    // ==========================================
    // 🟢 1. GENERATE BUBBLES (1 to 10)
    // ==========================================
    if (bubblesContainer) {
        bubblesContainer.innerHTML = ""; 
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); // Start with 1 active
            btn.innerText = i;

            btn.onclick = () => {
                // Change Active Style
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update Vehicle Icon
                if (vehicleImg) vehicleImg.src = vehicles[i] || vehicles[6];

                selectedSeats = i;
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 🔵 2. DIRECT FIREBASE FETCH (Bulletproof)
    // ==========================================
    const matchId = localStorage.getItem('matchId');

    if (matchId && db) {
        try {
            const matchRef = ref(db, `matches/${matchId}`);
            const snapshot = await get(matchRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("Match data loaded successfully!");

                // Title & Price Update
                if (matchTitleEl) matchTitleEl.innerText = data.title || "TATA IPL 2026";
                if (priceEl) priceEl.innerText = `₹${data.price || 0} onwards`;

                // 🔥 VENUE IMAGE: Load and Show
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = 'block';
                    
                    venueImgEl.onerror = () => { venueImgEl.src = data.banner; };
                }
            }
        } catch (error) {
            console.error("Firebase fetch fail:", error);
        }
    }

    // ==========================================
    // 🔴 3. POPUP CONTROLS
    // ==========================================
    if (openBtn) openBtn.onclick = () => popup.classList.add('active');
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            popup.classList.remove('active');
            // Yahan se aap next page (e.g., layout.html) par bhej sakte hain
            console.log("Seats confirmed:", selectedSeats);
        };
    }
});
