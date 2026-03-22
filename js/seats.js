import { db, ref, onValue } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const matchList = document.getElementById('match-list');  
    const eventTitle = document.getElementById('event-count-title');  
    const sortFilter = document.getElementById('sort-filter');  

    // Agar matchList element nahi milta toh script aage nahi chalegi
    if (!matchList) return;  

    let matchesData = [];  

    // ==========================================
    // 1. 🔥 FETCH FROM FIREBASE (Realtime)
    // ==========================================
    onValue(ref(db, 'matches'), (snapshot) => {  

        matchList.innerHTML = '<div class="loading">Loading Matches...</div>';  
        const data = snapshot.val();  

        if (!data) {  
            matchList.innerHTML = `<div class="loading">No Matches Found</div>`;  
            if (eventTitle) eventTitle.innerText = `0 Events`;
            return;  
        }  

        // Object ko Array mein convert karna IDs ke saath
        matchesData = Object.keys(data).map(id => ({  
            id,  
            ...data[id]  
        }));  

        renderMatches(matchesData);  
    });

    // ==========================================
    // 2. 🔥 SORT FILTER LOGIC
    // ==========================================
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {  
            let sorted = [...matchesData];  

            if (sortFilter.value === 'price-asc') {  
                // Price: Low to High
                sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));  
            } else {  
                // Date: Latest First
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));  
            }  

            renderMatches(sorted);  
        });
    }

    // ==========================================
    // 3. 🔥 RENDER FUNCTION (Displaying Cards)
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

            const div = document.createElement('div');  
            div.className = 'timeline-row';  

            div.innerHTML = `  
                <div class="timeline-left">  
                    <div class="date-val">${day}</div>  
                    <div class="month-val">${month}</div>  
                    <div class="day-val">${week}</div>  
                    <div class="city-val">${(match.venue || '').split(':')[1] || ''}</div>  
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

                    <div class="venue-time">  
                        ${match.time || ''} • ${match.venue || ''}  
                    </div>  

                    <div class="action-link">₹${match.price || 0} onwards →</div>  
                </div>  
            `;  

            // ==========================================
            // 🔥 CLICK HANDLER (Yahan Fix hai)
            // ==========================================
            div.onclick = () => {  

                // Saara data ek object mein "Clean" karke save karna
                const cleanMatch = {
                    id: match.id || "",
                    title: match.title || "TBC vs TBC",
                    banner: match.banner || "",        // Poster Image
                    venue_img: match.venue_img || "",  // 🔥 Stadium Map (Ab save hoga)
                    date: match.date || "",
                    time: match.time || "",
                    venue: match.venue || "",
                    price: match.price || 0,
                    team1: match.team1 || "",
                    team2: match.team2 || ""
                };

                // LocalStorage mein save karna
                localStorage.setItem('selectedMatch', JSON.stringify(cleanMatch));  
                localStorage.setItem('matchId', match.id);  

                // Redirect to event page
                window.location.href = 'event.html';  
            };

            matchList.appendChild(div);  
        });
    }

});
