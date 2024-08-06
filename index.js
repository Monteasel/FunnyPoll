const {GoogleSpreadsheet} = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

const sheetID = "1MUx_zYi3IcNe5Xqgvn0hFJb9ohbls0ERdGgeS7HS7Ko";



const creds = JSON.parse(fs.readFileSync("funnypollproject-116e402fb698.json", "utf-8"));


const auth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    subject: creds.client_email
})


const doc = new GoogleSpreadsheet(sheetID, auth);



//const testRow = {Zeitstempel: "hey", 'Links oder Rechts?': 50};




const getRow = async () => {


    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();



    // console.log(sheet.title)
    console.log(rows[0].get("Name"))



    // console.log(rows[0]);
    // await sheet.addRow({"Name": "a"})
    // console.log(sheet.columnCount)
    // sheet.addRow(testRow);
    // console.log(rows[0]._worksheet);

    //rows[2].assign(testRow)
    //await rows[1].save();
}

getRow().catch(console.error);
