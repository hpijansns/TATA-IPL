import { ref, onValue } from './firebase.js';

const matchList = document.getElementById('match-list');
const eventTitle = document.getElementById('event-count-title');

onValue(ref('matches'), (snapshot) => {
    const data = snapshot.val();

    if (!data) return;

    const matches = Object.keys(data).map(id => ({
        id,
        ...data[id]
    }));

    matchList.innerHTML = '';
    eventTitle.innerText = `${matches.length} Events`;

    matches.forEach(match => {
        matchList.innerHTML += `
            <div onclick="goToMatch('${match.id}')">
                <img src="${match.banner}" style="width:100%">
                <h4>${match.title}</h4>
                <p>${match.date}</p>
                <p>₹${match.price}</p>
            </div>
        `;
    });
});

window.goToMatch = (id) => {
    localStorage.setItem('selectedMatch', id);
    window.location.href = "event.html";
};
