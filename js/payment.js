// js/payment.js
import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    
    const qrImg = document.getElementById('qr-code');
    const qrMsg = document.getElementById('qr-msg');
    const finalPrice = localStorage.getItem('finalPrice') || 0;

    // Firebase se QR settings fetch karna
    onValue(ref(db, 'settings/payment'), (snap) => {
        if (snap.exists()) {
            const data = snap.val();
            
            if (data.qrUrl && data.qrUrl.trim() !== "") {
                // Agar Admin ne direct Image URL dala hai
                qrImg.src = data.qrUrl;
                qrMsg.innerText = "Scan QR to complete payment";
                
            } else if (data.upiId && data.upiId.trim() !== "") {
                // Agar Admin ne UPI ID dali hai, toh 'Aarush Fashion' naam se QR auto-generate hoga
                const upiString = `upi://pay?pa=${data.upiId}&pn=AarushFashion&am=${finalPrice}&cu=INR`;
                const encodedUpi = encodeURIComponent(upiString);
                
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedUpi}`;
                qrMsg.innerText = "Scan QR to complete payment";
            } else {
                qrMsg.innerText = "Please update UPI ID in Admin Panel.";
            }
        } else {
            qrMsg.innerText = "QR Setup is incomplete. Check Admin Panel.";
        }
    });
});
