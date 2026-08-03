const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    if (!sock.authState.creds.registered) {
        const numero = '258843297841' // teu número
        const code = await sock.requestPairingCode(numero)
        console.log("SEU CÓDIGO É:", code) // Vai aparecer tipo: 7XZQ-9KLM
    }

    sock.ev.on('creds.update', saveCreds)
}
startBot()
