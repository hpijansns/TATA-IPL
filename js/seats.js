import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const bubblesContainer = document.getElementById('qty-bubbles');
    const venueImgEl = document.getElementById('venue-img');
    const matchId = localStorage.getItem('matchId');

    // 1. Generate Bubbles
    if (bubblesContainer) {
        bubblesContainer.innerHTML = "";
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active');
            btn.innerText = i;
            btn.onclick = () => {
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // 2. Background Firebase Sync (Only if ID exists)
    if (matchId && db) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img; // Fresh update from DB
                }
            }
        } catch (e) {
            console.log("Firebase sync skipped, showing local storage image.");
        }
    }
});
