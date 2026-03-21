import { db, ref, onValue } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

const matchList = document.getElementById('match-list');  
const eventTitle = document.getElementById('event-count-title');  
const sortFilter = document.getElementById('sort-filter');  

if (!matchList) return;  

let matchesData = [];  

// =========================  
// 🔥 FETCH FROM FIREBASE  
// =========================  
onValue(ref(db, 'matches'), (snapshot) => {  

    matchList.innerHTML = '';  
    const data = snapshot.val();  

    if (!data) {  
        matchList.innerHTML = `<div class="loading">No Matches Found</div>`;  
        return;  
    }  

    matchesData = Object.keys(data).map(id => ({  
        id,  
        ...data[id]  
    }));  

    renderMatches(matchesData);  
});  

// =========================  
// 🔥 SORT FILTER  
// =========================  
sortFilter.addEventListener('change', () => {  

    let sorted = [...matchesData];  

    if (sortFilter.value === 'price-asc') {  
        sorted.sort((a, b) => a.price - b.price);  
    } else {  
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));  
    }  

    renderMatches(sorted);  
});  

// =========================  
// 🔥 RENDER FUNCTION  
// =========================  
function renderMatches(matches) {  

    matchList.innerHTML = '';  
    eventTitle.innerText = `${matches.length} Events`;  

    matches.forEach(match => {  

        const date = new Date(match.date);  
        const day = date.getDate();  
        const month = date.toLocaleString('default', { month: 'short' });  
        const week = date.toLocaleString('default', { weekday: 'short' });  

        const div = document.createElement('div');  
        div.className = 'timeline-row';  

        div.innerHTML = `  
            <div class="timeline-left">  
                <div class="date-val">${day}</div>  
                <div class="month-val">${month}</div>  
                <div class="day-val">${week}</div>  
                <div class="city-val">${match.venue.split(':')[1] || ''}</div>  
            </div>  

            <div class="timeline-right">  
                <div class="match-label">Match</div>  

                <div class="teams-vs-ui">  
                    <div class="team-ui">  
                        <img src="${match.team1}">  
                        <span>${match.title.split(' vs ')[0]}</span>  
                    </div>  

                    <div class="vs-circle">VS</div>  

                    <div class="team-ui">  
                        <img src="${match.team2}">  
                        <span>${match.title.split(' vs ')[1]}</span>  
                    </div>  
                </div>  

                <div class="venue-time">  
                    ${match.time} • ${match.venue}  
                </div>  

                <div class="action-link">₹${match.price} onwards →</div>  
            </div>  
        `;  

        // 🔥🔥🔥 FINAL FIX (IMPORTANT)
        div.addEventListener('click', () => {  

            // ✅ FULL DATA (event page ke liye)
            localStorage.setItem('selectedMatch', JSON.stringify(match));  

            // ✅ ID (seats page ke liye)
            localStorage.setItem('matchId', match.id);  

            // 👉 पहले event page खुलेगा
            window.location.href = 'event.html';  
        });  

        matchList.appendChild(div);  
    });  
}

});
