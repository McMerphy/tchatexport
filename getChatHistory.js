/* eslint-disable no-undef */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Load env variables

// config.js
import dotenv from "dotenv";
const cwd = process.cwd()
dotenv.config({ path: `${cwd}/.env` });

import { Api } from "telegram/tl/index.js"
import fs from "fs"
/* eslint-disable no-undef */

import { setup_tg_client  } from "./setupFunctions.js"


;(async () => {
    let client = await setup_tg_client()


    let fileIndex = 0
    let offsetId = 0
    let limit = 50
    let dialogsDir = './dialogs/' + process.env.PEER_ID
    fs.mkdirSync(dialogsDir, {
        recursive: true
    })
    let messages = []

    try {
        do {
            const history = await client.invoke(
                new Api.messages.GetHistory({
                    peer: new Api.InputPeerChat({
                        chatId: parseInt(process.env.PEER_ID)
                    }),
                    offsetId: offsetId,
                    offsetDate: 0,
                    addOffset: 0,
                    limit: limit,
                    maxId: 0,
                    minId: 0,
                    hash: 0,
                })
            )
            messages = history.messages
    
            if (messages.length > 0) {
                offsetId = messages[messages.length -1].id
                
                let filename = dialogsDir + '/dialog_' + fileIndex + '.json'
                fileIndex++
    
                console.log(`writing dialogs to a file: ${filename}`)
                fs.writeFileSync(filename, 
                    JSON.stringify(messages, null, 2), 'utf-8')
            } else {
                break
            }
        } while (messages.length === limit) 

        console.log(`Export chat ${process.env.PEER_ID} history finished`)
    }
    catch (e) {
        console.error('Get chat history error', e.message)
        console.log(e)
    }

    console.log('finished')

})()
