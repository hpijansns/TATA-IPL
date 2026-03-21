import { db, ref, onValue, set, remove, push } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('match-form');
    const tableBody = document.getElementById('admin-match-list');

    const mTitle = document.getElementById('m-title');
    const mDate = document.getElementById('m-date');
    const mTime = document.getElementById('m-time');
    const mVenue = document.getElementById('m-venue');
    const mPrice = document.getElementById('m-price');
    const mTeam1 = document.getElementById('m-team1');
    const mTeam2 = document.getElementById('m-team2');
    const mBanner = document.getElementById('m-banner');

    // 🔥 SAVE (MAIN FIX)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            title: mTitle.value,
            date: mDate.value,
            time: mTime.value,
            venue: mVenue.value,
            price: mPrice.value,
            team1: mTeam1.value,
            team2: mTeam2.value,
            banner: mBanner.value
        };

        console.log("🔥 TRY SAVE:", data);

        push(ref(db, 'matches'), data)
            .then(() => {
                alert("Saved ✅");
                form.reset();
            })
            .catch((err) => {
                console.error("ERROR:", err);
                alert("Error: " + err.message);
            });
    });

});
