const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');

const popup = document.getElementById('tnc-modal');
const box = document.getElementById('popup-box');

let startY = 0;

// =========================
// 🔥 GET FULL MATCH DATA
// =========================
let match = null;

try {
    match = JSON.parse(localStorage.getItem('selectedMatch'));
} catch {
    match = null;
}

console.log("EVENT MATCH:", match);

// ❌ NO MATCH
if (!match) {
    container.innerHTML = `<div class="loading">No Match Found</div>`;
} else {

    // 🔥 IMPORTANT FIX (ID SAVE FOR SEATS)
    if (match.id) {
        localStorage.setItem("matchId", match.id);
    }

    const teams = match.title.split(' vs ');

    container.innerHTML = `
    
    <div style="padding:16px">
        <img src="${match.banner}" style="width:100%; border-radius:10px;">
    </div>

    <div style="padding:0 16px;">
        <span style="background:#eee; padding:4px 8px; font-size:10px; border-radius:4px;">
            Cricket
        </span>
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
        <div>📅 ${match.date}</div>
        <div>⏰ ${match.time}</div>
        <div>⏳ 5 Hours</div>
        <div>👶 Age Limit - 2yrs +</div>
        <div>🌐 Hindi, English</div>
        <div>📍 ${match.venue}</div>
    </div>

    <div class="explore-banner">
        <span>EXPLORE THE TOURNAMENT HOMEPAGE</span>
        <span>➤</span>
    </div>

    <div class="limit-info-bar">
        Ticket limit for this booking is 10
    </div>

    <div class="about-section">
        <h3>About The Event</h3>
        <p>
            Witness an exciting IPL match between 
            <b>${teams[0]}</b> and <b>${teams[1]}</b>.
        </p>
    </div>

    <div class="tnc-link" onclick="openTnc()">
        <span>Terms & Conditions</span>
        <span>➤</span>
    </div>
    `;

    footer.style.display = "flex";
    priceBox.innerText = `₹${match.price} onwards`;
}

// =========================
// 🔥 POPUP
// =========================
window.openTnc = () => {
    popup.classList.add('active');
};

function closePopup() {
    popup.classList.remove('active');
    box.style.transform = 'translateY(0)';
}

document.getElementById('close-popup').onclick = closePopup;

popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
});

// =========================
// 🔥 ACCEPT → GO TO SEATS (FINAL FIX)
// =========================
document.getElementById('accept-tnc-btn').onclick = () => {
    closePopup();

    if (typeof fbq !== "undefined") {
        fbq('track', 'InitiateCheckout');
    }

    // 🔥 IMPORTANT (DATA SAFE PASS)
    localStorage.setItem('selectedMatch', JSON.stringify(match));

    setTimeout(() => {
        window.location.href = "seats.html";
    }, 200);
};

// =========================
// 🔥 BOOK BUTTON
// =========================
document.getElementById('book-now-btn').onclick = () => {
    openTnc();
};

// =========================
// 🔥 SWIPE CLOSE
// =========================
box.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
});

box.addEventListener('touchmove', (e) => {
    let move = e.touches[0].clientY - startY;
    if (move > 0) {
        box.style.transform = `translateY(${move}px)`;
    }
});

box.addEventListener('touchend', (e) => {
    let diff = e.changedTouches[0].clientY - startY;

    if (diff > 100) {
        closePopup();
    } else {
        box.style.transform = 'translateY(0)';
    }
});
