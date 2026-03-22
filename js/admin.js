// admin.js
// 🔥 Added 'get' in the import for Payment Settings
import { db, ref, onValue, set, push, remove, get } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('match-form');
  if (!form) return;

  const tableBody = document.getElementById('admin-match-list');

  // Input Fields
  const editIdInput = document.getElementById('edit-id');
  const mTitle = document.getElementById('m-title');
  const mDate = document.getElementById('m-date');
  const mTime = document.getElementById('m-time');
  const mVenue = document.getElementById('m-venue');
  const mPrice = document.getElementById('m-price');
  const mTeam1 = document.getElementById('m-team1');
  const mTeam2 = document.getElementById('m-team2');
  
  // 🔥 Do alag images ke fields
  const mBanner = document.getElementById('m-banner');      // Poster Image
  const mVenueImg = document.getElementById('m-venue-img'); // Stadium Map Image

  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const formTitle = document.getElementById('form-title');

  // 🔥 Preview Elements
  const bannerPreview = document.getElementById('banner-preview');
  const venuePreview = document.getElementById('venue-preview');

  let isEditing = false;

  // ==========================================
  // 🔥 IMAGE PREVIEW LOGIC
  // ==========================================
  function showPreview(url, element) {
    if (element) {
      if (url && url.trim().startsWith('http')) {
        element.src = url;
        element.style.display = 'block';
        element.style.width = '100px';
        element.style.marginTop = '10px';
      } else {
        element.style.display = 'none';
      }
    }
  }

  // Input hote hi preview dikhao
  if(mBanner) mBanner.addEventListener('input', () => showPreview(mBanner.value, bannerPreview));
  if(mVenueImg) mVenueImg.addEventListener('input', () => showPreview(mVenueImg.value, venuePreview));

  // ==========================================
  // 🔥 FETCH MATCHES (DISPLAY IN TABLE)
  // ==========================================
  onValue(ref(db, 'matches'), (snap) => {
    if (!tableBody) return;
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

  // ==========================================
  // 🔥 SAVE / UPDATE FUNCTION
  // ==========================================
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
      banner: mBanner.value.trim(),     // Poster URL
      venue_img: mVenueImg.value.trim() // 🔥 Stadium Map URL
    };

    try {
      if (isEditing && editIdInput.value) {
        // Update existing match
        await set(ref(db, 'matches/' + editIdInput.value), data);
        alert('Match Updated Successfully ✅');
      } else {
        // Add new match
        await push(ref(db, 'matches'), data);
        alert('Match Saved Successfully ✅');
      }

      cancelEdit(); // Reset form
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  });

  // ==========================================
  // 🔥 EDIT MATCH (WINDOW FUNCTION)
  // ==========================================
  window.editMatch = (id) => {
    const m = window.allMatches[id];
    if (!m) return;

    editIdInput.value = id;
    mTitle.value = m.title || '';
    mDate.value = m.date || '';
    mTime.value = m.time || '';
    mVenue.value = m.venue || '';
    mPrice.value = m.price || '';
    mTeam1.value = m.team1 || '';
    mTeam2.value = m.team2 || '';
    mBanner.value = m.banner || '';
    mVenueImg.value = m.venue_img || ''; // 🔥 Map URL Load karo

    // Previews update
    showPreview(m.banner, bannerPreview);
    showPreview(m.venue_img, venuePreview);

    isEditing = true;
    if(formTitle) formTitle.innerText = 'Edit Match Details';
    if(saveBtn) saveBtn.innerText = 'Update Match';
    if(cancelBtn) cancelBtn.style.display = 'inline-block';
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // 🔥 DELETE MATCH
  // ==========================================
  window.deleteMatch = async (id) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    try {
      await remove(ref(db, 'matches/' + id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // ==========================================
  // 🔥 CANCEL / RESET
  // ==========================================
  function cancelEdit() {
    isEditing = false;
    editIdInput.value = '';
    form.reset();
    
    // Clear previews
    if(bannerPreview) bannerPreview.style.display = 'none';
    if(venuePreview) venuePreview.style.display = 'none';

    if(cancelBtn) cancelBtn.style.display = 'none';
    if(formTitle) formTitle.innerText = 'Add New Match';
    if(saveBtn) saveBtn.innerText = 'Save Match';
  }

  if(cancelBtn) cancelBtn.addEventListener('click', cancelEdit);


  // =========================================================
  // 🟢 NAYA SECTION: PAYMENT SETTINGS (QR & UPI LOGIC)
  // =========================================================
  
  const upiInp = document.getElementById('admin-upi-id');
  const urlInp = document.getElementById('admin-qr-url');
  const savePaymentBtn = document.getElementById('save-payment-btn');

  // 1. Purana payment data Firebase se load karo
  async function loadPaymentSettings() {
    try {
        const snap = await get(ref(db, 'settings/payment'));
        if(snap.exists()){
            const data = snap.val();
            if(upiInp) upiInp.value = data.upiId || "";
            if(urlInp) urlInp.value = data.qrUrl || "";
            console.log("Payment settings loaded successfully! ✅");
        }
    } catch(e) { 
        console.error("Firebase Payment Load Error:", e); 
    }
  }
  
  // Page load hote hi ye check karega
  loadPaymentSettings();

  // 2. Button par click hone par data save karo
  if(savePaymentBtn) {
      savePaymentBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          
          const upi = upiInp ? upiInp.value.trim() : "";
          const qr = urlInp ? urlInp.value.trim() : "";

          // Agar dono khali hain toh error dikhao
          if(!upi && !qr) {
              alert("Bhai, kam se kam UPI ID toh daal do!");
              return;
          }

          savePaymentBtn.innerText = "Saving... ⏳";
          savePaymentBtn.disabled = true;

          try {
              // Firebase mein settings/payment path par data set karo
              await set(ref(db, 'settings/payment'), {
                  upiId: upi,
                  qrUrl: qr
              });
              alert("Zabardast! QR Details Update Ho Gayi Hain. 🚀");
          } catch(error) {
              alert("Error: " + error.message);
              console.error("Save Error:", error);
          } finally {
              savePaymentBtn.innerText = "Update QR Details";
              savePaymentBtn.disabled = false;
          }
      });
  }

});
