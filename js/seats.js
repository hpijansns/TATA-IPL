import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');

    const vehicles = {
        1: "https://in.bmscdn.com/webin/common/icons/bicycle.png",
        2: "https://in.bmscdn.com/webin/common/icons/scooter.png",
        3: "https://in.bmscdn.com/webin/common/icons/auto.png",
        4: "https://in.bmscdn.com/webin/common/icons/mini-car.png",
        5: "https://in.bmscdn.com/webin/common/icons/sedan-car.png",
        6: "https://in.bmscdn.com/webin/common/icons/suv-car.png"
    };

    // 1. LocalStorage se ID nikaalo
    const matchId = localStorage.getItem('matchId');

    if (!matchId) {
        console.error("No Match ID found!");
        window.location.href = 'index.html';
        return;
    }

    // 2. Numbers turant bana do (Bina wait kiye)
    if (bubblesContainer) {
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
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 🟢 DIRECT FIREBASE FETCH (Bulletproof)
    // ==========================================
    try {
        const matchRef = ref(db, `matches/${matchId}`);
        const snapshot = await get(matchRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // UI Update karein
            if (matchTitleEl) matchTitleEl.innerText = data.title || "IPL Match";
            if (priceEl) priceEl.innerText = `₹${data.price || 0} onwards`;
            
            // 🔥 VENUE IMAGE: Database se direct load
            if (venueImgEl && data.venue_img) {
                venueImgEl.src = data.venue_img;
                venueImgEl.style.display = 'block'; // Image dikhao
                
                venueImgEl.onerror = () => {
                    venueImgEl.src = data.banner; // Backup agar map na mile
                };
            }
        }
    } catch (error) {
        console.error("Firebase fetch failed:", error);
    }
});
