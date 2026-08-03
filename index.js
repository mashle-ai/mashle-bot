const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const { version } = await fetchLatestBaileysVersion()
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    })

    // Gera código de pareamento
    if (!sock.authState.creds.registered) {
        await delay(3000)
        const phoneNumber = '258843297841' // SEU NUMERO
        const code = await sock.requestPairingCode(phoneNumber)
        console.log('SEU CODIGO:', code) // Vai aparecer nos Logs
    }

    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('connection.update', (update) => {
        const { connection } = update
        if(connection === 'open') {
            console.log('✅ Mashle ON! Criado pelo Peter')
        }
    })
}

startBot()
