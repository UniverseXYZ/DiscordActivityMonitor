const Discord = require('discord.js');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const client = new Discord.Client();
const adapter = new FileSync('db.json')
const db = low(adapter)

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let authorID = msg.author.id
  if(db.has(authorID).value() == false){
    db.set(authorID, 0)
      .write()
  } else {
    db.update(authorID, n => n + 1)
      .write()
  }

  if (msg.content === '!postcount') {
    let reply = db.get(authorID).value()
    console.log(reply)
    msg.reply(reply);
  }
});

client.login(process.env.TOKEN)
