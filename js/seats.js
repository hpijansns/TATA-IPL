// Firebase import (Path check karein: agar firebase.js aur seats.js ek hi folder mein hain toh ./ sahi hai)
import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Seats Page Logic Initialized ✅");

    const bubblesContainer = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');
    const popup = document.getElementById('seat-popup');

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
    // 🟢 1. BUBBLES TURANT BANAO (NO WAIT)
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
                if (vehicleImg) vehicleImg.src = vehicles[i];
                selectedSeats = i;
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 🔵 2. LOCAL STORAGE SE DATA LOAD KARO
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    if (rawData) {
        try {
            const match = JSON.parse(rawData);
            // Title Update
            if (matchTitle) matchTitle.innerText = match.title || "Select Seats";
            
            // Image Update (Priority: venue_img -> banner)
            if (venueImg) {
                const mapUrl = match.venue_img || match.banner || "";
                venueImg.src = mapUrl;
                venueImg.style.display = "block";
                
                venueImg.onerror = () => {
                    venueImg.src = "https://via.placeholder.com/800x400?text=Venue+Map+Not+Available";
                };
            }
            
            // Default Vehicle
            if (vehicleImg) vehicleImg.src = vehicles[1];

        } catch (e) {
            console.error("Local Data Error:", e);
        }
    }

    // ==========================================
    // 🔴 3. FIREBASE SYNC (SAFE MODE)
    // ==========================================
    // Ise try-catch mein rakha hai taaki error aane par script na ruke
    if (matchId && db) {
        try {
            get(ref(db, `matches/${matchId}`)).then(snap => {
                if (snap.exists()) {
                    const data = snap.val();
                    if (venueImg && data.venue_img) venueImg.src = data.venue_img;
                    if (matchTitle && data.title) matchTitle.innerText = data.title;
                }
            }).catch(err => console.log("Firebase sync background fail."));
        } catch (err) {
            console.log("Firebase not available.");
        }
    }

    // ==========================================
    // 🟡 4. BUTTONS
    // ==========================================
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            if (popup) popup.classList.remove('active');
            // window.location.href = "layout.html"; 
        };
    }
});
