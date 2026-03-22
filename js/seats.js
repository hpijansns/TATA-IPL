import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    // --- HTML ELEMENTS ---
    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');
    const openPopupBtn = document.getElementById('open-seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    const venueImg = document.getElementById('venue-img');
    const matchTitle = document.getElementById('match-title');

    let selectedSeats = 1;

    // --- VEHICLES ICONS ---
    const vehicles = {
        1: "https://in.bmscdn.com/webin/common/icons/bicycle.png",
        2: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
        3: "https://cdn-icons-png.flaticon.com/512/2972/2972178.png",
        4: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
        5: "https://cdn-icons-png.flaticon.com/512/1995/1995509.png",
        6: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
        7: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
        8: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
        9: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
        10: "https://cdn-icons-png.flaticon.com/512/481/481873.png"
    };

    // ==========================================
    // 1. DATA RECOVERY (LOCAL STORAGE) - SABSE PEHLE
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    let localMatch = null;

    try {
        localMatch = rawData ? JSON.parse(rawData) : null;
    } catch (e) {
        console.error("Data error");
    }

    if (!localMatch) {
        window.location.href = "index.html"; // Agar data nahi toh wapas bhej do
        return;
    }

    // 🔥 Turant Title aur Image dikhao
    matchTitle.innerText = localMatch.title || "Match Details";
    venueImg.src = localMatch.banner || "https://via.placeholder.com/800x400?text=Venue+Image";
    
    // Image agar load na ho toh error handling
    venueImg.onerror = () => {
        venueImg.src = "https://via.placeholder.com/800x400?text=No+Image+Found";
    };

    // ==========================================
    // 2. CREATE SEAT BUBBLES (1 to 10)
    // ==========================================
    if (bubbles) {
        bubbles.innerHTML = ''; // Clear previous if any
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active');
            btn.innerText = i;

            btn.onclick = () => {
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                vehicleImg.src = vehicles[i];
                selectedSeats = i;
            };
            bubbles.appendChild(btn);
        }
    }

    // ==========================================
    // 3. POPUP CONTROLS
    // ==========================================
    
    // Book Now dabane par popup khulega
    if (openPopupBtn) {
        openPopupBtn.onclick = () => {
            popup.classList.add('active');
        };
    }

    // Confirm dabane par quantity save hogi aur popup band
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            popup.classList.remove('active');
            alert(`You selected ${selectedSeats} seats!`);
            // Yahan se aap payment ya final confirmation page par ja sakte hain
        }
    }

    // ==========================================
    // 4. FIREBASE UPDATE (EXTRA SECURITY)
    // ==========================================
    const matchId = localStorage.getItem("matchId");
    if (matchId) {
        try {
            const snapshot = await get(ref(db, 'matches/' + matchId));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data.title) matchTitle.innerText = data.title;
                if (data.banner) venueImg.src = data.banner;
            }
        } catch (err) {
            console.log("Firebase sync skipped, local data is working.");
        }
    }
});
