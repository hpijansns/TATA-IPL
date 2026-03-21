// admin.js
import { db, ref, onValue, set, push, remove } from './firebase.js';

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

  // ===== Preview (URL) =====
  const preview = document.createElement('img');
  preview.style.cssText = "width:100%;margin-top:10px;border-radius:8px;display:none";
  mBanner.parentElement.appendChild(preview);

  function showPreview(url){
    if (url && url.startsWith('http')) {
      preview.src = url;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  }
  mBanner.addEventListener('input', ()=> showPreview(mBanner.value));

  // ===== Fetch =====
  onValue(ref(db, 'matches'), (snap) => {
    tableBody.innerHTML = '';
    const data = snap.val();
    if (!data) return;
    window.allMatches = data;

    Object.keys(data).forEach(id => {
      const m = data[id];
      tableBody.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${m.title || ''}</td>
          <td>${m.date || ''}</td>
          <td>₹${m.price || 0}</td>
          <td>
            <button class="action-btn btn-edit" onclick="editMatch('${id}')">Edit</button>
            <button class="action-btn btn-delete" onclick="deleteMatch('${id}')">Delete</button>
          </td>
        </tr>
      `);
    });
  });

  // ===== Save / Update =====
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      title: mTitle.value.trim(),
      date: mDate.value,
      time: mTime.value,
      venue: mVenue.value.trim(),
      price: Number(mPrice.value || 0),
      team1: mTeam1.value.trim(),
      team2: mTeam2.value.trim(),
      banner: mBanner.value.trim()
    };

    console.log('SAVE:', data);

    try {
      if (isEditing && editIdInput.value) {
        await set(ref(db, 'matches/' + editIdInput.value), data);
        alert('Updated ✅');
      } else {
        await push(ref(db, 'matches'), data);
        alert('Saved ✅');
      }
      form.reset();
      showPreview('');
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  });

  // ===== Edit =====
  window.editMatch = (id) => {
    const m = window.allMatches[id];
    editIdInput.value = id;

    mTitle.value = m.title || '';
    mDate.value = m.date || '';
    mTime.value = m.time || '';
    mVenue.value = m.venue || '';
    mPrice.value = m.price || '';
    mTeam1.value = m.team1 || '';
    mTeam2.value = m.team2 || '';
    mBanner.value = m.banner || '';

    showPreview(m.banner);

    isEditing = true;
    formTitle.innerText = 'Edit Match';
    saveBtn.innerText = 'Update Match';
    cancelBtn.style.display = 'inline-block';
  };

  // ===== Delete =====
  window.deleteMatch = async (id) => {
    if (!confirm('Delete this match?')) return;
    await remove(ref(db, 'matches/' + id));
  };

  function cancelEdit(){
    isEditing = false;
    editIdInput.value = '';
    form.reset();
    showPreview('');
    cancelBtn.style.display = 'none';
    formTitle.innerText = 'Add New Match';
    saveBtn.innerText = 'Save Match';
  }

  cancelBtn.addEventListener('click', cancelEdit);
});
