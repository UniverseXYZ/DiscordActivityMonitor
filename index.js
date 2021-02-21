const Discord = require('discord.js');
const { Pool } = require('pg');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const client = new Discord.Client();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
let pg_client;

const adapter = new FileSync('db.json')
const db = low(adapter)

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  pg_client = await pool.connect();
  const result = await pg_client.query('CREATE TABLE IF NOT EXISTS counter (id integer, count integer);');
  console.log(result)
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
