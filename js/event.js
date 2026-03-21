import { ref, get } from './firebase.js';

const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');

const popup = document.getElementById('tnc-modal');
const box = document.getElementById('popup-box');

const matchId = localStorage.getItem('selectedMatch');

let startY = 0;

// ❌ NO MATCH
if (!matchId) {
    container.innerHTML = `<div class="loading">No Match Found</div>`;
}

// 🔥 FETCH MATCH DATA
get(ref('matches/' + matchId)).then((snap) => {

    const m = snap.val();

    if (!m) {
        container.innerHTML = `<div class="loading">No Data Found</div>`;
        return;
    }

    const teams = m.title.split(' vs ');

    container.innerHTML = `
    
    <!-- 🔥 BANNER -->
    <div style="padding:16px">
        <img src="${m.banner}" style="width:100%; border-radius:10px;">
    </div>

    <!-- TAG -->
    <div style="padding:0 16px;">
        <span style="background:#eee; padding:4px 8px; font-size:10px; border-radius:4px;">
            Cricket
        </span>
    </div>

    <!-- 🔥 INTEREST BOX -->
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

    <!-- 🔥 DETAILS -->
    <div class="event-details-list">
        <div>📅 ${m.date}</div>
        <div>⏰ ${m.time}</div>
        <div>⏳ 5 Hours</div>
        <div>👶 Age Limit - 2yrs +</div>
        <div>🌐 Hindi, English</div>
        <div>📍 ${m.venue}</div>
    </div>

    <!-- 🔥 EXPLORE -->
    <div class="explore-banner">
        <span>EXPLORE THE TOURNAMENT HOMEPAGE</span>
        <span>➤</span>
    </div>

    <!-- 🔥 LIMIT -->
    <div class="limit-info-bar">
        Ticket limit for this booking is 10
    </div>

    <!-- 🔥 ABOUT -->
    <div class="about-section">
        <h3>About The Event</h3>
        <p>
            Witness an exciting IPL match between 
            <b>${teams[0]}</b> and <b>${teams[1]}</b>.
        </p>
    </div>

    <!-- 🔥 T&C LINK -->
    <div class="tnc-link" onclick="openTnc()">
        <span>Terms & Conditions</span>
        <span>➤</span>
    </div>
    `;

    // FOOTER SHOW
    footer.style.display = "flex";
    priceBox.innerText = `₹${m.price} onwards`;
});


// 🔥 OPEN POPUP
window.openTnc = () => {
    popup.classList.add('active');
};


// 🔥 CLOSE POPUP
function closePopup() {
    popup.classList.remove('active');
    box.style.transform = 'translateY(0)';
}

// CLOSE BUTTON
document.getElementById('close-popup').onclick = closePopup;

// OUTSIDE CLICK
popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
});

// ACCEPT → REDIRECT
document.getElementById('accept-tnc-btn').onclick = () => {
    closePopup();

    // Pixel track
    if (typeof fbq !== "undefined") {
        fbq('track', 'InitiateCheckout');
    }

    setTimeout(() => {
        window.location.href = "seats.html";
    }, 200);
};


// 🔥 BOOK BUTTON → OPEN POPUP
document.getElementById('book-now-btn').onclick = () => {
    openTnc();
};


// 🔥 SWIPE DOWN CLOSE (MOBILE FEEL)
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
