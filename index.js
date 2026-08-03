const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth')
    const { version } = await fetchLatestBaileysVersion()
    
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true // <-- ISSO AQUI
    })

    sock.ev.on('connection.update', (update) => {
        const { qr } = update
        if(qr) {
            console.log('ESCANEIA ESSE QR CODE AQUI DE BAIXO:')
            qrcode.generate(qr, {small: true})
        }
        if(update.connection === 'open') {
            console.log('✅ Mashle ON! Conectado')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()
