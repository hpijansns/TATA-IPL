import { db, ref, onValue, set, remove, push } from './firebase.js';

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

    // 🔥 IMAGE PREVIEW FIX
    const preview = document.createElement('img');
    preview.style.width = "100%";
    preview.style.marginTop = "10px";
    preview.style.borderRadius = "8px";
    preview.style.display = "none";

    mBanner.parentElement.appendChild(preview);

    function showPreview(url) {
        if (url && url.startsWith("http")) {
            preview.src = url;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }
    }

    mBanner.addEventListener('input', () => {
        showPreview(mBanner.value);
    });

    // 🔥 FETCH
    onValue(ref(db, 'matches'), (snapshot) => {

        tableBody.innerHTML = '';
        const matches = snapshot.val();

        if (!matches) return;

        window.allMatches = matches;

        Object.keys(matches).forEach((key) => {
            const m = matches[key];

            tableBody.innerHTML += `
                <tr>
                    <td>${m.title}</td>
                    <td>${m.date}</td>
                    <td>₹${m.price}</td>
                    <td>
                        <button onclick="editMatch('${key}')">Edit</button>
                        <button onclick="deleteMatch('${key}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    });

    // 🔥 SAVE
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

        if (!data.banner) {
            alert("Banner URL dal bhai!");
            return;
        }

        if (isEditing) {
            set(ref(db, 'matches/' + editIdInput.value), data);
        } else {
            push(ref(db, 'matches'), data);
        }

        form.reset();
        showPreview("");
        cancelEdit();
    });

    // 🔥 EDIT
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

        showPreview(m.banner);

        isEditing = true;
        formTitle.innerText = "Edit Match";
        saveBtn.innerText = "Update Match";
        cancelBtn.style.display = "block";
    };

    window.deleteMatch = (id) => {
        remove(ref(db, 'matches/' + id));
    };

    function cancelEdit() {
        isEditing = false;
        form.reset();
        showPreview("");
        cancelBtn.style.display = "none";
        formTitle.innerText = "Add New Match";
        saveBtn.innerText = "Save Match";
    }

    cancelBtn.addEventListener('click', cancelEdit);
});
