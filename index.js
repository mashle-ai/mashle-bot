const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const { version } = await fetchLatestBaileysVersion()
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('connection.update', (update) => {
        const { qr, connection } = update
        if(qr) {
            console.log('ESCANEIA ESSE QR:')
            qrcode.generate(qr, {small: true})
        }
        if(connection === 'open') console.log('✅ CONECTADO')
    })
    sock.ev.on('creds.update', saveCreds)
}
startBot()
