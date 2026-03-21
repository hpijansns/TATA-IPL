import { db, ref, get } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {

    const container = document.getElementById('event-container');
    const footer = document.getElementById('event-footer');
    const priceBox = document.getElementById('event-price');
    const bookBtn = document.getElementById('book-now-btn');

    const popup = document.getElementById('tnc-modal');
    const closeBtn = document.getElementById('close-popup');
    const acceptBtn = document.getElementById('accept-tnc-btn');

    // 🔥 MATCH DATA
    let match = null;

    try {
        match = JSON.parse(localStorage.getItem('selectedMatch'));
    } catch (e) {}

    if (!match) {
        container.innerHTML = `<div class="loading">No Match Found ❌</div>`;
        return;
    }

    // 👉 ID SAVE
    if (match.id) {
        localStorage.setItem("matchId", match.id);
    }

    // 🔥 LOAD DATA (SAFE)
    let m = match;

    try {
        if (match.id) {
            const snap = await get(ref(db, 'matches/' + match.id));
            if (snap.exists()) {
                m = snap.val();
            }
        }
    } catch (e) {
        console.log("Firebase failed, using local data");
    }

    // 🔥 SAFE TEAM SPLIT
    let team1 = "Team A";
    let team2 = "Team B";

    if (m.title && m.title.includes(" vs ")) {
        const parts = m.title.split(" vs ");
        team1 = parts[0];
        team2 = parts[1];
    }

    // 🔥 UI
    container.innerHTML = `
        <div style="padding:16px">
            <img src="${m.banner || 'https://via.placeholder.com/400x200'}" style="width:100%; border-radius:10px;">
        </div>

        <div class="event-details-list">
            <div>📅 ${m.date || ''}</div>
            <div>⏰ ${m.time || ''}</div>
            <div>📍 ${m.venue || ''}</div>
        </div>

        <div class="about-section">
            <h3>${team1} vs ${team2}</h3>
            <p>Watch this exciting IPL match live!</p>
        </div>
    `;

    footer.style.display = "flex";
    priceBox.innerText = `₹${m.price || 0} onwards`;

    // 🔥 BUTTON
    bookBtn.onclick = () => {
        popup.classList.add('active');
    };

    closeBtn.onclick = () => popup.classList.remove('active');

    popup.addEventListener('click', (e) => {
        if (e.target === popup) popup.classList.remove('active');
    });

    acceptBtn.onclick = () => {
        popup.classList.remove('active');
        window.location.href = "seats.html";
    };

});
