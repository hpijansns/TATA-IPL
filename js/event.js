import { ref, get } from './firebase.js';

const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');

const matchId = localStorage.getItem('selectedMatch');

// ❌ Agar match nahi mila
if (!matchId) {
    container.innerHTML = `<div class="loading">No Match Found</div>`;
}

// 🔥 FETCH DATA
get(ref('matches/' + matchId)).then((snap) => {
    const m = snap.val();

    if (!m) {
        container.innerHTML = `<div class="loading">No Data Found</div>`;
        return;
    }

    const teams = m.title.split(' vs ');

    container.innerHTML = `
    
    <!-- 🔥 TOP BANNER -->
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
                <p>Mark interested to know more about this event.</p>
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
            Witness an exciting showdown in the TATA IPL 2026 as 
            <b>${teams[0]}</b> take on <b>${teams[1]}</b>.
            Experience the thrill live in the stadium!
        </p>
        <span class="read-more">Read More</span>
    </div>

    <!-- 🔥 T&C -->
    <div class="tnc-link" onclick="openTnc()">
        <span>Terms & Conditions</span>
        <span>➤</span>
    </div>
    `;

    // 🔥 FOOTER SHOW
    footer.style.display = "flex";
    priceBox.innerText = `₹${m.price} onwards`;
});

// 🔥 T&C OPEN
window.openTnc = () => {
    document.getElementById('tnc-modal').classList.add('active');
};

// 🔥 T&C CLOSE
document.getElementById('accept-tnc-btn').onclick = () => {
    document.getElementById('tnc-modal').classList.remove('active');
};

// 🔥 BOOK NOW
document.getElementById('book-now-btn').onclick = () => {

    // Pixel Tracking
    if (typeof fbq !== "undefined") {
        fbq('track', 'InitiateCheckout');
    }

    window.location.href = "seats.html";
};
