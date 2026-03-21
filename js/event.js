import { db, ref, get } from './firebase.js';

const container = document.getElementById('event-container');

const matchId = localStorage.getItem('selectedMatchId');

console.log("MATCH ID:", matchId);

if (!matchId) {
    container.innerHTML = "❌ No Match ID Found";
}

get(ref(db, 'matches/' + matchId)).then(snap => {

    console.log("DATA:", snap.val());

    if (!snap.exists()) {
        container.innerHTML = "❌ No Data Found";
        return;
    }

    const m = snap.val();

    container.innerHTML = `
        <h2>${m.title}</h2>
        <img src="${m.banner}" width="100%">
        <p>${m.date} - ${m.time}</p>
        <p>${m.venue}</p>
    `;
});
