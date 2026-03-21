import { db } from './firebase.js';
import { ref, onValue, set, remove, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('match-form');
    const tableBody = document.getElementById('admin-match-list');

    const editIdInput = document.getElementById('edit-id');
    const mTitle = document.getElementById('m-title');
    const mDate = document.getElementById('m-date');
    const mTime = document.getElementById('m-time');
    const mVenue = document.getElementById('m-venue');
    const mPrice = document.getElementById('m-price');
    const mTeam1 = document.getElementById('m-team1');
    const mTeam2 = document.getElementById('m-team2');
    const mBanner = document.getElementById('m-banner');

    let isEditing = false;

    // ================= FETCH =================
    onValue(ref(db, 'matches'), (snapshot) => {

        tableBody.innerHTML = '';
        const matches = snapshot.val();

        if (!matches) return;

        window.allMatches = matches;

        Object.keys(matches).forEach((id) => {
            const m = matches[id];

            tableBody.innerHTML += `
                <tr>
                    <td>${m.title}</td>
                    <td>${m.date}</td>
                    <td>₹${m.price}</td>
                    <td>
                        <button onclick="editMatch('${id}')">Edit</button>
                        <button onclick="deleteMatch('${id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    });

    // ================= SAVE =================
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

        console.log("SAVE DATA:", data);

        if (isEditing) {
            set(ref(db, 'matches/' + editIdInput.value), data)
                .then(() => alert("Updated ✅"))
                .catch(err => console.error(err));
        } else {
            push(ref(db, 'matches'), data)
                .then(() => alert("Saved ✅"))
                .catch(err => console.error(err));
        }

        form.reset();
        isEditing = false;
    });

    // ================= EDIT =================
    window.editMatch = (id) => {

        const m = window.allMatches[id];

        editIdInput.value = id;
        mTitle.value = m.title;
        mDate.value = m.date;
        mTime.value = m.time;
        mVenue.value = m.venue;
        mPrice.value = m.price;
        mTeam1.value = m.team1;
        mTeam2.value = m.team2;
        mBanner.value = m.banner;

        isEditing = true;
    };

    // ================= DELETE =================
    window.deleteMatch = (id) => {
        remove(ref(db, 'matches/' + id));
    };

});
