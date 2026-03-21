import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {

    const bubbles = document.getElementById('qty-bubbles');
    const vehicleImg = document.getElementById('vehicle-img');
    const popup = document.getElementById('seat-popup');

    const venueImg = document.getElementById('venue-img');
    const matchTitle = document.getElementById('match-title');

    let selectedSeats = 1;

    // 🔥 VEHICLES
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

    // 🔥 CREATE BUBBLES
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

    // 🔥 CONFIRM
    document.getElementById('confirm-btn').onclick = () => {
        popup.classList.remove('active');
        localStorage.setItem("seatQty", selectedSeats);
    };

    // =============================
    // 🔥 LOAD MATCH (FINAL FIX)
    // =============================

    const id = localStorage.getItem("selectedMatch");

    console.log("MATCH ID:", id);

    if (!id) {
        matchTitle.innerText = "No Match Found";
        return;
    }

    try {

        const snapshot = await get(ref(db, 'matches/' + id));
        const data = snapshot.val();

        console.log("MATCH DATA:", data);

        if (!data) {
            matchTitle.innerText = "No Data Found";
            return;
        }

        // ✅ FINAL DATA SET
        matchTitle.innerText = data.title;
        venueImg.src = data.banner;

    } catch (err) {
        console.error(err);
        matchTitle.innerText = "Error loading";
    }

});
