import { ref, get } from './firebase.js';

const titleEl = document.getElementById('seat-match-title');
const qtyBubbles = document.getElementById('qty-bubbles');
const proceedBtn = document.getElementById('proceed-to-seats');

const qtyView = document.getElementById('qty-view');
const seatView = document.getElementById('seat-view');

const seatMap = document.getElementById('seat-map');
const checkoutBar = document.getElementById('checkout-bar');
const totalPriceEl = document.getElementById('total-price');
const seatCountLabel = document.getElementById('seat-count-label');

const payBtn = document.getElementById('pay-now-btn');
const successModal = document.getElementById('success-modal');

let selectedQty = 0;
let selectedSeats = [];
let price = 0;

// 🔥 MATCH LOAD
const matchId = localStorage.getItem('selectedMatch');

if (!matchId) {
    titleEl.innerText = "No Match Selected";
} else {
    get(ref('matches/' + matchId)).then((snap) => {
        const match = snap.val();
        if (!match) return;

        titleEl.innerText = match.title;
        price = parseInt(match.price);
    });
}

// 🔥 QTY BUTTONS
for (let i = 1; i <= 10; i++) {
    const div = document.createElement('div');
    div.className = "qty-bubble";
    div.innerText = i;

    div.onclick = () => {
        document.querySelectorAll('.qty-bubble').forEach(b => b.classList.remove('active'));
        div.classList.add('active');
        selectedQty = i;
    };

    qtyBubbles.appendChild(div);
}

// 🔥 NEXT VIEW
proceedBtn.addEventListener('click', () => {
    if (selectedQty === 0) {
        alert('Please select number of seats');
        return;
    }

    qtyView.style.display = 'none';
    seatView.style.display = 'block';

    generateSeats();
});

// 🔥 SEAT GENERATE
function generateSeats() {
    seatMap.innerHTML = '';

    for (let i = 1; i <= 60; i++) {
        const seat = document.createElement('div');
        seat.className = "seat available";
        seat.innerText = i;

        // random sold seats
        if (Math.random() < 0.25) {
            seat.classList.remove('available');
            seat.classList.add('booked');
        }

        seat.onclick = () => {
            if (seat.classList.contains('booked')) return;

            if (seat.classList.contains('selected')) {
                seat.classList.remove('selected');
                selectedSeats = selectedSeats.filter(s => s !== i);
            } else {
                if (selectedSeats.length >= selectedQty) {
                    alert(`Only ${selectedQty} seats allowed`);
                    return;
                }
                seat.classList.add('selected');
                selectedSeats.push(i);
            }

            updateCheckout();
        };

        seatMap.appendChild(seat);
    }
}

// 🔥 UPDATE CHECKOUT
function updateCheckout() {
    if (selectedSeats.length > 0) {
        checkoutBar.style.display = 'flex';
    } else {
        checkoutBar.style.display = 'none';
    }

    totalPriceEl.innerText = `₹${selectedSeats.length * price}`;
    seatCountLabel.innerText = `${selectedSeats.length} Seats`;
}

// 🔥 PAYMENT CLICK
payBtn.addEventListener('click', () => {
    if (selectedSeats.length === 0) {
        alert('Select seats first');
        return;
    }

    successModal.style.display = 'flex';
});
