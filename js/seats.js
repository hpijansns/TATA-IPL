// Firebase imports ko tabhi use karein agar zarurat ho, pehle local data fix karte hain
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Elements ko pakadna
    const matchTitle = document.getElementById('match-title');
    const venueImg = document.getElementById('venue-img');
    const vehicleImg = document.getElementById('vehicle-img');
    const bubbles = document.getElementById('qty-bubbles');

    // 2. LocalStorage se data nikalna
    const rawData = localStorage.getItem('selectedMatch');
    console.log("Raw Data Found:", rawData); // Ye check karne ke liye ki data aaya ya nahi

    if (rawData) {
        try {
            const match = JSON.parse(rawData);
            
            // 3. Title update karein
            if (matchTitle) {
                matchTitle.innerText = match.title || "Match Details";
            }

            // 4. Venue Image update karein (Aapke screenshot mein ye khali hai)
            if (venueImg) {
                venueImg.src = match.banner || "";
                venueImg.style.display = "block"; // Ensure image hidden na ho
                venueImg.onerror = () => {
                    venueImg.src = "https://via.placeholder.com/800x400?text=Stadium+Image";
                };
            }

            // 5. Vehicle Image update karein
            if (vehicleImg) {
                vehicleImg.src = "https://in.bmscdn.com/webin/common/icons/bicycle.png";
            }

        } catch (e) {
            console.error("JSON Parsing error", e);
        }
    } else {
        // Agar data bilkul nahi mila
        if (matchTitle) matchTitle.innerText = "Match Not Found";
    }

    // 6. Seat Bubbles Logic (1-10)
    if (bubbles) {
        bubbles.innerHTML = ""; // Purana saaf karein
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('div');
            btn.className = 'qty-bubble' + (i === 1 ? ' active' : '');
            btn.innerText = i;
            btn.onclick = () => {
                document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Vehicle change logic yahan add kar sakte hain
            };
            bubbles.appendChild(btn);
        }
    }
});
