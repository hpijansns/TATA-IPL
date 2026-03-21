import { db } from './firebase.js';
import { ref, onValue, set, remove, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

    // =============================
    // 🔥 IMAGE PREVIEW
    // =============================

    const preview = document.createElement('img');
    preview.style.width = "100%";
    preview.style.marginTop = "10px";
    preview.style.borderRadius = "8px";
    preview.style.display = "none";

    mBanner.parentNode.appendChild(preview);

    function updatePreview(url) {
        if (url) {
            preview.src = url;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }
    }

    mBanner.addEventListener('input', () => {
        updatePreview(mBanner.value);
    });

    // =============================
    // 🔥 FETCH DATA
    // =============================

    onValue(ref(db, 'matches'), (snapshot) => {

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
                        <button class="action-btn btn-edit" onclick="editMatch('${key}')">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteMatch('${key}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    });

    // =============================
    // 🔥 SAVE / UPDATE
    // =============================

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            title: mTitle.value.trim(),
            date: mDate.value,
            time: mTime.value,
            venue: mVenue.value.trim(),
            price: Number(mPrice.value),
            team1: mTeam1.value.trim(),
            team2: mTeam2.value.trim(),
            banner: mBanner.value.trim()
        };

        console.log("Saving:", data); // 🔥 debug

        if (!data.title || !data.banner) {
            alert("Title aur Banner URL zaroori hai!");
            return;
        }

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
        updatePreview("");
        cancelEdit();
    });

    // =============================
    // 🔥 EDIT
    // =============================

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

        updatePreview(m.banner);

        isEditing = true;
        formTitle.innerText = "Edit Match";
        saveBtn.innerText = "Update Match";
        cancelBtn.style.display = "inline-block";
    };

    // =============================
    // 🔥 DELETE
    // =============================

    window.deleteMatch = (id) => {
        if (confirm("Delete this match?")) {
            remove(ref(db, 'matches/' + id));
        }
    };

    // =============================
    // 🔥 CANCEL
    // =============================

    function cancelEdit() {
        isEditing = false;
        form.reset();
        updatePreview("");
        cancelBtn.style.display = "none";
        formTitle.innerText = "Add New Match";
        saveBtn.innerText = "Save Match";
    }

    cancelBtn.addEventListener('click', cancelEdit);
});
