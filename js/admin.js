import { ref, onValue, set, remove, push } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('match-form');
    if (!form) return;

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

    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');

    let isEditing = false;

    onValue(ref('matches'), (snapshot) => {
        tableBody.innerHTML = '';
        const matches = snapshot.val();

        if (!matches) return;

        window.allMatches = matches;

        Object.keys(matches).forEach((key) => {
            const match = matches[key];

            tableBody.innerHTML += `
                <tr>
                    <td>${match.title}</td>
                    <td>${match.date}</td>
                    <td>₹${match.price}</td>
                    <td>
                        <button onclick="editMatch('${key}')">Edit</button>
                        <button onclick="deleteMatch('${key}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    });

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

        if (isEditing) {
            set(ref('matches/' + editIdInput.value), data);
        } else {
            push(ref('matches'), data);
        }

        form.reset();
        cancelEdit();
    });

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
        formTitle.innerText = "Edit Match";
        saveBtn.innerText = "Update Match";
        cancelBtn.style.display = "inline-block";
    };

    window.deleteMatch = (id) => {
        remove(ref('matches/' + id));
    };

    function cancelEdit() {
        isEditing = false;
        form.reset();
        cancelBtn.style.display = "none";
        formTitle.innerText = "Add New Match";
        saveBtn.innerText = "Save Match";
    }

    cancelBtn.addEventListener('click', cancelEdit);
});
