import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img'); // 🔥 Stadium Layout Image

    let selectedSeats = 1;

    // ==========================================
    // 🚲 VEHICLE ICONS (BookMyShow Style)
    // ==========================================
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
    // 1. 🔥 LOAD DATA FROM LOCAL STORAGE
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    if (rawData) {
        const match = JSON.parse(rawData);

        // Title Update
        if (matchTitle) {
            matchTitle.innerText = match.title || "Select Seats";
        }

        // Venue Image Load (Priority: venue_img)
        if (venueImg) {
            // Agar Admin panel se 'venue_img' aayi hai toh wo, warna fallback banner par
            const finalImg = match.venue_img || match.banner || "";
            venueImg.src = finalImg;
            
            venueImg.onerror = () => {
                venueImg.src = "https://via.placeholder.com/800x400?text=Venue+Map+Not+Available";
            };
        }
    }

    // ==========================================
    // 2. 🔥 FIREBASE SYNC (In case image is missing)
    // ==========================================
    if (matchId) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Update Title if changed
                if (matchTitle && data.title) matchTitle.innerText = data.title;

                // 🔥 CRITICAL: Update Venue Image from Firebase
                if (venueImg) {
                    const dbVenueImg = data.venue_img || data.banner;
                    if (dbVenueImg) {
                        venueImg.src = dbVenueImg;
                    }
                }
                
                // Keep LocalStorage updated for next steps
                localStorage.setItem('selectedMatch', JSON.stringify({ ...data, id: matchId }));
            }
        } catch (err) {
            console.error("Firebase Sync Error:", err);
        }
    } else if (!rawData) {
        // Agar kuch bhi nahi mila toh wapas bhej do
        window.location.href = "index.html";
    }

    // ==========================================
    // 3. GENERATE WORKING SEAT BUBBLES
    // ==========================================
    if (bubbles) {
        bubbles.innerHTML = ""; 
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); 
            btn.innerText = i;

            btn.addEventListener('click', () => {
                // Active class switch
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Vehicle Image update
                if (vehicleImg && vehicles[i]) {
                    vehicleImg.src = vehicles[i];
                }

                selectedSeats = i;
            });

            bubbles.appendChild(btn);
        }
    }

    // ==========================================
    // 4. CONFIRM & POPUP LOGIC
    // ==========================================
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            if (popup) popup.classList.remove('active');
            
            // Proceed to layout or payment
            // window.location.href = "layout.html"; 
        };
    }

    const openBtn = document.getElementById('open-seat-popup');
    if (openBtn) {
        openBtn.onclick = () => {
            if (popup) popup.classList.add('active');
        };
    }
});
