import { ref, get } from './firebase.js';

const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');
const bookBtn = document.getElementById('book-now-btn');

const tncModal = document.getElementById('tnc-modal');
const acceptBtn = document.getElementById('accept-tnc-btn');

const matchId = localStorage.getItem('selectedMatch');

// ❌ agar match select nahi hua
if (!matchId) {
    container.innerHTML = "<div class='loading'>No Match Selected</div>";
} else {
    loadMatch();
}

// 🔥 MATCH LOAD
function loadMatch() {
    get(ref('matches/' + matchId)).then((snapshot) => {
        const match = snapshot.val();

        if (!match) {
            container.innerHTML = "<div class='loading'>Match Not Found</div>";
            return;
        }

        renderMatch(match);
    }).catch(() => {
        container.innerHTML = "<div class='loading'>Error loading data</div>";
    });
}

// 🔥 UI RENDER
function renderMatch(match) {
    container.innerHTML = `
        <div class="event-banner">
            <img src="${match.banner}" style="width:100%;">
        </div>

        <div class="event-info">
            <h2>${match.title}</h2>
            <p>${match.date} | ${match.time}</p>
            <p>${match.venue}</p>

            <div class="teams" style="display:flex; align-items:center; gap:10px; margin-top:15px;">
                <img src="${match.team1}" class="team-logo">
                <span style="font-weight:bold;">VS</span>
                <img src="${match.team2}" class="team-logo">
            </div>
        </div>
    `;

    // footer show
    footer.style.display = "flex";
    priceBox.innerText = `₹${match.price} onwards`;
}

// 🔥 BOOK NOW CLICK
bookBtn.addEventListener('click', () => {
    tncModal.style.display = "flex";
});

// 🔥 ACCEPT TERMS
acceptBtn.addEventListener('click', () => {
    tncModal.style.display = "none";
    window.location.href = "seats.html";
});
