// js/admin.js
import { db, ref, onValue, set, push, remove } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 🔐 SECURE LOGIN SYSTEM
    // ==========================================
    const loginScreen = document.getElementById('login-screen');
    const adminWrapper = document.getElementById('admin-wrapper');
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');

    const ADMIN_ID = "7627055204";
    const ADMIN_PASS = "Pooja2005";

    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        if(loginScreen) loginScreen.style.display = 'none';
        if(adminWrapper) adminWrapper.style.display = 'block';
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const idVal = document.getElementById('admin-id').value;
            const passVal = document.getElementById('admin-pass').value;

            if (idVal === ADMIN_ID && passVal === ADMIN_PASS) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                loginScreen.style.display = 'none';
                adminWrapper.style.display = 'block';
            } else {
                loginError.style.display = 'block';
                setTimeout(() => { loginError.style.display = 'none'; }, 3000);
            }
        });
    }

    // ==========================================
    // 📊 MATCH & PAYMENT LOGIC
    // ==========================================
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
    const mVenueImg = document.getElementById('m-venue-img'); 
    const upiInp = document.getElementById('admin-upi-id');
    const urlInp = document.getElementById('admin-qr-url');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');

    const bannerPreview = document.getElementById('banner-preview');
    const venuePreview = document.getElementById('venue-preview');

    let isEditing = false;

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

    if(mBanner) mBanner.addEventListener('input', () => showPreview(mBanner.value, bannerPreview));
    if(mVenueImg) mVenueImg.addEventListener('input', () => showPreview(mVenueImg.value, venuePreview));

    onValue(ref(db, 'settings/payment'), (snap) => {
        if (snap.exists()) {
            const data = snap.val();
            if (upiInp && document.activeElement !== upiInp) upiInp.value = data.upiId || '';
            if (urlInp && document.activeElement !== urlInp) urlInp.value = data.qrUrl || '';
        }
    });

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
                    <td style="padding:12px; border:1px solid #eee;">${m.title || ''}</td>
                    <td style="padding:12px; border:1px solid #eee;">${m.date || ''}</td>
                    <td style="padding:12px; border:1px solid #eee;">₹${m.price || 0}</td>
                    <td style="padding:12px; border:1px solid #eee;">
                        <button class="action-btn btn-edit" onclick="editMatch('${id}')" style="background:#00cf7f; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right:5px;">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteMatch('${id}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `);
        });
    });

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
            banner: mBanner.value.trim(),     
            venue_img: mVenueImg.value.trim() 
        };

        const paymentData = {
            upiId: upiInp ? upiInp.value.trim() : '',
            qrUrl: urlInp ? urlInp.value.trim() : ''
        };

        try {
            saveBtn.innerText = "Saving...";
            await set(ref(db, 'settings/payment'), paymentData);

            if (isEditing && editIdInput.value) {
                await set(ref(db, 'matches/' + editIdInput.value), data);
                alert('Match & QR Updated Successfully ✅');
            } else {
                await push(ref(db, 'matches'), data);
                alert('Match & QR Saved Successfully ✅');
            }
            cancelEdit(); 
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            saveBtn.innerText = isEditing ? "Update Match & QR" : "Save Match & QR";
        }
    });

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
        mVenueImg.value = m.venue_img || ''; 

        showPreview(m.banner, bannerPreview);
        showPreview(m.venue_img, venuePreview);

        isEditing = true;
        if(formTitle) formTitle.innerText = 'Edit Match Details';
        if(saveBtn) saveBtn.innerText = 'Update Match & QR';
        if(cancelBtn) cancelBtn.style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteMatch = async (id) => {
        if (!confirm('Are you sure you want to delete this match?')) return;
        try {
            await remove(ref(db, 'matches/' + id));
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    };

    function cancelEdit() {
        isEditing = false;
        editIdInput.value = '';
        mTitle.value = ''; mDate.value = ''; mTime.value = '';
        mVenue.value = ''; mPrice.value = ''; mTeam1.value = '';
        mTeam2.value = ''; mBanner.value = ''; mVenueImg.value = '';
        
        if(bannerPreview) bannerPreview.style.display = 'none';
        if(venuePreview) venuePreview.style.display = 'none';
        if(cancelBtn) cancelBtn.style.display = 'none';
        if(formTitle) formTitle.innerText = 'Add New Match';
        if(saveBtn) saveBtn.innerText = 'Save Match & QR';
    }

    if(cancelBtn) cancelBtn.addEventListener('click', cancelEdit);


    // ==========================================
    // 🚀 NEW: AUTO-FILL ALL IMAGES LOGIC
    // ==========================================
    const teamDictionary = {
        "chennai super kings": "CSK", "mumbai indians": "MI",
        "royal challengers bangalore": "RCB", "royal challengers bengaluru": "RCB",
        "kolkata knight riders": "KKR", "sunrisers hyderabad": "SRH",
        "delhi capitals": "DC", "punjab kings": "PBKS",
        "rajasthan royals": "RR", "lucknow super giants": "LSG",
        "gujarat titans": "GT",
        "csk": "CSK", "mi": "MI", "rcb": "RCB", "kkr": "KKR", "srh": "SRH",
        "dc": "DC", "pbks": "PBKS", "rr": "RR", "lsg": "LSG", "gt": "GT"
    };

    // 1. HAR TEAM KE SINGLE LOGO KA LINK YAHAN DAALEIN
    const teamLogos = {
        "CSK": "", "MI": "", "RCB": "", "KKR": "", "SRH": "", 
        "DC": "", "PBKS": "", "RR": "", "LSG": "", "GT": ""
    };

    // 2. MAIN POSTER KE LINKS YAHAN DAALEIN
    const teamBanners = {
        "CSK_MI": "", "CSK_RCB": "", "CSK_KKR": "", "CSK_SRH": "", "CSK_DC": "", "CSK_PBKS": "", "CSK_RR": "", "CSK_LSG": "", "CSK_GT": "",
        "MI_RCB": "", "MI_KKR": "", "MI_SRH": "", "MI_DC": "", "MI_PBKS": "", "MI_RR": "", "MI_LSG": "", "MI_GT": "",
        "RCB_KKR": "", "RCB_SRH": "", "RCB_DC": "", "RCB_PBKS": "", "RCB_RR": "", "RCB_LSG": "", "RCB_GT": "",
        "KKR_SRH": "", "KKR_DC": "", "KKR_PBKS": "", "KKR_RR": "", "KKR_LSG": "", "KKR_GT": "",
        "SRH_DC": "", "SRH_PBKS": "", "SRH_RR": "", "SRH_LSG": "", "SRH_GT": "",
        "DC_PBKS": "", "DC_RR": "", "DC_LSG": "", "DC_GT": "",
        "PBKS_RR": "", "PBKS_LSG": "", "PBKS_GT": "",
        "RR_LSG": "", "RR_GT": "",
        "LSG_GT": ""
    };

    function getShortName(nameStr) {
        if (!nameStr) return "";
        return teamDictionary[nameStr.trim().toLowerCase()] || "";
    }

    function checkAndFillAllImages() {
        if (!mTitle) return;

        const titleVal = mTitle.value.trim();
        const teams = titleVal.split(/\s+vs\s+|\s+v\s+|\s*-\s*/i);

        if (teams.length === 2) {
            const t1 = getShortName(teams[0]);
            const t2 = getShortName(teams[1]);

            if (t1 && t2 && t1 !== t2) {
                
                // A. Team 1 aur Team 2 ke single Logos bharna
                if (mTeam1 && teamLogos[t1]) mTeam1.value = teamLogos[t1];
                if (mTeam2 && teamLogos[t2]) mTeam2.value = teamLogos[t2];

                // B. Main Banner Poster bharna
                const combo1 = `${t1}_${t2}`;
                const combo2 = `${t2}_${t1}`;
                const autoUrl = teamBanners[combo1] || teamBanners[combo2];

                if (mBanner && autoUrl) {
                    mBanner.value = autoUrl;
                    if (typeof showPreview === "function" && bannerPreview) {
                        showPreview(autoUrl, bannerPreview);
                    }
                }
            }
        }
    }

    if (mTitle) {
        mTitle.addEventListener('input', checkAndFillAllImages);
        mTitle.addEventListener('change', checkAndFillAllImages);
    }

});
