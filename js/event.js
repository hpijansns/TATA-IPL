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
    // 🔥 STEP 1: LOCAL DATA
    // =========================
    let match = null;

    try {
        match = JSON.parse(localStorage.getItem('selectedMatch'));
    } catch (e) {}

    if (!match) {
        container.innerHTML = `<div class="loading">No Match Found ❌</div>`;
        return;
    }

    // 👉 ID SAVE (FOR SEATS)
    if (match.id) {
        localStorage.setItem("matchId", match.id);
    }

    // =========================
    // 🔥 STEP 2: USE LOCAL DATA FIRST
    // =========================
    let m = match;

    // =========================
    // 🔥 STEP 3: TRY FIREBASE (OPTIONAL)
    // =========================
    try {
        if (match.id) {
            const snap = await get(ref(db, 'matches/' + match.id));
            if (snap.exists()) {
                m = snap.val();
            }
        }
    } catch (e) {
        console.log("Firebase failed → using local data");
    }

    // =========================
    // 🔥 STEP 4: SAFE DATA
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
    // 🔥 STEP 5: RENDER UI
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
            <p>Enjoy the live IPL match experience.</p>
        </div>
    `;

    // =========================
    // 🔥 STEP 6: FOOTER
    // =========================
    footer.style.display = "flex";
    priceBox.innerText = `₹${m.price || 0} onwards`;

    // =========================
    // 🔥 STEP 7: BUTTONS
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
