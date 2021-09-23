import RewardEarlyComunnityBot from './src/bots/RewardEarlyCommunity/index.js';

const RewardCommunityBot = new RewardEarlyComunnityBot();
await RewardCommunityBot.scrapeUSers();
RewardCommunityBot.getUsers(1, true);
