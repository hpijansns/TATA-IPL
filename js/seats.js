import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');

    let selectedSeats = 1;

    // ==========================================
    // 🚲 VEHICLE ICONS (1 to 10) 
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
    // 1. LOAD DATA FIRST (IMAGE & TITLE)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    if (rawData) {
        const match = JSON.parse(rawData);
        if (matchTitle) matchTitle.innerText = match.title || "Match Details";
        if (venueImg) venueImg.src = match.banner || "";
    }

    // ==========================================
    // 2. GENERATE WORKING SEAT BUBBLES
    // ==========================================
    if (bubbles) {
        bubbles.innerHTML = ""; // Pehle purana saaf karein
        
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); // By default 1 active
            btn.innerText = i;

            // 🔥 CLICK LOGIC FIXED
            btn.addEventListener('click', () => {
                // Saare bubbles se active class hatao
                document.querySelectorAll('.qty-bubble').forEach(b => {
                    b.classList.remove('active');
                });

                // Sirf clicked bubble ko active karo
                btn.classList.add('active');

                // Image change logic
                if (vehicleImg && vehicles[i]) {
                    vehicleImg.src = vehicles[i];
                }

                selectedSeats = i;
                console.log("Selected Seats:", selectedSeats);
            });

            bubbles.appendChild(btn);
        }
    }

    // ==========================================
    // 3. CONFIRM BUTTON WORKING
    // ==========================================
    const confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            // Save quantity for next page
            localStorage.setItem("seatQty", selectedSeats);
            
            // Popup band karein
            if (popup) popup.classList.remove('active');
            
            // Yahan se aap next page (Seat Layout) par bhej sakte hain
            console.log("Proceeding with seats:", selectedSeats);
            // window.location.href = "layout.html"; 
        };
    }

    // Book Now button agar page par hai toh popup kholne ke liye
    const openBtn = document.getElementById('open-seat-popup');
    if (openBtn) {
        openBtn.onclick = () => {
            if (popup) popup.classList.add('active');
        }
    }
});
