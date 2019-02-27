var Watcher = require('feed-watcher'),
    abc = "https://www.aboutchromebooks.com/feed/",
    ap = "https://www.androidpolice.com/feed/",
    interval = 360; // interval to poll the feed in seconds
var request = require('request');
var webhookUrl = process.env.dealsWebhook; // stores the URL the response needs to be sent to - secret!

console.log("Starting abcWatcher service...")

var abcWatcher = new Watcher(abc, interval);
var apWatcher = new Watcher(ap, interval);

abcWatcher.on('new entries', function(entries) { // watch for new entries to the RSS feed
    entries.forEach(function(entry) {
        console.log(entry);
        if (entry.categories.includes("Deals")) { // filter out non-deal related posts
            console.log("Attempting to send new post with title '" + entry.title + "'")
            var discordObj = { // build the response to send to Discord's webhook - base layout
                "username": "AboutChromebooks.com", 
                "avatar_url": "",
                "content": "Error finding category type!",
                "embeds": [{
                    "description": "Error finding post description!",
                    "color": 3172587,
                    "timestamp": null,
                    // "image": {
                    //     "url": null
                    // },
                    "footer": {
                        "icon_url": "https://cdn.discordapp.com/emojis/363434654000349184.png?v=1",
                        "text": "Error finding author name!"
                    },
                    "author": {
                        "name": "Error finding post title!",
                        "url": "Error finding link!",
                    "icon_url": "https://cdn.discordapp.com/emojis/363434654000349184.png?v=1"
                    }
                }]
            }
            var description = entry.description.replace(/[\r\n]/g, ' ').replace(" .", '.') // we want to remove any line breaks from the blog post.

            description = description.replace(/<(?:.|\n)*?>/gm, '').replace("&nbsp;", " "); // for some reason they add HTML to the post content. Let's remove that.

            if (description.length > 150) { // truncate the description if more than 150 characters
                description = description.substring(0, 150).concat("...");
            }
            
            var summary = "<@&550081231266643968> A new deal has been posted on https://aboutchromebooks.com!"

            // add the information specific to the blog post to the response object
            discordObj.embeds[0].description = description;
            discordObj.embeds[0].timestamp = entry.pubDate;
            discordObj.embeds[0].footer.text = entry.author;
            discordObj.embeds[0].author.name = entry.title;
            discordObj.embeds[0].author.url = entry.link;
            // discordObj.embeds[0].image.url = entry.image.url;
            discordObj.content = summary;
            
            // send the object via POST to Discord's webhook URL

            var url = webhookUrl;
            request({ 
                url: url, 
                method: "POST",
                json: true,
                body: discordObj,
                headers: {
                    "content-type": "application/json",
                }
            }, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            })
        } else {
            console.log("Post filtered out, not ChromeOS related.");
        }
    })
})

apWatcher.on('new entries', function(entries) { // watch for new entries to the RSS feed
    entries.forEach(function(entry) {
        console.log(entry);
        if ((entry.categories.includes("deal") || entry.categories.includes("deals") || entry.categories.includes("Deal") || entry.categories.includes("Deals")) && (entry.categories.includes("chromebook") || entry.categories.includes("Chromebook") || entry.categories.includes("chromebooks") || entry.categories.includes("Chromebooks") || entry.categories.includes("chromeos") || entry.categories.includes("ChromeOS"))) { // filter out non-deal related posts
            console.log("Attempting to send new post with title '" + entry.title)
            var discordObj = { // build the response to send to Discord's webhook - base layout
                "username": "AndroidPolice.com", 
                "avatar_url": "https://lh4.googleusercontent.com/-2lq9WcxRgB0/AAAAAAAAAAI/AAAAAAAAAQk/u15SBRi49fE/s250-c-k/photo.jpg",
                "content": "Error finding category type!",
                "embeds": [{
                    "description": "Error finding post description!",
                    "color": 3172587,
                    "timestamp": null,
                    // "image": {
                    //     "url": null
                    // },
                    "footer": {
                        "icon_url": "https://cdn.discordapp.com/emojis/363434654000349184.png?v=1",
                        "text": "Error finding author name!"
                    },
                    "author": {
                        "name": "Error finding post title!",
                        "url": "Error finding link!",
                    "icon_url": "https://cdn.discordapp.com/emojis/363434654000349184.png?v=1"
                    }
                }]
            }
            var description = entry.description.replace(/[\r\n]/g, ' ').replace(" .", '.') // we want to remove any line breaks from the blog post.

            description = description.replace(/<(?:.|\n)*?>/gm, '').replace("&nbsp;", " "); // for some reason they add HTML to the post content. Let's remove that.

            if (description.length > 150) { // truncate the description if more than 150 characters
                description = description.substring(0, 150).concat("...");
            }
            
            var summary = "<@&550081231266643968> A new deal has been posted on https://aboutchromebooks.com!"

            // add the information specific to the blog post to the response object
            discordObj.embeds[0].description = description;
            discordObj.embeds[0].timestamp = entry.pubDate;
            discordObj.embeds[0].footer.text = entry.author;
            discordObj.embeds[0].author.name = entry.title;
            discordObj.embeds[0].author.url = entry.link;
            // discordObj.embeds[0].image.url = entry.image.url;
            discordObj.content = summary;
            
            // send the object via POST to Discord's webhook URL

            var url = webhookUrl;
            request({ 
                url: url, 
                method: "POST",
                json: true,
                body: discordObj,
                headers: {
                    "content-type": "application/json",
                }
            }, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            })
        } else {
            console.log("Post filtered out, not ChromeOS related.");
        }
    })
})

abcWatcher
    .start()
    .catch(function(error) {
      console.error(error)
    })

apWatcher
    .start()
    .catch(function(error) {
      console.error(error)
    })

abcWatcher.stop();