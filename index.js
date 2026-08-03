 
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const ytSearch = require('yt-search');
const axios = require('axios');
const http = require('http');

const CRIADOR = "Peter";
const NOME_BOT = "Mashle";
const PREFIXO = "!";

// Mantem vivo
http.createServer((req, res) => res.end('Mashle ON')).listen(3000);

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({ logger: pino({ level: 'silent' }), printQRInTerminal: true, auth: state });
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if(qr) qrcode.generate(qr, {small: true});
        if(connection === 'close') startBot();
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
            if(cmd === 'menu'){ await sock.sendMessage(de, { text: `*MENU ${NOME_BOT}*\n!musica nome\n!img descrição\nMe marca pra conversar` }); }
            if(cmd === 'musica' && pesquisa){
                const res = await ytSearch(pesquisa);
                const video = res.videos[0];
                const link = `https://api.vevioz.com/api/button/mp3/${video.videoId}`
                await sock.sendMessage(de, { audio: { url: link }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` });
            }
            if(cmd === 'img' && pesquisa){
                const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(pesquisa)}`;
                const img = await axios.get(url, { responseType: 'arraybuffer' });
                await sock.sendMessage(de, { image: img.data, caption: pesquisa });
            }
        }
        if(texto.includes(`@${NOME_BOT}`)){
            await sock.sendMessage(de, { text: `@${sender.split('@')[0]} Fala. Tô treinando.`, mentions: [sender] });
        }
    });
}
startBot();
