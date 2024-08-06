const {google} = require('googleapis');
const fs = require('fs');

const creds = JSON.parse(fs.readFileSync("funnypollproject-116e402fb698.json"));

const auth = new google.auth.JWT(
    creds.client_email,
    null,
    creds.private_key,
    ['https://www.googleapis.com/auth/forms.body'] // Add the required scopes here
);


const looker = google.looker({
    version: 'v1',
    auth: auth
})







async function test() {
    try {
        // Ensure the client is authenticated
        await auth.authorize();

        // Make the API request
        console.log(await looker.reports);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();