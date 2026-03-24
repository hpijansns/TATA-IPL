// DHYAN DEIN: Import mein 'push' aur 'set' add kiya gaya hai
import { db, ref, onValue, push, set } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const matchList = document.getElementById('match-list');  
    const eventTitle = document.getElementById('event-count-title');  
    const sortFilter = document.getElementById('sort-filter');  

    if (!matchList) return;  

    let matchesData = [];  

    // ==========================================
    // 🔥 FETCH FROM FIREBASE (Realtime + Auto-Filter & Sort)
    // ==========================================
    onValue(ref(db, 'matches'), (snapshot) => {  

        matchList.innerHTML = '';  
        const data = snapshot.val();  

        if (!data) {  
            matchList.innerHTML = `<div class="loading">No Matches Found</div>`;  
            if (eventTitle) eventTitle.innerText = `0 Events`;
            return;  
        }  

        let allMatches = Object.keys(data).map(id => ({  
            id,  
            ...data[id]  
        }));  

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const upcomingMatches = allMatches.filter(match => {
            const matchDate = new Date(match.date);
            matchDate.setHours(0, 0, 0, 0);
            return matchDate >= today; 
        });

        upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        matchesData = upcomingMatches;  
        renderMatches(upcomingMatches);  
    });

    if (sortFilter) {
        sortFilter.addEventListener('change', () => {  
            let sorted = [...matchesData];  
            if (sortFilter.value === 'price-asc') {  
                sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));  
            } else {  
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));  
            }  
            renderMatches(sorted);  
        });
    }

    // ==========================================
    // 🔥 RENDER FUNCTION
    // ==========================================
    function renderMatches(matches) {  

        matchList.innerHTML = '';  
        if (eventTitle) eventTitle.innerText = `${matches.length} Events`;  

        matches.forEach(match => {  

            const date = new Date(match.date);  
            const day = date.getDate() || '';  
            const month = date.toLocaleString('default', { month: 'short' });  
            const week = date.toLocaleString('default', { weekday: 'short' });  

            const venueString = match.venue || '';
            let stadiumName = venueString;
            let cityName = '';
            
            if (venueString.includes(',')) {
                const parts = venueString.split(',');
                stadiumName = parts[0].trim();
                cityName = parts[1].trim();
            } else if (venueString.includes(':')) {
                const parts = venueString.split(':');
                stadiumName = parts[0] ? parts[0].trim() : '';
                cityName = parts[1] ? parts[1].trim() : '';
            }

            const div = document.createElement('div');  
            div.className = 'timeline-row';  

            div.innerHTML = `  
                <div class="timeline-left">  
                    <div class="date-val">${day}</div>  
                    <div class="month-val">${month}</div>  
                    <div class="day-val">${week}</div>  
                    <div class="city-val" style="font-size: 11px; color: #888; margin-top: 4px; font-weight: 500;">${cityName}</div>  
                </div>  

                <div class="timeline-right">  
                    <div class="match-label">Match</div>  
                    <div class="teams-vs-ui">  
                        <div class="team-ui">  
                            <img src="${match.team1 || ''}" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${(match.title || '').split(' vs ')[0] || 'Team A'}</span>  
                        </div>  
                        <div class="vs-circle">VS</div>  
                        <div class="team-ui">  
                            <img src="${match.team2 || ''}" onerror="this.src='https://via.placeholder.com/50'">
                            <span>${(match.title || '').split(' vs ')[1] || 'Team B'}</span>  
                        </div>  
                    </div>  
                    <div class="venue-time" style="font-size: 12px; color: #555; margin-top: 10px;">  
                        ${match.time || ''} • ${stadiumName}  
                    </div>  
                    <div class="action-link" style="color: #f84464; font-size: 13px; font-weight: 600; margin-top: 8px;">₹${match.price || 0} Fast Filling. Book Now &gt;</div>  
                </div>  
            `;  

            // ==========================================
            // 🔥 MODAL OPEN & LEAD CAPTURE LOGIC 🔥
            // ==========================================
            div.addEventListener('click', () => {  
                const cleanMatch = {
                    id: match.id || "", title: match.title || "TBC vs TBC",
                    banner: match.banner || "", venue_img: match.venue_img || "",  
                    date: match.date || "", time: match.time || "",
                    venue: match.venue || "", price: match.price || 0,
                    team1: match.team1 || "", team2: match.team2 || ""
                };

                // Match ka data save karo
                localStorage.setItem('selectedMatch', JSON.stringify(cleanMatch));  
                localStorage.setItem('matchId', match.id);  

                // Modal Show Karo
                const modal = document.getElementById('discount-modal');
                if (modal) {
                    modal.style.display = 'flex';
                    setTimeout(() => modal.classList.add('active'), 10);
                } else {
                    window.location.href = 'event.html'; 
                }
            });

            matchList.appendChild(div);  
        });
    }

    // ==========================================
    // 🔥 DISCOUNT MODAL BUTTONS & TELEGRAM LOGIC 🔥
    // ==========================================
    const claimBtn = document.getElementById('claim-btn');
    const skipBtn = document.getElementById('skip-discount');
    const closeModalBtn = document.getElementById('close-modal');
    const errorMsg = document.getElementById('lead-error');

    // 1. CLAIM DISCOUNT BUTTON CLICK
    if(claimBtn) {
        claimBtn.addEventListener('click', async () => {
            const name = document.getElementById('lead-name').value.trim();
            const phone = document.getElementById('lead-phone').value.trim();

            if (name.length < 2 || phone.length < 10) {
                errorMsg.style.display = 'block';
                return;
            }

            errorMsg.style.display = 'none';
            claimBtn.innerText = 'Applying Discount...';
            claimBtn.classList.add('loading');

            const matchId = localStorage.getItem('matchId');
            const matchData = JSON.parse(localStorage.getItem('selectedMatch') || "{}");
            const matchTitle = matchData.title || matchId;

            // --- 🚀 FIREBASE MEIN SAVE KARO ---
            try {
                const newLeadRef = push(ref(db, 'leads')); 
                await set(newLeadRef, {
                    name: name,
                    phone: phone,
                    match_id: matchId,
                    date: new Date().toISOString(),
                    status: 'abandoned'
                });
            } catch (error) {
                console.error("Firebase error, moving on...", error);
            }

            // Save to local storage for next pages
            localStorage.setItem('customerName', name);
            localStorage.setItem('customerPhone', phone);
            localStorage.setItem('hasDiscount', 'true'); 

            // --- ✈️ TELEGRAM ALERT BHEJO ---
            const botToken = "8642950249:AAF8oxzhk-6NvYTEtpIW0oNNwsb2RQljliY"; 
            const chatId = "6820660513"; 
            
            const telegramMsg = `🚨 *NEW HOT LEAD!* 🚨%0A%0A` +
                                `👤 *Name:* ${name}%0A` +
                                `📞 *WhatsApp:* ${phone}%0A` +
                                `🏏 *Match:* ${matchTitle}%0A` +
                                `💡 *Status:* Just clicked on the match (Discount claimed)`;

            const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${telegramMsg}&parse_mode=Markdown`;

            // Telegram API call karega aur turant redirect kar dega
            fetch(url).finally(() => {
                window.location.href = 'event.html'; 
            });
        });
    }

    // 2. SKIP LOGIC
    const skipToEvent = () => {
        localStorage.setItem('hasDiscount', 'false'); 
        window.location.href = 'event.html';
    };

    if(skipBtn) skipBtn.addEventListener('click', skipToEvent);
    if(closeModalBtn) closeModalBtn.addEventListener('click', skipToEvent);

});
