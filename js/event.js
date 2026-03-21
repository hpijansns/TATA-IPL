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
    // 🔥 STEP 1: GET DATA
    // =========================

    let match = null;

    try {
        match = JSON.parse(localStorage.getItem('selectedMatch'));
    } catch (e) {
        match = null;
    }

    const id = localStorage.getItem("matchId");

    console.log("MATCH:", match);
    console.log("ID:", id);

    // ❌ अगर कुछ भी नहीं मिला
    if (!match && !id) {
        container.innerHTML = `<div class="loading">No Match Found ❌</div>`;
        return;
    }

    // =========================
    // 🔥 STEP 2: TRY FIREBASE
    // =========================

    let m = match;

    try {
        if (id) {
            const snap = await get(ref(db, 'matches/' + id));
            if (snap.exists()) {
                m = snap.val();
            }
        }
    } catch (e) {
        console.log("Firebase fail → using local");
    }

    // ❌ अगर data अभी भी नहीं
    if (!m) {
        container.innerHTML = `<div class="loading">No Data Found ❌</div>`;
        return;
    }

    // =========================
    // 🔥 SAFE DATA
    // =========================

    let team1 = "Team A";
    let team2 = "Team B";

    if (m.title && m.title.includes(" vs ")) {
        const parts = m.title.split(" vs ");
        team1 = parts[0];
        team2 = parts[1];
    }

    const banner = m.banner && m.banner.startsWith("http")
        ? m.banner
        : "https://via.placeholder.com/400x200?text=No+Image";

    // =========================
    // 🔥 UI RENDER
    // =========================

    container.innerHTML = `
        <div style="padding:16px">
            <img src="${banner}" style="width:100%; border-radius:10px;">
        </div>

        <div class="event-details-list">
            <div>📅 ${m.date || 'N/A'}</div>
            <div>⏰ ${m.time || 'N/A'}</div>
            <div>📍 ${m.venue || 'N/A'}</div>
        </div>

        <div class="about-section">
            <h3>${team1} vs ${team2}</h3>
            <p>Watch this exciting IPL match live!</p>
        </div>
    `;

    footer.style.display = "flex";
    priceBox.innerText = `₹${m.price || 0} onwards`;

    // =========================
    // 🔥 BUTTONS
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
            window.location.href = "seats.html";
        };
    }

});
