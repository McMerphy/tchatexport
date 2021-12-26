/* eslint-disable no-undef */

// Load env variables
require('dotenv').config({ path: `${__dirname}/.env` })

const { TelegramClient } = require('telegram')
const { StringSession } = require('telegram/sessions')
const input = require('input')
const { Api } = require("telegram/tl")
const fs = require('fs')


const stringSession = new StringSession('1AgAOMTQ5LjE1NC4xNjcuNTEBu62tC189fAqBYynFRvsZZYurILhlFpbzQi10KfXdE0ppudDoSs28ZGl6ncrKWwDwf+SyerccFa18IePsqYfFaBSikCdkeFZg0aPLjpVimWe95HNVopvi6C6H0egk/NOqbWzfk6E3ExexyUex4YQXusnAE69p9K0mCctct+d3/AMU5LtrwkT9/BoXW8ueiyxJZvuQ17Czv+lAYvjyeID0IkmaHLMHbLKXJ9IXTbXSDpHJFRAtr8uFVF1pj0euT4OWvKanVYFT52ezxhuVxjTxjPW8HmsV4uQXx2GvtVI9aB7Z9QJ/riqIxA/u3HVYzTZgE+ua9aOE7dbhW/bOyiqo2Xo='); // fill this later with the value from session.save()
(async () => {
    console.log('Loading interactive example...')
    const client = new TelegramClient(stringSession,
        parseInt(process.env.TELEGRAM_API_ID),
        process.env.TELEGRAM_API_HASH,
        { connectionRetries: 5 })
    await client.start({
        phoneNumber: () => { return "+375445886513" },
        password: () => { return "9095903" },
        phoneCode: async () => await input.text('Code ?'),
        onError: (err) => console.log(err),
    })
    console.log('You should now be connected.')
    console.log(client.session.save())
    
    console.log("Export chat history...")

    let fileIndex = 0
    let offsetId = 0
    let limit = 50
    let dialogsDir = './dialogs/' + process.env.PEER_ID
    fs.mkdirSync(dialogsDir, {
        recursive: true
    })

    try {
        do {
            const history = await client.invoke(
                new Api.messages.GetHistory({
                    peer: process.env.PEER_ID,
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

    client.stop()

})()
