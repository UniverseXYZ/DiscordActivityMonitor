// In order for this bot to work, we have to register the desired commands first, you can use
// the deployment script in src/deployment/commands.js

// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import fs from 'fs';
// Load the process envs
import dotenv from 'dotenv';
dotenv.config();
const TOKEN = process.env.RBR_BOT_TOKEN;
const REWARD_EARLY_COMUNNITY_OUTPUT_DIR = process.env.REC_OUTPUT_DIR;
const ELIGIBLE_OUTPUT_DIR = process.env.ELGB_OUTPUT_DIR;
import EthereumAddress from 'ethereum-address';
class Eligibility {
	constructor() {
		// Create a new client instance
		this._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
		// Login to Discord with your client's token
		this._client.login(TOKEN);
        this._rewardEarlyCommunityUsers = null;
	}

    loadFiles() {
        return new Promise(res => {
            const rawdataEarlyComunnity = fs.readFileSync(REWARD_EARLY_COMUNNITY_OUTPUT_DIR);
            this._rewardEarlyCommunityUsers = JSON.parse(rawdataEarlyComunnity);
            res();
        })
    }

	listenForCommands(messageFilter) {
        this._client.once('ready', () => {
            console.log('Eligibility Ready!');
        });

        this._client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            // You can take the user id from interaction.user.id
            if (interaction.commandName === 'eligible') {
                const address = interaction.options.getString('address');
                const isAddress = EthereumAddress.isAddress(address);

                // The user has send invalid address
                if (!isAddress) {
                    return await interaction.reply({ content: 'Please send valid address !', ephemeral: true });
                }

                const userId = interaction.user.id;
                // TODO:: should we check in the two bots files for id occurance ?
                const user = this._rewardEarlyCommunityUsers.find(u => u.id === userId);
                // The user is not eligible
                if (!user) {
                    return await interaction.reply({ content: 'Sorry you are not eligible !', ephemeral: true });
                }

                // Read the Eligible file
                const alreadyEligible = await this._alreadyEligible(userId);

                // The user is already in the list
                if (alreadyEligible) {
                    return await interaction.reply({ content: 'Sorry you are already in the list !', ephemeral: true });
                }

                // Add user to the list
                const rawdata = fs.readFileSync(ELIGIBLE_OUTPUT_DIR);
                const users = JSON.parse(rawdata);
                const newUsers = [...users, {
                    ...user,
                    address
                }];

                await this._saveFile(newUsers);

                console.log(user);
                await interaction.reply({ content: 'eligible!', ephemeral: true });
            }
          });
	}

    _alreadyEligible(id) {
        return new Promise(res => {
            const rawdata = fs.readFileSync(ELIGIBLE_OUTPUT_DIR);
            const users = JSON.parse(rawdata);
            const user = users.find(u => u.id === id);
            res(user);
        })
    }

    _saveFile(data) {
        return new Promise(res => {
            const file = fs.createWriteStream(ELIGIBLE_OUTPUT_DIR);
            file.write("[" + "\n");

            data.forEach((user, index) => {
                const isLast = index === data.length - 1;
                file.write(
                `	{ "username": "${user.username}", "address": "${user.address}", "id": "${user.id}", "isMember": "${user.isMember}", "postsCount": "${user.postsCount}"}${isLast ? '' : ','}` + "\n"
                );
            });

            file.write("]");
            file.end(res);

            console.log("Eligible File Saved !");
        })
    }
}

export default Eligibility;