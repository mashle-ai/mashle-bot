const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const pino = require('pino')
const { state, saveState } = useSingleFileAuthState('./auth.json')

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode('258843297841')
                console.log('\n======== CÓDIGO: ' + code + ' ========\n')
            } catch(e) { console.log("Erro:", e) }
        }, 5000)
    }

    sock.ev.on('creds.update', saveState)
}

startBot()
