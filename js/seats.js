import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const bubblesContainer = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');
    const popup = document.getElementById('seat-popup');

    let selectedSeats = 1;

    // 🚲 Vehicle Icons
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

    // ==========================================
    // 1. 🟢 GENERATE BUBBLES IMMEDIATELY
    // ==========================================
    // Bina kisi data ka wait kiye sabse pehle numbers load karo
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
                if (vehicleImg) vehicleImg.src = vehicles[i];
                selectedSeats = i;
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 2. 🔵 LOAD DATA (LOCAL + FIREBASE SYNC)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    // LocalStorage se data uthao (Immediate)
    if (rawData) {
        const match = JSON.parse(rawData);
        if (matchTitle) matchTitle.innerText = match.title || "Select Seats";
        if (venueImg) venueImg.src = match.venue_img || match.banner || "";
    }

    // Firebase se Fresh Data Sync karo (Background mein)
    if (matchId) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (venueImg && data.venue_img) venueImg.src = data.venue_img;
                if (matchTitle && data.title) matchTitle.innerText = data.title;
            }
        } catch (err) {
            console.error("Firebase Sync Fail:", err);
        }
    }

    // ==========================================
    // 3. 🟡 BUTTONS LOGIC
    // ==========================================
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (popup) popup.classList.remove('active');
            console.log("Seats Selected:", selectedSeats);
        };
    }
});
