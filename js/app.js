import { ref, onValue } from './firebase.js';

const matchList = document.getElementById('match-list');
const eventTitle = document.getElementById('event-count-title');

onValue(ref('matches'), (snapshot) => {
    const data = snapshot.val();

    if (!data) {
        matchList.innerHTML = `<div class="loading">No Matches</div>`;
        return;
    }

    const matches = Object.keys(data).map(id => ({
        id,
        ...data[id]
    }));

    eventTitle.innerText = `${matches.length} Events`;
    matchList.innerHTML = '';

    matches.forEach(m => {

        const dateObj = new Date(m.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        const weekday = dateObj.toLocaleString('en-US', { weekday: 'short' });

        matchList.innerHTML += `
        
        <div class="timeline-row" onclick="goToMatch('${m.id}')">

            <!-- LEFT DATE -->
            <div class="timeline-left">
                <div class="date-val">${day}</div>
                <div class="month-val">${month}</div>
                <div class="day-val">${weekday}</div>
                <div class="city-val">${m.venue.split(':')[1] || ''}</div>
            </div>

            <!-- RIGHT CARD -->
            <div class="timeline-right">

                <div class="match-label">Match</div>

                <div class="teams-vs-ui">
                    
                    <div class="team-ui">
                        <img src="${m.team1}">
                        <span>${m.title.split(' vs ')[0]}</span>
                    </div>

                    <div class="vs-circle">VS</div>

                    <div class="team-ui">
                        <img src="${m.team2}">
                        <span>${m.title.split(' vs ')[1]}</span>
                    </div>

                </div>

                <div class="venue-time">
                    ${m.time} • ${m.venue}
                </div>

                <div class="action-link">
                    ₹${m.price} onwards →
                </div>

            </div>

        </div>
        `;
    });
});

window.goToMatch = (id) => {
    localStorage.setItem('selectedMatch', id);
    window.location.href = "event.html";
};
