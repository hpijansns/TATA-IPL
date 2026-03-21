const bubbles = document.getElementById('qty-bubbles');
const vehicleImg = document.getElementById('vehicle-img');

const vehicles = {
    1: "https://in.bmscdn.com/webin/common/icons/bicycle.png",
    2: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    3: "https://cdn-icons-png.flaticon.com/512/2972/2972178.png",
    4: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
    5: "https://cdn-icons-png.flaticon.com/512/1995/1995509.png",
    6: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
    7: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
    8: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
    9: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
    10: "https://cdn-icons-png.flaticon.com/512/481/481873.png"
};

for (let i = 1; i <= 10; i++) {

    const btn = document.createElement('div');
    btn.className = 'qty-bubble';
    btn.innerText = i;

    if (i === 1) btn.classList.add('active');

    btn.onclick = () => {

        document.querySelectorAll('.qty-bubble')
            .forEach(b => b.classList.remove('active'));

        btn.classList.add('active');

        vehicleImg.src = vehicles[i];

        // animation
        vehicleImg.style.transform = "scale(1.1)";
        setTimeout(() => {
            vehicleImg.style.transform = "scale(1)";
        }, 200);
    };

    bubbles.appendChild(btn);
}
