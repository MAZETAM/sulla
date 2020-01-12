// const sulla = require('../dist/index');
// var create = require("sulla").create;
// import { create, Whatsapp, decryptMedia} from 'sulla-hotfix';
import { create, Whatsapp, decryptMedia, ev } from '../src/index';
const mime = require('mime-types');
const fs = require('fs');

ev.on('qr.**', async (qrcode,sessionId) => {
  // console.log("TCL: qrcode", qrcode)
  //     console.log("TCL: qrcode,sessioId", qrcode,sessionId)
  //base64 encoded qr code image
  const imageBuffer = Buffer.from(qrcode.replace('data:image/png;base64,',''), 'base64');
  fs.writeFileSync(`qr_code${sessionId?'_'+sessionId:''}.png`, imageBuffer);
});

async function start(client: Whatsapp) {
  // const chats = await client.getAllChatsWithMessages(false);
  // console.log("TCL: start -> chats", chats)
  // console.log("TCL: getAllChatsWithMessages ->", chats.length, chats[0]);
  // console.log("TCL: start ->chats", chats[0].msgs);

  // const newMessages = await client.getAllUnreadMessages();
  // console.log("TCL: start -> newMessages", newMessages)
  // console.log("TCL: getAllNewMessages ->", newMessages.length, newMessages[0]);


  client.onMessage(async message => {
    try {
    const isConnected = await client.isConnected();
    console.log("TCL: start -> isConnected", isConnected)
    if (message.mimetype) {
      const filename = `${message.t}.${mime.extension(message.mimetype)}`;
      const mediaData = await decryptMedia(message);
      // you can send a file also with sendImage or await client.sendFile
      await client.sendImage(
        message.from,
        `data:${message.mimetype};base64,${mediaData.toString('base64')}`,
        filename,
        `You just sent me this ${message.type}`
      );
      fs.writeFile(filename, mediaData, function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('The file was saved!');
      });
    } else if (message.type==="location") {
      console.log("TCL: location -> message", message.lat, message.lng, message.loc)
      await client.sendLocation(message.from, `${message.lat}`, `${message.lng}`, `Youre are at ${message.loc}`)
    } else {
      await client.sendText(message.from, message.body);
      await client.sendGiphy(message.from,'https://media.giphy.com/media/oYtVHSxngR3lC/giphy.gif','Oh my god it works');
    }
    } catch (error) {
    console.log("TCL: start -> error", error)
    }
  });
}

//you can now create two sessions pointing 
//two the same message handler

//it can be null, which will default to 'session' folder
create('session',{
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
}).then(client => start(client));

//or you can set a 'session id'
// create('newsession').then(client => start(client));

//DO NOT HAVE TO SESSIONS WITH THE SAME ID

//BE WARNED, SETTING THIS UP WITH 2 NUMBERS WILL RESULT IN AN ECHO CHAMBER
//IF YOU SEND AN IMAGE WITH ONE PHONE IT WILL PING PONG THAT IMAGE FOR ETERNITY
