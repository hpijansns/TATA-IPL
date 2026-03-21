import { db, ref, onValue } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('match-list');

    if (!container) return;

    onValue(ref(db, 'matches'), (snapshot) => {

        const data = snapshot.val();

        container.innerHTML = '';

        if (!data) {
            container.innerHTML = "<div class='loading'>No matches found</div>";
            return;
        }

        Object.keys(data).forEach((id) => {

            const m = data[id];

            container.innerHTML += `
                <div class="timeline-row" onclick="window.location.href='event.html?id=${id}'">

                    <div class="timeline-left">
                        <div class="date-val">${new Date(m.date).getDate()}</div>
                        <div class="month-val">${new Date(m.date).toLocaleString('default',{month:'short'})}</div>
                        <div class="day-val">${new Date(m.date).toLocaleString('default',{weekday:'short'})}</div>
                        <div class="city-val">${m.venue.split(':')[1] || ''}</div>
                    </div>

                    <div class="timeline-right">
                        <div class="match-label">TATA IPL</div>

                        <div class="teams-vs-ui">
                            <div class="team-ui">
                                <img src="${m.team1}">
                                <span>${m.title.split('vs')[0]}</span>
                            </div>

                            <div class="vs-circle">VS</div>

                            <div class="team-ui">
                                <img src="${m.team2}">
                                <span>${m.title.split('vs')[1]}</span>
                            </div>
                        </div>

                        <div class="venue-time">
                            ${m.time} | ${m.venue}
                        </div>

                        <div class="action-link">
                            ₹${m.price} onwards →
                        </div>
                    </div>

                </div>
            `;
        });

    });

});
