import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const bubblesContainer = document.getElementById('qty-bubbles');
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    const matchId = localStorage.getItem('matchId');

    // Default Values
    window.currentQty = 1;
    window.currentBasePrice = 1200;
    window.currentCatName = "Gold - North Stand";

    // 1. Generate Bubbles (1 to 10)
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
                window.currentQty = i;
                updateFooter();
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // 2. Firebase Sync
    if (matchId && db) {
        try {
            const snapshot = await get(ref(db, `matches/${matchId}`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (matchTitleEl) matchTitleEl.innerText = data.title || "IPL 2026";
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = 'block';
                }
            }
        } catch (e) { console.log("Firebase Error", e); }
    }
});

// Category Selection Logic
window.selectCat = function(element, price, name) {
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
    window.currentBasePrice = price;
    window.currentCatName = name;
    updateFooter();
}

// Footer Price Update Logic
function updateFooter() {
    const total = window.currentQty * window.currentBasePrice;
    document.getElementById('total-price-display').innerText = `₹${total.toLocaleString()}`;
    document.getElementById('selected-summary').innerText = `${window.currentQty} Ticket(s) • ${window.currentCatName}`;
    
    // Save for next page
    localStorage.setItem("seatQty", window.currentQty);
    localStorage.setItem("totalAmount", total);
    localStorage.setItem("selectedCategory", window.currentCatName);
}

window.proceedToFinal = function() {
    // Next page path yahan dalo
    alert("Proceeding to Seat Selection for: " + window.currentCatName);
    // window.location.href = "final-grid.html";
}
