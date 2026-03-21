import { ref, onValue } from './firebase.js';

const matchList = document.getElementById('match-list');
const eventTitle = document.getElementById('event-count-title');
const sortFilter = document.getElementById('sort-filter');

let allMatches = [];

// 🔥 FETCH DATA FROM FIREBASE
onValue(ref('matches'), (snapshot) => {
    const data = snapshot.val();

    if (!data) {
        matchList.innerHTML = `<div class="loading">No Matches Available</div>`;
        eventTitle.innerText = "0 Events";
        return;
    }

    allMatches = Object.keys(data).map(id => ({
        id,
        ...data[id]
    }));

    renderMatches(allMatches);
});

// 🔥 RENDER MATCHES (UI SAME STYLE)
function renderMatches(matches) {
    matchList.innerHTML = '';
    eventTitle.innerText = `${matches.length} Events`;

    matches.forEach(match => {
        const card = `
            <div class="timeline-card" onclick="goToMatch('${match.id}')">
                
                <div class="timeline-left">
                    <div class="date-box">
                        <span>${formatDate(match.date)}</span>
                    </div>
                </div>

                <div class="timeline-right">
                    
                    <div class="match-banner">
                        <img src="${match.banner}" alt="banner">
                    </div>

                    <div class="match-content">
                        
                        <div class="teams">
                            <img src="${match.team1}" class="team-logo">
                            <span class="vs">vs</span>
                            <img src="${match.team2}" class="team-logo">
                        </div>

                        <h4>${match.title}</h4>

                        <p class="match-info">${match.time} • ${match.venue}</p>

                        <div class="price">₹${match.price}</div>

                    </div>
                </div>
            </div>
        `;

        matchList.innerHTML += card;
    });
}

// 🔥 SORTING
sortFilter.addEventListener('change', () => {
    let sorted = [...allMatches];

    if (sortFilter.value === 'price-asc') {
        sorted.sort((a, b) => a.price - b.price);
    } else {
        sorted.reverse();
    }

    renderMatches(sorted);
});

// 🔥 DATE FORMAT (UI MATCH)
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toDateString().slice(4, 10); // e.g. Mar 28
}

// 🔥 REDIRECT
window.goToMatch = (id) => {
    localStorage.setItem('selectedMatch', id);
    window.location.href = "event.html";
};
