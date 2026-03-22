document.addEventListener("DOMContentLoaded", () => {
    console.log("Venue Image Test Script Loaded ✅");

    const matchTitleEl = document.getElementById('test-match-title');
    const venueImgEl = document.getElementById('test-venue-img');
    const errorMessageEl = document.getElementById('error-message');

    // ==========================================
    // 1. LocalStorage se data lena (Minimal Logic)
    // ==========================================
    const rawData = localStorage.getItem('selectedMatch');
    console.log("Raw localStorage Data:", rawData);

    // Agar data nahi hai
    if (!rawData) {
        console.error("No 'selectedMatch' data found in localStorage.");
        errorMessageEl.innerText = "Error: 'selectedMatch' data local storage mein nahi mila. Please pehle Home Page (`index.html`) par kisi match par click karein.";
        errorMessageEl.style.display = 'block';
        return;
    }

    // Data Parse karna
    try {
        const match = JSON.parse(rawData);
        console.log("Parsed Match Data:", match);

        // 2. Title Set karna
        if (matchTitleEl) {
            matchTitleEl.innerText = match.title || "Unknown Match";
        }

        // ==========================================
        // 3. Venue Image URL pakadna (Fix Check)
        // ==========================================
        // Firebase se Admin panel mein input ki hui 'venue_img' field check karein.
        // Agar nahi mili, toh poster image ('banner') fallback dikhao.
        const imageUrl = match.venue_img || match.banner;
        console.log("Stadium Image URL found:", imageUrl);

        // Agar URL hai, toh load karo
        if (imageUrl) {
            venueImgEl.src = imageUrl;
            venueImgEl.style.display = 'block'; // Show image
            
            venueImgEl.onerror = () => {
                console.error("Image failed to load:", imageUrl);
                venueImgEl.src = "https://via.placeholder.com/800x400?text=Error+Loading+Image";
                errorMessageEl.innerText = "Error: Image load nahi ho rahi. URL broken ho sakta hai.";
                errorMessageEl.style.display = 'block';
            };
        } else {
            console.error("Neither 'venue_img' nor 'banner' found in data.");
            errorMessageEl.innerText = "Error: Match data mein 'venue_img' aur 'banner' dono miss hain.";
            errorMessageEl.style.display = 'block';
        }

    } catch (e) {
        console.error("JSON Parse Error:", e);
        errorMessageEl.innerText = "Error: localStorage data ko parse karne mein galti huyi.";
        errorMessageEl.style.display = 'block';
    }
});
