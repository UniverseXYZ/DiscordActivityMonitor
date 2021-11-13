// Before we start, it’s important to ensure that your bot has the applications.commands scope selected when creating the bot invite link
// https://discord.com/api/oauth2/authorize?client_id=<YOUR_BOT_ID_HERE>&scope=applications.commands

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { SlashCommandBuilder } from '@discordjs/builders';

// Load the process envs
import dotenv from 'dotenv';
dotenv.config();
const TOKEN = process.env.RBR_BOT_TOKEN;
const CLIENT_ID = process.env.SC_CLIENT_ID;
const GUILD_ID = process.env.SC_GUILD_ID;

const commands = [
	new SlashCommandBuilder()
		.setName('eligible')
		.setDescription('Check if user is eligible !')
		.addStringOption(option =>
			option.setName('address')
				.setDescription('User address to be used if eligible')
				.setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);