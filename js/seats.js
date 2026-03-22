import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Elements ko target karna
    const bubblesContainer = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');

    // Default selection
    let selectedSeats = 1;

    // 🚲 Vehicles Mapping (Standard BMS Icons)
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
    // 🟢 STEP 1: GENERATE BUBBLES IMMEDIATELY
    // ==========================================
    // Yeh part bina kisi delay ke 1 to 10 numbers generate karega
    if (bubblesContainer) {
        bubblesContainer.innerHTML = ""; // Purana clear karein
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); 
            btn.innerText = i;

            btn.onclick = () => {
                // Active class toggle logic
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Vehicle Image change logic
                if (vehicleImg && vehicles[i]) {
                    vehicleImg.src = vehicles[i];
                }

                selectedSeats = i;
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
        console.log("Bubbles loaded successfully ✅");
    }

    // ==========================================
    // 🔵 STEP 2: LOAD LOCAL STORAGE DATA
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    if (rawData) {
        try {
            const match = JSON.parse(rawData);
            if (matchTitle) matchTitle.innerText = match.title || "Select Seats";
            
            // 🔥 Venue Image priority: venue_img (Map) -> banner (Poster)
            if (venueImg) {
                const mapSource = match.venue_img || match.banner || "";
                venueImg.src = mapSource;
                
                venueImg.onerror = () => {
                    venueImg.src = "https://via.placeholder.com/800x400?text=Stadium+Layout+Not+Available";
                };
            }
        } catch (e) {
            console.error("Local Data Error:", e);
        }
    }

    // ==========================================
    // 🔴 STEP 3: FIREBASE SYNC (Background)
    // ==========================================
    if (matchId) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Update Venue Map from Firebase
                if (venueImg && data.venue_img) {
                    venueImg.src = data.venue_img;
                }
                
                if (matchTitle && data.title) {
                    matchTitle.innerText = data.title;
                }

                // Update Local Cache
                localStorage.setItem('selectedMatch', JSON.stringify({ ...data, id: matchId }));
            }
        } catch (err) {
            console.error("Firebase Sync Fail:", err);
        }
    } else if (!rawData) {
        // Agar kuch nahi milta toh wapas bhej do
        window.location.href = "index.html";
    }

    // ==========================================
    // 🟡 STEP 4: POPUP & CONFIRM BUTTONS
    // ==========================================
    const openBtn = document.getElementById('open-seat-popup');
    if (openBtn) {
        openBtn.onclick = () => {
            if (popup) popup.classList.add('active');
        }
    }

    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            if (popup) popup.classList.remove('active');
            
            // Alert for testing
            console.log("Proceeding with:", selectedSeats, "seats");
            // window.location.href = "checkout.html";
        };
    }
});
