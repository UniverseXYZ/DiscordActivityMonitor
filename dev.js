const Discord = require('discord.js');
const client = new Discord.Client();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetch_messages(channel){
  channel.messages.fetch({ limit: 100 })
    .then(messages => handle_messages(messages, channel))
    .catch(console.error);
}

async function fetch_messages_from(channel, last_msg_id){
  channel.messages.fetch({ limit: 100, before: last_msg_id})
    .then(messages => handle_messages(messages, channel))
    .catch(console.error);
}


async function handle_messages(messages, channel){
  console.log(channel.name)
  const last_message_id = messages.array().slice(-1)[0].id
  console.log(`Received ${messages.size} messages from ${channel.name}: ${last_message_id}`)
  messages.forEach((message) => {
    //console.log(message.author.id)
  });
  if (messages.array().length == 100){
    await sleep(1000)
    fetch_messages_from(channel, last_message_id)
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  for (const guild of client.guilds.cache.array()) {
    for (const channel of guild.channels.cache.array()){
      if(channel.type == "text"){
        await fetch_messages(channel)
      }
    }
  }
});

client.on('message', async msg => {
  let authorID = msg.author.id.toString()
  if (msg.content === '!test') {
    msg.reply(authorID);
  }
});

client.login("ODEyODkyNjE0OTE5MTkyNjI3.YDHXPg.AjZ5XdCn8SxYtjytNVyuGPxljy4")
