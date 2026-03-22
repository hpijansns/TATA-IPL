import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Elements
    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');
    const popup = document.getElementById('seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');
    const openBtn = document.getElementById('open-seat-popup');

    let selectedSeats = 1;

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
    // 🟢 STEP 1: RENDER BUBBLES IMMEDIATELY
    // ==========================================
    if (bubbles) {
        bubbles.innerHTML = ""; 
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); 
            btn.innerText = i;

            btn.onclick = () => {
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (vehicleImg) vehicleImg.src = vehicles[i] || vehicles[6];
                selectedSeats = i;
                localStorage.setItem("seatQty", i);
            };
            bubbles.appendChild(btn);
        }
    }

    // ==========================================
    // 🔵 STEP 2: LOAD DATA FROM LOCAL STORAGE
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    if (rawData) {
        const match = JSON.parse(rawData);
        if (matchTitle) matchTitle.innerText = match.title || "Select Seats";
        if (venueImg) venueImg.src = match.venue_img || match.banner || "";
    }

    // ==========================================
    // 🔴 STEP 3: FIREBASE SYNC (BACKGROUND)
    // ==========================================
    if (matchId && db) {
        get(ref(db, `matches/${matchId}`)).then(snap => {
            if (snap.exists()) {
                const data = snap.val();
                if (venueImg && data.venue_img) venueImg.src = data.venue_img;
                if (matchTitle && data.title) matchTitle.innerText = data.title;
            }
        }).catch(err => console.log("Firebase Sync Fail:", err));
    }

    // ==========================================
    // 🟡 STEP 4: BUTTONS LOGIC
    // ==========================================
    if (openBtn) openBtn.onclick = () => popup.classList.add('active');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            popup.classList.remove('active');
        };
    }
});
