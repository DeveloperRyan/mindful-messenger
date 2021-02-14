require('dotenv').config()
const express = require('express');
const axios = require('axios');
let cors = require('cors');
axios.defaults.headers.post['Authorization'] = process.env.OPENAI_API_TOKEN

var bodyParser = require('body-parser');
var fs = require('fs');

let promptName = 'prompt.txt';
let timePromptName = 'timeprompt.txt';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const port = 4242


async function getTimeFromTextGPT3(text) {

    let prompt;

    let returnValue = await new Promise((resolve, reject) => {
        fs.readFile(timePromptName, 'utf8', async (err, data) => {
            if (err)
                throw err;
            prompt = data;

            prompt += text + "\n";
            prompt += "Time:";

            // console.log(prompt);

            try {

                let res = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
                    "prompt": prompt,
                    "max_tokens": 10,
                    "temperature": 0.1,
                    "stop": ["###", "\n", "Text:"]
                })
                resolve(res.data.choices[0].text.trim());
            } catch (err) {
                reject(err);
            }
        })
    });

    return returnValue;
}

async function classifyEventGPT3(sender, epoch, text) {

    let prompt;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    let returnValue = await new Promise((resolve, reject) => {
        fs.readFile(promptName, 'utf8', async (err, data) => {
            if (err)
                throw err;
            prompt = data;

            var date = new Date(epoch);

            var year = date.getFullYear();
            var month = monthNames[date.getMonth()];
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = date.getMinutes();

            prompt += "Sender: " + sender + "\n";
            prompt += "Recieved: " + month + " " + day + ", " + year + ", " + hours + ":" + minutes + "\n";
            prompt += "Text: " + text + "\n";
            prompt += "Classification:";

            // console.log(prompt);
            try {
                let res = await axios.post('https://api.openai.com/v1/engines/davinci/completions', {
                    "prompt": prompt,
                    "max_tokens": 25,
                    "temperature": 0.4,
                    "stop": "###"
                });

                let parsed = res.data.choices[0].text.split('\n');

                // console.log(parsed)

                if (parsed.length > 2 && parsed[1].length == 0) {
                    parsed[1] = parsed[2];
                }
                parsed = parsed.slice(0, 2);

                // console.log(parsed);

                let eventType = parsed[0].trim();
                let reminder = parsed[1].trim();
                if (reminder.includes('Reminder: ')) {
                    reminder = reminder.substring(9).trim();
                }

                let date = "";
                if (reminder.includes("]")) {
                    let index = reminder.indexOf("]");
                    date = reminder.substring(0, index + 1);
                    reminder = reminder.substring(index + 1).trim();
                }

                resolve([eventType, date, reminder]);
            } catch (err) {
                reject(err)
            }
        });
    })

    return returnValue;
}

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.post("/reminder/", async (req, res) => {
    try {
        const result = await classifyEventGPT3(req.body.sender, req.body.epoch, req.body.text);
        console.log(result)
        if (Array.isArray(result)) {
            res.send({ eventType: result[0], date: result[1], title: result[2] });
        } else res.send(400, result);

    } catch (err) {
        console.log(err);
    }
})

app.post("/getTime/", async (req, res) => {
    try {
        const result = await getTimeFromTextGPT3(req.body.text);
        console.log(result);
        res.send({ time: result });
    } catch (err) {
        console.log(err);
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

