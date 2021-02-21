const Discord = require('discord.js')
const { Pool } = require('pg')

const client = new Discord.Client()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
let pg_client

async function connect_table(){
  pg_client = await pool.connect()
  await pg_client.query('CREATE TABLE IF NOT EXISTS counter (id text UNIQUE, count integer);')
  return pg_client
}

async function update(authorID){
  await pg_client.query('INSERT INTO counter (id, count) VALUES ($1, 0) ON CONFLICT (id) DO NOTHING;', [authorID])
  await pg_client.query('UPDATE counter SET count = count + 1 WHERE id = $1;', [authorID])
}

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
    .catch(console.error)
}

async function handle_messages(messages, channel){
  const last_message_id = messages.array().slice(-1)[0].id
  console.log(`Received ${messages.size} messages from ${channel.name}: ${last_message_id}`)
  messages.forEach((message) => {
    let authorID = message.author.id.toString()
    update(authorID)
  })
  if (messages.array().length == 100){
    await sleep(1000)
    fetch_messages_from(channel, last_message_id)
  }
}

async function run_backfill(){
  for (const guild of client.guilds.cache.array()) {
    for (const channel of guild.channels.cache.array()){
      if(channel.type == "text"){
        await fetch_messages(channel)
      }
    }
  }
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  pg_client = connect_table()
  if(process.env.backfill == 1){
    run_backfill()
  }
})

client.on('message', async msg => {
  let authorID = msg.author.id.toString()
  update(authorID)
  if (msg.content === '!postcount') {
    let result = await pg_client.query('SELECT count FROM counter WHERE id = $1;', [authorID])
    let reply = result['rows'][0].count
    msg.reply(reply)
  }
})

client.login(process.env.TOKEN)
