// In order for this bot to work, we have to register the desired commands first, you can use
// the deployment script in src/deployment/commands.js

// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
// Load the process envs
import dotenv from 'dotenv';
dotenv.config();
const TOKEN = process.env.RBR_BOT_TOKEN;

class Eligibility {
	constructor() {
		// Create a new client instance
		this._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
		// Login to Discord with your client's token
		this._client.login(TOKEN);
	}

	listenForCommands(messageFilter) {
        this._client.once('ready', () => {
            console.log('Eligibility Ready!');
        });

        this._client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            // TODO:: Write logic which checks if the user is eligible based on the other two bots
            // You can take the user id from interaction.user.id
            if (interaction.commandName === 'eligible') {
                const address = interaction.options.getString('address');
                console.log(address);
                await interaction.reply({ content: 'eligible!', ephemeral: true });
            }
          });
	}
}

export default Eligibility;