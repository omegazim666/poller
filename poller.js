require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('debug', console.log);

client.login(process.env.BOT_TOKEN);

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const serverId = message.guild.id;
  const serverDataFile = path.join(__dirname, `${serverId}_serverdata.txt`);

  if (!fs.existsSync(serverDataFile)) {
    fs.writeFileSync(serverDataFile, JSON.stringify({ voteOptions: [], pollDuration: 60 }));
  }

  let serverData = JSON.parse(fs.readFileSync(serverDataFile));

  let { voteOptions, pollDuration } = serverData;

  if (!Array.isArray(voteOptions)) {
    voteOptions = []; // Initialize as empty array if not already an array
    serverData.voteOptions = voteOptions;
    fs.writeFileSync(serverDataFile, JSON.stringify(serverData));
  }

  if (message.content.startsWith('!voteserver')) {
    console.log('Trigger text detected. Starting poll...');
    await createPoll(message, voteOptions, pollDuration);
  } else if (message.content.startsWith('!votetime')) {
    if (!message.member.roles.cache.some(role => role.name === 'Poller')) {
      message.channel.send('You do not have access to this command.');
      return;
    }

    const args = message.content.split(' ');
    const newDuration = parseInt(args[1], 10);

    if (!isNaN(newDuration) && newDuration > 0) {
      pollDuration = newDuration;
      serverData.pollDuration = pollDuration;
      fs.writeFileSync(serverDataFile, JSON.stringify(serverData));
      message.channel.send(`Poll duration set to ${pollDuration} seconds.`);
    } else {
      message.channel.send('Please provide a valid number of seconds for the poll duration.');
    }
  } else if (message.content.startsWith('!addvote')) {
    if (!message.member.roles.cache.some(role => role.name === 'Poller')) {
      message.channel.send('You do not have access to this command.');
      return;
    }

    const args = message.content.split(' ');
    const name = args.slice(1, -2).join(' ');
    const emoji = args[args.length - 2];
    const address = args[args.length - 1];

    if (name && emoji && address) {
      voteOptions.push({ name, emoji, address });
      serverData.voteOptions = voteOptions;
      fs.writeFileSync(serverDataFile, JSON.stringify(serverData));
      message.channel.send(`Added vote option: ${name} ${emoji} ${address}`);
    } else {
      message.channel.send('Please provide the name, emoji, and address in the correct format.');
    }
  } else if (message.content.startsWith('!removevote')) {
    if (!message.member.roles.cache.some(role => role.name === 'Poller')) {
      message.channel.send('You do not have access to this command.');
      return;
    }

    const args = message.content.split(' ');
    const name = args.slice(1).join(' ');

    const optionIndex = voteOptions.findIndex(option => option.name === name);
    if (optionIndex !== -1) {
      voteOptions.splice(optionIndex, 1);
      serverData.voteOptions = voteOptions;
      fs.writeFileSync(serverDataFile, JSON.stringify(serverData));
      message.channel.send(`Removed vote option: ${name}`);
    } else {
      message.channel.send('Vote option not found.');
    }
  } else if (message.content.startsWith('!listvotes')) {
    listVotes(message, voteOptions);
  } else if (message.content.startsWith('!delvote')) {
    if (!message.member.roles.cache.some(role => role.name === 'Poller')) {
      message.channel.send('You do not have access to this command.');
      return;
    }

    const args = message.content.split(' ');
    const index = parseInt(args[1], 10) - 1;

    if (!isNaN(index) && index >= 0 && index < voteOptions.length) {
      const removedOption = voteOptions.splice(index, 1)[0];
      serverData.voteOptions = voteOptions;
      fs.writeFileSync(serverDataFile, JSON.stringify(serverData));
      message.channel.send(`Removed vote option: ${removedOption.name}`);
    } else {
      message.channel.send('Please provide a valid number corresponding to the vote option.');
    }
  } else if (message.content.startsWith('!votehelp')) {
    const helpEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Vote commands')
      .setDescription(`
      \`!listvotes\` (shows vote servers loaded)
      \`!delvote number\` (using number from !listvotes)
      \`!addvote name flag address\`
      example \`!addvote ip4 - USA 🇺🇸 unreal://us2.gibblets.com:7777?password=gibblets2023\`
      Use Unicode for Flags
      `);

    message.channel.send({ embeds: [helpEmbed] });
  }
});

function listVotes(message, voteOptions) {
  if (voteOptions.length === 0) {
    message.channel.send('No vote options available.');
    return;
  }

  const voteList = voteOptions.map((option, index) => `${index + 1}. ${option.name} ${option.emoji} ${option.address}`).join('\n');
  message.channel.send(`Current vote options:\n${voteList}`);
}

async function createPoll(message, voteOptions, pollDuration) {
  console.log('createPoll function called!');

  const pollEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`<a:ut_spin:708486726934331403>  Server Selection, ${pollDuration} seconds to vote!  <a:netscape:655578717736796181>`)
    .setDescription('React with the corresponding emoji to vote for your preferred server.')
    .addFields(voteOptions.map(option => ({ name: option.name, value: `React with ${option.emoji} for ${option.name}` })));

  const sentMessage = await message.channel.send({ content: 'Poll is now live!', embeds: [pollEmbed] });
  console.log('Poll message sent.');

  // React with the emojis for voting
  for (const option of voteOptions) {
    await sentMessage.react(option.emoji);
  }

  console.log(`Poll will close in ${pollDuration} seconds.`);

  // Wait for the poll duration
  await new Promise(resolve => setTimeout(resolve, pollDuration * 1000));

  const reactions = sentMessage.reactions.cache;
  console.log('Collected reactions:', reactions);

  // Fetch and count votes, excluding bot reactions
  const votes = await Promise.all(voteOptions.map(async option => {
    const reaction = reactions.get(option.emoji);
    if (reaction) {
      const users = await reaction.users.fetch();
      return { option, count: users.filter(user => !user.bot).size };
    } else {
      return { option, count: 0 };
    }
  }));

  console.log('Votes:', votes);

  const maxVotes = Math.max(...votes.map(vote => vote.count));
  const tiedOptions = votes.filter(vote => vote.count === maxVotes).map(vote => vote.option);

  console.log('Tied options:', tiedOptions);

  let winningOption;
  if (tiedOptions.length === 1) {
    winningOption = tiedOptions[0];
  } else if (tiedOptions.length > 1) {
    const randomIndex = Math.floor(Math.random() * tiedOptions.length);
    winningOption = tiedOptions[randomIndex];
    message.channel.send('🎲 Options tied, using random selection.');
  }

  if (winningOption) {
    const winningAnnouncement = `<:winston:1178434656807440424> The winning poll is: ${winningOption.name}`;
    message.channel.send(winningAnnouncement);

    message.channel.send(`${winningOption.emoji} Server IP: ${winningOption.address}`);
  } else {
    message.channel.send('No valid poll option found. Poll could not determine a winner.');
  }
}
