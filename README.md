# poller
A simple Unreal Tournament Discord bot for voting and selecting game servers. 

This bot requires node.js to run 

The current way to trigger the bot is set to type !voteserver but can be set to any keyword with or without the prefix.
After a 60 second time delay the poll will close and the bot will send a query request for the predefined server attributed to the region selected.

You need to give yourself the role "Poller" to be able to manage the bot.

Bot Commands:

!listvotes (shows vote servers loaded)
!votelimit number (sets the time for the vote in seconds)
!delvote number (using number from !listvotes)
!addvote name flag address
example !addvote ip4 - USA 🇺🇸 unreal://us2.gibblets.com:7777?password=gibblets2023

Use Unicode for Flags
https://www.prosettings.com/emoji-list/
