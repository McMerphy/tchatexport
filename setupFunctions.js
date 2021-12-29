import { TelegramClient } from 'telegram'
import { StringSession } from "telegram/sessions/index.js"
import input from "input"
import { Api } from "telegram/tl/index.js"
import fs from "fs"
import mongoose from "mongoose"
import colors from "colors/safe.js"


let stringSessionStr = ""
try {
    if (fs.existsSync(process.env.SESSION_FILE)) {
        let sessionJson = JSON.parse(fs.readFileSync(process.env.SESSION_FILE))
        stringSessionStr = sessionJson.stringSession
        console.log("String session: ", stringSessionStr)
    }
} catch (error) {
    console.log('Can\'t read session file')
    console.log(error)
}

// // Import internal packages
// import router from "./routes/index.route"

export async function setup_tg_client() {

    let stringSessionStr = ""
    try {
        if (fs.existsSync(process.env.SESSION_FILE)) {
            console.log('Reading saved session key')
            let sessionJson = JSON.parse(fs.readFileSync(process.env.SESSION_FILE))
            stringSessionStr = sessionJson.stringSession
        }
    } catch (error) {
        console.log('Can\'t read session key')
        console.log(error)
    }
    const stringSession = new StringSession(stringSessionStr)

    const client = new TelegramClient(stringSession,
        parseInt(process.env.TELEGRAM_API_ID),
        process.env.TELEGRAM_API_HASH,
        { connectionRetries: 5 })

    await client.start({
        phoneNumber: () => { return process.env.PHONE },
        password: () => { return process.env.TELEGRAM_CLOUD_PASSWORD },
        phoneCode: async () => await input.text('Code ?'),
        onError: (err) => console.log(err),
    })
    fs.writeFileSync('./session.json', JSON.stringify({
        stringSession: client.session.save()
    }, null, 2), 'utf-8')

    console.log('You should now be connected.')
    console.log(client.session.save())

    return client
}

export async function setup_database() {
    return new Promise((resolve) => {
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true
        });

        var db = mongoose.connection;

        db.on("error", (error) => {
            if (error.name === "MongoNetworkError") {
                console.log(`${colors.red("❌")}  Couldn't set up database. Connection didn't succeed.`);
                resolve({ success: false })
            } else {
                console.error.bind(console, "connection error:")
            }
        })

        db.once("open", function () {
            console.log(`${colors.green("✔")} connected to database`)
            resolve({ success: true })
        })
    })
}
