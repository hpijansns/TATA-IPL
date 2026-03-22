import { db, ref, onValue } from './firebase.js';

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

        // 1. Data ko Array mein convert kiya
        let allMatches = Object.keys(data).map(id => ({  
            id,  
            ...data[id]  
        }));  

        // 2. 🔥 AUTO-HIDE LOGIC: Purane matches chhupao
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const upcomingMatches = allMatches.filter(match => {
            const matchDate = new Date(match.date);
            matchDate.setHours(0, 0, 0, 0);
            return matchDate >= today; 
        });

        // 3. 🔥 AUTO-SORT LOGIC: Jo match pehle hone wala hai wo TOP par dikhega
        upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Global variable ko update kiya taaki Filter isi filtered data par chale
        matchesData = upcomingMatches;  

        renderMatches(upcomingMatches);  
    });

    // ==========================================
    // 🔥 SORT FILTER LOGIC
    // ==========================================
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {  
            let sorted = [...matchesData];  

            if (sortFilter.value === 'price-asc') {  
                // Price Low to High
                sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));  
            } else {  
                // Latest by Date
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));  
            }  

            renderMatches(sorted);  
        });
    }

    // ==========================================
    // 🔥 RENDER FUNCTION (Displaying Cards)
    // ==========================================
    function renderMatches(matches) {  

        matchList.innerHTML = '';  
        if (eventTitle) eventTitle.innerText = `${matches.length} Events`;  

        matches.forEach(match => {  

            // Date processing
            const date = new Date(match.date);  
            const day = date.getDate() || '';  
            const month = date.toLocaleString('default', { month: 'short' });  
            const week = date.toLocaleString('default', { weekday: 'short' });  

            // 🔥 Venue Split Logic (Stadium vs City)
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
            // 🔥 CLICK HANDLER (Saves all Data)
            // ==========================================
            div.addEventListener('click', () => {  

                const cleanMatch = {
                    id: match.id || "",
                    title: match.title || "TBC vs TBC",
                    banner: match.banner || "",        
                    venue_img: match.venue_img || "",  
                    date: match.date || "",
                    time: match.time || "",
                    venue: match.venue || "",
                    price: match.price || 0,
                    team1: match.team1 || "",
                    team2: match.team2 || ""
                };

                localStorage.setItem('selectedMatch', JSON.stringify(cleanMatch));  
                localStorage.setItem('matchId', match.id);  

                setTimeout(() => {
                    window.location.href = 'event.html';  
                }, 50);
            });

            matchList.appendChild(div);  
        });
    }

});
