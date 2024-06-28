# poller
A simple Unreal Tournament Discord bot for voting and selecting game servers. <br /> 

This bot requires node.js to run. <br />

The current way to trigger the bot is set to type !voteserver but can be set to any keyword with or without the prefix.
After a 60 second time delay the poll will close and the bot will send a query request for the predefined server attributed to the region selected.

You need to give yourself the role "Poller" to be able to manage the bot. <br />

Bot Commands: <br />
 !votehelp (display this menu)
 !enablemapvote (enable map voting) <br />
 !disablemapvote (disable map voting) <br />
 !addmap (Add map to vote list) <br />
 !delmap number (using number from !listmaps) <br />
 !maplist (List maps loaded for voting) <br />
 !mapvotetime number (sets the map vote time in seconds) <br />
 !votetime number (sets the server vote time in seconds) <br />
 !listvotes (shows vote servers loaded) <br />
 !votetime number\` (sets the vote time in seconds) <br />
 !listvotes (shows vote servers loaded) <br />
 !delvote number (using number from !listvotes) <br />
 !addvote name flag address <br /> <br />
      example \`!addvote ip4 - USA 🇺🇸 unreal://us2.gibblets.com:7777?password=gibblets2023\` <br /> <br />
Use Unicode for Flags <br />
https://www.prosettings.com/emoji-list/ <br />
