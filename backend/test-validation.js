
const axios = require('axios');
const FormData = require('form-data'); // You might not have form-data package in backend?
// If no form-data package, I can use boundary manually or just use axios with form-data if available in node_modules (usually axios doesn't ship with it in node).
// I'll try to use 'form-data' package assuming it's there or installed. If not, I'll use standard boundary construction.
// Checking package.json via view_file would be wise, but I'll gamble or use a simple boundary approach.
// actually, I'll use a boundary approach to be safe and dependency-free (other than axios).

async function testValidation() {
    try {
        // Login
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'kangangiboniface2021@gmail.com',
            password: 'bonik254'
        });
        const token = loginRes.data.token || loginRes.data.data.token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
                // Content-Type will be set by axios if I pass FormData (from 'form-data' package)
                // But if I manually constructs body...
            }
        };

        // Construct payload
        // Simulating: weight=22, quality=grade1, collectionDate=2025-12-17, farmer=...
        // location = {"coordinates":{"lat":-1.2,"lng":36.8},"address":"...","accuracy":...}
        // image is optional in this test (no file).

        // Let's rely on 'form-data' package being present since 'multer' is used in backend, usually 'form-data' is installed for tests? 
        // If not, I will fail.
        // Try require('form-data').

        const FormData = require('form-data');
        const form = new FormData();
        form.append('farmer', '6760dd1d29323c2a0468622a'); // F000007 from previous log
        form.append('collectionDate', '2025-12-17');
        form.append('weight', '22');
        form.append('quality', 'grade1');
        form.append('location', JSON.stringify({
            coordinates: { lat: -1.28579, lng: 36.8219 },
            address: 'Nairobi, Kenya'
        }));

        // Add headers from form
        const headers = { ...config.headers, ...form.getHeaders() };

        console.log('Sending FormData request...');
        const res = await axios.post('http://localhost:5000/api/v1/collections', form, { headers });
        console.log('Success:', res.data);

    } catch (error) {
        console.error('Error Status:', error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testValidation();
