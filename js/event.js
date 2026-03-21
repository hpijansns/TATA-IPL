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
    // 🔥 GET MATCH FROM STORAGE
    // =========================
    let match = null;

    try {
        match = JSON.parse(localStorage.getItem('selectedMatch'));
    } catch (e) {
        match = null;
    }

    if (!match || !match.id) {
        container.innerHTML = `<div class="loading">No Match Found ❌</div>`;
        return;
    }

    // 👉 ID SAVE (IMPORTANT FOR SEATS PAGE)
    localStorage.setItem("matchId", match.id);

    // =========================
    // 🔥 FETCH FROM FIREBASE
    // =========================
    try {

        const snap = await get(ref(db, 'matches/' + match.id));

        if (!snap.exists()) {
            container.innerHTML = `<div class="loading">No Data Found ❌</div>`;
            return;
        }

        const m = snap.val();

        // SAFE SPLIT
        let team1 = "Team A";
        let team2 = "Team B";

        if (m.title && m.title.includes(' vs ')) {
            const parts = m.title.split(' vs ');
            team1 = parts[0];
            team2 = parts[1];
        }

        // =========================
        // 🔥 UI RENDER
        // =========================
        container.innerHTML = `
        
        <div style="padding:16px">
            <img src="${m.banner || 'https://via.placeholder.com/400x200?text=No+Image'}" 
                 style="width:100%; border-radius:10px;">
        </div>

        <div class="interest-box">
            <div class="interest-left">
                👍 
                <div>
                    <strong>71.7k are Interested</strong>
                    <p>Mark interested to know more</p>
                </div>
            </div>
            <button class="interested-btn">Interested?</button>
        </div>

        <div class="event-details-list">
            <div>📅 ${m.date || 'N/A'}</div>
            <div>⏰ ${m.time || 'N/A'}</div>
            <div>📍 ${m.venue || 'N/A'}</div>
        </div>

        <div class="about-section">
            <h3>About The Event</h3>
            <p>
                Witness match between 
                <b>${team1}</b> and <b>${team2}</b>.
            </p>
        </div>

        <div class="tnc-link" id="tnc-open">
            <span>Terms & Conditions</span>
            <span>➤</span>
        </div>
        `;

        // FOOTER SHOW
        if (footer) footer.style.display = "flex";
        if (priceBox) priceBox.innerText = `₹${m.price || 0} onwards`;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="loading">Error loading ❌</div>`;
    }

    // =========================
    // 🔥 POPUP HANDLING (SAFE)
    // =========================

    const tncOpen = document.getElementById('tnc-open');

    if (tncOpen) {
        tncOpen.onclick = () => popup.classList.add('active');
    }

    if (bookBtn) {
        bookBtn.onclick = () => popup.classList.add('active');
    }

    if (closeBtn) {
        closeBtn.onclick = () => popup.classList.remove('active');
    }

    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.classList.remove('active');
        });
    }

    if (acceptBtn) {
        acceptBtn.onclick = () => {
            popup.classList.remove('active');
            window.location.href = "seats.html";
        };
    }

});
