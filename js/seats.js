import { db, ref, get } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
    const venueImgEl = document.getElementById('venue-img');
    const matchTitleEl = document.getElementById('match-title');
    
    // 1. LocalStorage se sirf ID nikaalo
    const matchId = localStorage.getItem('matchId');

    if (matchId) {
        // 2. Direct Firebase se us specific match ka data mango
        try {
            const matchRef = ref(db, `matches/${matchId}`);
            const snapshot = await get(matchRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                
                // 3. Ab yahan image dikhao (Teesre page par visible)
                if (matchTitleEl) matchTitleEl.innerText = data.title;
                
                if (venueImgEl && data.venue_img) {
                    venueImgEl.src = data.venue_img;
                    venueImgEl.style.display = "block";
                }
            } else {
                console.error("No match data found in Firebase for this ID");
            }
        } catch (error) {
            console.error("Firebase se data lene mein galti:", error);
        }
    } else {
        // Agar ID hi nahi mili toh wapas bhej do
        window.location.href = 'index.html';
    }
});
