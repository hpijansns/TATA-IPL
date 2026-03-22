import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    // Elements Selectors
    const matchTitleEl = document.getElementById('match-title');
    const venueImgEl = document.getElementById('venue-img');
    const priceEl = document.getElementById('display-price');
    const bubblesContainer = document.getElementById('qty-bubbles');
    const popup = document.getElementById('seat-popup');
    const openBtn = document.getElementById('open-seat-popup');
    const confirmBtn = document.getElementById('confirm-btn');

    let selectedSeats = 1;

    // ==========================================
    // 🟢 1. GENERATE BUBBLES (Sirf 1 to 10 Numbers)
    // ==========================================
    if (bubblesContainer) {
        bubblesContainer.innerHTML = ""; 
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble';
            if (i === 1) btn.classList.add('active'); // 1 Number default select rahega
            btn.innerText = i;

            btn.onclick = () => {
                // Purani active class hatao, naye par lagao
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                selectedSeats = i;
                localStorage.setItem("seatQty", i);
                console.log("Selected Seats:", i);
            };
            bubblesContainer.appendChild(btn);
        }
    }

    // ==========================================
    // 🔵 2. DIRECT FIREBASE FETCH (Match ID se)
    // ==========================================
    const matchId = localStorage.getItem('matchId');

    if (matchId && db) {
        try {
            const matchRef = ref(db, `matches/${matchId}`);
            const snapshot = await get(matchRef);

            if (snapshot.exists()) {
                const data = snapshot.val();

                // UI Update (Title & Price)
                if (matchTitleEl) matchTitleEl.innerText = data.title || "TATA IPL 2026";
                if (priceEl) priceEl.innerText = `₹${data.price || 0} onwards`;

                // Venue Image: Database se direct load hogi
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = 'block';
                    
                    venueImgEl.onerror = () => { venueImgEl.src = data.banner; };
                }
            }
        } catch (error) {
            console.error("Firebase fetch fail:", error);
        }
    }

    // ==========================================
    // 🔴 3. POPUP CONTROLS
    // ==========================================
    if (openBtn) {
        openBtn.onclick = () => popup.classList.add('active');
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            localStorage.setItem("seatQty", selectedSeats);
            popup.classList.remove('active');
            
            // Bhai, yahan se aap next page (A1, A2 selection) par bhej sakte hain
            // window.location.href = "final-seat-selection.html"; 
        };
    }
});
