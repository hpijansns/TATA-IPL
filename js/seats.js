import { db, ref, get } from "./firebase.js";

// Yeh function page load hote hi sabse pehle chalega
document.addEventListener("DOMContentLoaded", () => {

    const bubblesContainer = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');
    const popup = document.getElementById('seat-popup');

    // 🚲 Vehicle Icons Links
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
    // 1. 🟢 NUMBERS (BUBBLES) GENERATION
    // ==========================================
    // Yeh part sabse pehle chalna chahiye
    if (bubblesContainer) {
        bubblesContainer.innerHTML = ""; // Clear existing
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active');
            btn.innerText = i;

            btn.onclick = () => {
                // Sabse active class hatao
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                // Clicked wale par active class lagao
                btn.classList.add('active');

                // Image change logic
                if (vehicleImg && vehicles[i]) {
                    vehicleImg.src = vehicles[i];
                }
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
        console.log("Bubbles Generated ✅");
    }

    // ==========================================
    // 2. 🔵 LOCAL DATA LOAD (Title & Image)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    if (rawData) {
        const match = JSON.parse(rawData);
        if (matchTitle) matchTitle.innerText = match.title || "Select Seats";
        
        // Venue Image Setting
        if (venueImg) {
            venueImg.src = match.venue_img || match.banner || "";
            venueImg.onerror = () => {
                venueImg.src = "https://via.placeholder.com/800x400?text=Venue+Map+Not+Available";
            };
        }
    }

    // ==========================================
    // 3. 🔴 FIREBASE SYNC (Background)
    // ==========================================
    if (matchId) {
        // Direct promise based get taaki code block na ho
        get(ref(db, `matches/${matchId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (venueImg && data.venue_img) {
                    venueImg.src = data.venue_img;
                }
                if (matchTitle && data.title) {
                    matchTitle.innerText = data.title;
                }
            }
        }).catch(err => console.log("Firebase Sync Error", err));
    }

    // ==========================================
    // 4. 🟡 BUTTON LOGIC
    // ==========================================
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (popup) popup.classList.remove('active');
            alert("Seats selected successfully!");
        };
    }
});
