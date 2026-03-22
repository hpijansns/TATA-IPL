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
    // 1. LOAD DATA FIRST (LOCAL STORAGE)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    if (!rawData) {
        window.location.href = "index.html";
        return;
    }

    const match = JSON.parse(rawData);

    // Title Update
    if (matchTitle) {
        matchTitle.innerText = match.title || "Select Seats";
    }

    // 🔥 VENUE IMAGE FIX: Banner ki jagah Venue Map dikhao
    if (venueImg) {
        // Agar Firebase se venue_img aayi hai toh wo, nahi toh placeholder
        venueImg.src = match.venue_img || "https://via.placeholder.com/800x400?text=Stadium+Seating+Layout";
        
        venueImg.onerror = () => {
            venueImg.src = "https://via.placeholder.com/800x400?text=Venue+Map+Not+Available";
        };
    }

    // ==========================================
    // 2. GENERATE WORKING SEAT BUBBLES
    // ==========================================
    if (bubbles) {
        bubbles.innerHTML = ""; // Purana clear karein
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); // 1st bubble default active
            btn.innerText = i;

            // 🔥 CLICK LOGIC
            btn.addEventListener('click', () => {
                // Remove active from all
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));

                // Add active to current
                btn.classList.add('active');

                // Update Vehicle Image based on number
                if (vehicleImg && vehicles[i]) {
                    vehicleImg.src = vehicles[i];
                }

                selectedSeats = i;
                console.log("Seats Selected:", selectedSeats);
            });

            bubbles.appendChild(btn);
        }
    }

    // ==========================================
    // 3. CONFIRM & OPEN BUTTONS
    // ==========================================
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            // Save quantity for next steps
            localStorage.setItem("seatQty", selectedSeats);
            
            // Popup close karein
            if (popup) popup.classList.remove('active');
            
            console.log("Proceeding with:", selectedSeats, "seats");
            // window.location.href = "checkout.html"; // Aap yahan redirection daal sakte hain
        };
    }

    // Book Now button functionality
    const openBtn = document.getElementById('open-seat-popup');
    if (openBtn) {
        openBtn.onclick = () => {
            if (popup) popup.classList.add('active');
        };
    }

    // ==========================================
    // 4. OPTIONAL: RE-FETCH FROM FIREBASE (SYNC)
    // ==========================================
    const matchId = localStorage.getItem("matchId");
    if (matchId) {
        try {
            const snapshot = await get(ref(db, 'matches/' + matchId));
            if (snapshot.exists()) {
                const data = snapshot.val();
                // Agar Firebase mein venue_img hai toh use update karein
                if (data.venue_img && venueImg) venueImg.src = data.venue_img;
                if (data.title && matchTitle) matchTitle.innerText = data.title;
            }
        } catch (err) {
            console.log("Firebase sync failed, using LocalStorage data.");
        }
    }
});
