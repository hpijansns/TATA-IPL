import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Sare Elements ko pakadna
    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');

    // Default selection
    let selectedSeats = 1;

    // 🚲 Vehicles Mapping (Standard BookMyShow Icons)
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
    // 🟢 STEP 1: GENERATE BUBBLES (SABSE PEHLE)
    // ==========================================
    // Yeh part bina kisi delay ke 1 to 10 numbers generate karega
    if (bubbles) {
        bubbles.innerHTML = ""; // Purana saaf karein
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
            bubbles.appendChild(btn);
        }
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
            console.error("Data Parse Error:", e);
        }
    }

    // ==========================================
    // 🔴 STEP 3: FIREBASE SYNC (In Background)
    // ==========================================
    if (matchId) {
        // Direct Get taaki stadium map link fresh mil sake
        get(ref(db, `matches/${matchId}`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Update Venue Map from Firebase agar local mein nahi hai
                if (venueImg && data.venue_img) {
                    venueImg.src = data.venue_img;
                }
                
                if (matchTitle && data.title) {
                    matchTitle.innerText = data.title;
                }
                
                // Cache update for future pages
                localStorage.setItem('selectedMatch', JSON.stringify({ ...data, id: matchId }));
            }
        }).catch(err => console.error("Firebase Sync Error:", err));
    } else if (!rawData) {
        // Agar data bilkul nahi hai, tabhi bhejeb pichle page par
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
            
            // Success hone par console mein check karein
            console.log("Proceeding with seats:", selectedSeats);
            // window.location.href = "layout.html"; 
        };
    }
});
