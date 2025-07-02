const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'michaelT',
        password: '123456',
      }),
    });

    console.log('Status:', response.status);
    const responseText = await response.text();
    console.log('Response:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed data:', data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
      }
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();
