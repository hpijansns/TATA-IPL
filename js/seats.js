import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');

    const venueImg = document.getElementById('venue-img');
    const matchTitle = document.getElementById('match-title');

    let selectedSeats = 1;

    // =========================
    // 🔥 VEHICLES (1–10)
    // =========================
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

    // =========================
    // 🔥 CREATE SEAT BUTTONS
    // =========================
    for (let i = 1; i <= 10; i++) {

        const btn = document.createElement('div');
        btn.className = 'qty-bubble';
        btn.innerText = i;

        if (i === 1) btn.classList.add('active');

        btn.onclick = () => {

            document.querySelectorAll('.qty-bubble')
                .forEach(b => b.classList.remove('active'));

            btn.classList.add('active');

            vehicleImg.src = vehicles[i];
            selectedSeats = i;
        };

        bubbles.appendChild(btn);
    }

    // =========================
    // 🔥 CONFIRM BUTTON
    // =========================
    document.getElementById('confirm-btn').onclick = () => {
        popup.classList.remove('active');
        localStorage.setItem("seatQty", selectedSeats);
    };

    // =========================
    // 🔥 STEP 1: LOCAL DATA (FAST)
    // =========================
    let localMatch = null;

    try {
        localMatch = JSON.parse(localStorage.getItem('selectedMatch'));
    } catch {
        localMatch = null;
    }

    console.log("LOCAL DATA:", localMatch);

    if (localMatch) {

        matchTitle.innerText = localMatch.title || "Match";

        venueImg.src = localMatch.banner && localMatch.banner.startsWith("http")
            ? localMatch.banner
            : "https://via.placeholder.com/400x200?text=No+Image";
    } else {
        matchTitle.innerText = "No Match Found ❌";
    }

    // =========================
    // 🔥 STEP 2: FIREBASE (ADMIN IMAGE LOAD)
    // =========================
    const id = localStorage.getItem("matchId");

    console.log("MATCH ID:", id);

    if (id) {
        try {

            const snapshot = await get(ref(db, 'matches/' + id));

            if (snapshot.exists()) {

                const data = snapshot.val();

                console.log("FIREBASE DATA:", data);

                // ✅ FINAL OVERRIDE (ADMIN DATA)
                matchTitle.innerText = data.title || matchTitle.innerText;

                if (data.banner && data.banner.startsWith("http")) {
                    venueImg.src = data.banner;
                }

            }

        } catch (err) {
            console.log("Firebase fail → local used");
        }
    }

});
