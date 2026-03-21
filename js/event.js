// ✅ Fix 1: 'import' hamesha small letters mein hona chahiye
import { db, ref, get } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {

    const container = document.getElementById('event-container');
    const footer = document.getElementById('event-footer');
    const priceBox = document.getElementById('event-price');
    const bookBtn = document.getElementById('book-now-btn');

    const popup = document.getElementById('tnc-modal');
    const closeBtn = document.getElementById('close-popup');
    const acceptBtn = document.getElementById('accept-tnc-btn');

    // =========================
    // 🔥 STEP 1: GET DATA FROM STORAGE
    // =========================
    let match = null;
    const matchId = localStorage.getItem("matchId");

    try {
        const storedData = localStorage.getItem('selectedMatch');
        if (storedData) {
            match = JSON.parse(storedData);
        }
    } catch (e) {
        console.error("JSON Parse Error", e);
    }

    // Agar na ID hai na Data, to error dikhao
    if (!match && !matchId) {
        if(container) container.innerHTML = `<div class="loading">No Match Selected ❌</div>`;
        return;
    }

    // =========================
    // 🔥 STEP 2: REFRESH FROM FIREBASE (Optional but Recommended)
    // =========================
    let m = match; // Default local data rakhein

    if (matchId) {
        try {
            const snap = await get(ref(db, 'matches/' + matchId));
            if (snap.exists()) {
                m = snap.val(); // Firebase se latest data mil gaya
                console.log("Fresh data from Firebase loaded");
            }
        } catch (e) {
            console.warn("Firebase fetch failed, using local storage");
        }
    }

    // Final check agar data mil gaya
    if (!m) {
        if(container) container.innerHTML = `<div class="loading">Data Not Found ❌</div>`;
        return;
    }

    // =========================
    // 🔥 STEP 3: RENDER UI
    // =========================
    
    // Title se team names alag karein
    let team1 = "Team A", team2 = "Team B";
    if (m.title && m.title.includes(" vs ")) {
        const parts = m.title.split(" vs ");
        team1 = parts[0];
        team2 = parts[1];
    }

    // Image fallback agar banner na ho
    const bannerImg = m.banner || "https://assets-in.bmscdn.com/promotions/cms/creatives/1706382336630_tataipl2024web.jpg";

    if (container) {
        container.innerHTML = `
            <div style="padding:16px">
                <img src="${bannerImg}" style="width:100%; border-radius:12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            </div>

            <div class="event-details-list">
                <div>📅 ${m.date || 'TBA'}</div>
                <div>⏰ ${m.time || 'TBA'}</div>
                <div>📍 ${m.venue || 'Venue TBD'}</div>
            </div>

            <div class="about-section">
                <h2 style="color:#333; margin-bottom:8px;">${team1} <span style="color:#e53935">vs</span> ${team2}</h2>
                <p style="color:#666; font-size:14px; line-height:1.5;">
                    Experience the thrill of the IPL 2026 live! Join thousands of fans for this epic clash at ${m.venue || 'the stadium'}.
                </p>
            </div>
        `;
    }

    if (footer) footer.style.display = "flex";
    if (priceBox) priceBox.innerText = `₹${m.price || 0} onwards`;

    // =========================
    // 🔥 STEP 4: BUTTON ACTIONS
    // =========================
    if (bookBtn) {
        bookBtn.onclick = () => popup.classList.add('active');
    }

    if (closeBtn) {
        closeBtn.onclick = () => popup.classList.remove('active');
    }

    if (popup) {
        popup.onclick = (e) => {
            if (e.target === popup) popup.classList.remove('active');
        };
    }

    if (acceptBtn) {
        acceptBtn.onclick = () => {
            popup.classList.remove('active');
            // Seats page par jane ke liye taiyar
            window.location.href = "seats.html";
        };
    }
});
