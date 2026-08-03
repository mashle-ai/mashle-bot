const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const ytSearch = require('yt-search');
const axios = require('axios');
const http = require('http');
const QRCode = require('qrcode');

const CRIADOR = "Peter";
const NOME_BOT = "Mashle";
const PREFIXO = "!";

http.createServer((req, res) => res.end('Mashle ON')).listen(process.env.PORT || 3000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state
    });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;
        if(qr){
            const qrUrl = await QRCode.toDataURL(qr);
            console.log(`\n\n===== ESCANEIE ESSE QR AQUI =====\n${qrUrl}\n===== ESCANEIE ESSE QR AQUI =====\n\n`);
        }
        if(connection === 'close') {
            if(lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) startBot();
        }
        if(connection === 'open') console.log(`✅ ${NOME_BOT} ON! Criado pelo ${CRIADOR}`);
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if(!msg.message || msg.key.fromMe) return;
        const de = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if(texto.startsWith(PREFIXO)){
            const [cmd,...args] = texto.slice(1).trim().split(/ +/);
            const pesquisa = args.join(" ");

            if(cmd === 'menu'){
                await sock.sendMessage(de, { text: `*MENU ${NOME_BOT}*\n\n!musica nome\n!img descrição\nMe marca @${NOME_BOT}` });
            }
            if(cmd === 'musica' && pesquisa){
                await sock.sendMessage(de, { text: `Buscando ${pesquisa}...` });
                const res = await ytSearch(pesquisa);
                const video = res.videos[0];
                if(!video) return sock.sendMessage(de, { text: 'Musica não encontrada' });
                const link = `https://api.vevioz.com/api/button/mp3/${video.videoId}`
                await sock.sendMessage(de, { audio: { url: link }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` });
            }
            if(cmd === 'img' && pesquisa){
                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(pesquisa)}`;
                const img = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(de, { image: img.data, caption: pesquisa });
            }
        }
        if(texto.toLowerCase().includes(NOME_BOT.toLowerCase())){
            await sock.sendMessage(de, { text: `@${sender.split('@')[0]} Tô aqui. Bora treinar?`, mentions: [sender] });
        }
    });
}
startBot();
