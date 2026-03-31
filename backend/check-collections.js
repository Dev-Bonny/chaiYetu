
const axios = require('axios');

async function checkCollections() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'kangangiboniface2021@gmail.com',
            password: 'bonik254'
        });

        const token = loginRes.data.token || loginRes.data.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log('\n--- Checking /api/v1/collections ---');
        const collectionsRes = await axios.get('http://localhost:5000/api/v1/collections?limit=50', config);

        const data = collectionsRes.data.data;
        const count = data.collections ? data.collections.length : 0;
        const total = data.total;

        console.log(`Collections in response: ${count}`);
        console.log(`Total count in DB: ${total}`);

        if (count > 0) {
            console.log('First collection:', JSON.stringify(data.collections[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

checkCollections();
