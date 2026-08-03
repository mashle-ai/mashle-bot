const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay, DisconnectReason } = require('@whiskeysockets/baileys')
const fs = require('fs')

async function startBot() {
    // Apaga auth antiga
    if (fs.existsSync('./auth')) fs.rmSync('./auth', { recursive: true, force: true })

    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const { version } = await fetchLatestBaileysVersion()
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    })

    if (!sock.authState.creds.registered) {
        await delay(5000)
        const phoneNumber = '843297841' // <-- CONFERE SE TA ASSIM
        const code = await sock.requestPairingCode(phoneNumber)
        console.log('SEU CODIGO:', code)
    }

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (u) => { if(u.connection === 'open') console.log('✅ CONECTADO') })
}

startBot()
