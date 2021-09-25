import RewardEarlyComunnity from './src/bots/RewardCommunity/index.js';
import RewardByRank from './src/bots/RewardByRank/index.js';

const RewardCommunityBot = new RewardEarlyComunnity();
await RewardCommunityBot.scrapeUSers();
RewardCommunityBot.getUsers(1, true);

const RewardByRankBot = new RewardByRank();
await RewardByRankBot.scrapeUSers('gm');
RewardByRankBot.getUsers(2);
