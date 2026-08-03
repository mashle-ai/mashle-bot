const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const pino = require('pino')

const { state, saveState } = useSingleFileAuthState('./auth.json') // 1 arquivo só

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04']
    })

    // Pede código só na primeira vez
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            const code = await sock.requestPairingCode('258843297841')
            console.log('\n======== CÓDIGO: ' + code + ' ========\n')
        }, 3000)
    }

    sock.ev.on('creds.update', saveState) // salva no auth.json

    sock.ev.on('connection.update', (update) => {
        if(update.connection === 'open') console.log('BOT CONECTADO E LISO!')
    })
}

startBot()
