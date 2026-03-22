import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Seats Page Initialized...");

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

    // ==========================================
    // 🟢 STEP 1: LOAD FROM LOCALSTORAGE (IMMEDIATE)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    const matchId = localStorage.getItem('matchId');

    if (rawData) {
        try {
            const match = JSON.parse(rawData);
            
            // Title & Price Update
            if (matchTitleEl) matchTitleEl.innerText = match.title || "Match Details";
            if (priceEl) priceEl.innerText = `₹${match.price || 0} onwards`;

            // 🔥 VENUE IMAGE LOAD (Jo test page par chal raha tha)
            if (venueImgEl) {
                const imageUrl = match.venue_img || match.banner;
                if (imageUrl) {
                    venueImgEl.src = imageUrl;
                    venueImgEl.style.display = 'block';
                }
            }
        } catch (e) {
            console.error("Local Storage Error:", e);
        }
    }

    // ==========================================
    // 🔵 STEP 2: GENERATE BUBBLES (1-10)
    // ==========================================
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
                if (vehicleImg) vehicleImg.src = vehicles[i] || vehicles[6];
                localStorage.setItem("seatQty", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 🔴 STEP 3: FIREBASE SYNC (OPTIONAL/BACKGROUND)
    // ==========================================
    // Ise try-catch mein rakha hai taaki error aane par image gayab na ho
    if (matchId && db) {
        try {
            get(ref(db, `matches/${matchId}`)).then(snapshot => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    // Sirf agar database mein nayi image hai toh hi update karein
                    if (venueImgEl && data.venue_img) {
                        venueImgEl.src = data.venue_img;
                        venueImgEl.style.display = 'block';
                    }
                }
            }).catch(err => console.log("Firebase sync skipped, showing local image."));
        } catch (err) {
            console.log("Firebase not connected.");
        }
    }
});
