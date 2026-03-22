import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImg = document.getElementById('venue-img');
    const titleEl = document.getElementById('match-title');
    const mId = localStorage.getItem('matchId');

    // Global variables for calculations
    window.sPrice = 0;
    window.sQty = 1;
    window.sType = "None";

    if (mId) {
        try {
            const snap = await get(ref(db, `matches/${mId}`));
            if (snap.exists()) {
                const data = snap.val();
                if (titleEl) titleEl.innerText = data.title || "Match Details";
                
                // 🔥 STADIUM IMAGE LOAD
                if (venueImg && data.venue_img) {
                    venueImg.src = data.venue_img;
                    venueImg.style.display = 'block';
                }
            }
        } catch (e) { console.log("Firebase Error", e); }
    }
});

// Selection logic
window.setSeat = (name, price, el) => {
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    window.sType = name;
    window.sPrice = price;
    
    document.getElementById('res-type').innerText = name;
    document.getElementById('res-price').innerText = `₹${price}`;
    
    const btn = document.getElementById('final-btn');
    btn.disabled = false;
    btn.classList.add('active');
    btn.innerText = "Continue to Payment";

    refreshTotal();
};

window.updateQty = (val) => {
    let n = window.sQty + val;
    if (n >= 1 && n <= 10) {
        window.sQty = n;
        document.getElementById('res-qty').innerText = n;
        refreshTotal();
    }
};

function refreshTotal() {
    const total = window.sQty * window.sPrice;
    document.getElementById('res-total').innerText = `₹${total}`;
    
    // Save data
    localStorage.setItem("totalAmount", total);
    localStorage.setItem("seatQty", window.sQty);
}

window.goNext = () => {
    window.location.href = "payment.html";
};
