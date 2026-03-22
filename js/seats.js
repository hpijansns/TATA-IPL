import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');

    const vehicles = {
        1: "https://in.bmscdn.com/webin/common/icons/bicycle.png",
        2: "https://in.bmscdn.com/webin/common/icons/scooter.png",
        3: "https://in.bmscdn.com/webin/common/icons/auto.png",
        4: "https://in.bmscdn.com/webin/common/icons/mini-car.png",
        5: "https://in.bmscdn.com/webin/common/icons/sedan-car.png",
        6: "https://in.bmscdn.com/webin/common/icons/suv-car.png"
    };

    // 🟢 1. NUMBERS TURANT BANAO
    if (bubbles) {
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active');
            btn.innerText = i;
            btn.onclick = () => {
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (vehicleImg) vehicleImg.src = vehicles[i] || vehicles[6];
                localStorage.setItem("seatQty", i);
            };
            bubbles.appendChild(btn);
        }
    }

    // 🔵 2. DATA LOAD KARO
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem("matchId");

    if (rawData) {
        const match = JSON.parse(rawData);
        if (matchTitle) matchTitle.innerText = match.title || "Select Seats";
        if (venueImg) venueImg.src = match.venue_img || match.banner || "";
    }

    // 🔴 3. FIREBASE SE SYNC (Background mein)
    if (matchId) {
        get(ref(db, `matches/${matchId}`)).then(snap => {
            if (snap.exists()) {
                const data = snap.val();
                if (venueImg && data.venue_img) venueImg.src = data.venue_img;
            }
        });
    }
});
