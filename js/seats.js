import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    const matchId = localStorage.getItem('matchId');

    // --- INITIAL DATA SETUP ---
    window.sPrice = 0; // Per ticket price
    window.sQty = 1;   // Default quantity
    window.sType = "None";

    // 1. 🔥 VENUE IMAGE LOADING (Aapka working logic)
    if (matchId && db) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // Match Title update
                if (matchTitleEl) matchTitleEl.innerText = data.title || "Match Details";
                
                // Venue Image update
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = 'block';
                }
            }
        } catch (e) {
            console.log("Firebase sync skipped, showing local storage image.");
        }
    }

    // --- SEAT SELECTION & CALCULATION LOGIC ---

    // 2. Seat Type Select Function
    window.setSeat = (name, price, el) => {
        // Purane selected card se border hatao
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
        // Naye card par border lagao
        el.classList.add('selected');

        window.sType = name;
        window.sPrice = price;

        // UI Update
        document.getElementById('res-type').innerText = name;
        document.getElementById('res-price').innerText = `₹${price}`;
        
        // Button Active Karo
        const btn = document.getElementById('final-btn');
        btn.disabled = false;
        btn.classList.add('active');
        btn.innerText = "Continue to Payment";

        refreshTotal();
    };

    // 3. Quantity Increase/Decrease (+/-)
    window.updateQty = (val) => {
        let n = window.sQty + val;
        // Limit: 1 se 10 seats
        if (n >= 1 && n <= 10) {
            window.sQty = n;
            document.getElementById('res-qty').innerText = n;
            refreshTotal();
        }
    };

    // 4. Price calculation update
    function refreshTotal() {
        const total = window.sQty * window.sPrice;
        document.getElementById('res-total').innerText = `₹${total}`;
        
        // Final Price save karo payment page ke liye
        localStorage.setItem("finalPrice", total);
        localStorage.setItem("selectedSeatType", window.sType);
        localStorage.setItem("seatQuantity", window.sQty);
    }

    // 5. Next Page Redirection
    window.goNext = () => {
        if (window.sPrice > 0) {
            window.location.href = "payment.html";
        } else {
            alert("Kripya pehle seat type select karein!");
        }
    };
});
