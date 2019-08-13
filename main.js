var Watcher = require("feed-watcher");
var request = require("request");

var feeds = [
	// list of feeds to watch
	{
		feed: "https://www.aboutchromebooks.com/feed/",
		name: "AboutChromebooks.com",
		profilePicture:
			"https://cdn.discordapp.com/emojis/363434654000349184.png?v=1",
		filters: ["deal", "deals"],
		requiredFiters: []
	},
	{
		feed: "https://www.androidpolice.com/feed/",
		name: "AndroidPolice.com",
		profilePicture:
			"https://lh4.googleusercontent.com/-2lq9WcxRgB0/AAAAAAAAAAI/AAAAAAAAAQk/u15SBRi49fE/s250-c-k/photo.jpg",
		filters: ["deal", "deals", "sale", "sales"],
		mustHaveFilters: ["chromebook", "chromebooks", "chromeos"]
	}
];
var interval = 360; // interval to poll feeds

var webhookUrl = process.env.dealsWebhook; // stores the URL the response needs to be sent to - secret!

feeds.map(feed => {
	const watcher = new Watcher(feed, interval);
	watcher.on("new entries", function(entries) {
		// watch for new entries to the RSS feed
		entries.forEach(function(entry) {
			console.log(entry.title);
			if (checkFilters) {
				articleDetails = {
					publisher: feed.name,
					description: sanitizeArticle(entry.description),
					entry: entry,
					profilePicture: feed.profilePicture,
					summary: `<@&550081231266643968> A new deal has been posted on ${
						feed.name
					} Click the title below to get more information.`
				};

				console.log(
					"Attempting to send new post with title '" + entry.title + "'"
				);
				var preparedObject = prepareObject(articleDetails);
				sendEmbed(preparedObject);
			} else {
				console.log("Post filtered out, not ChromeOS related.");
			}
		});
	});
	watcher.start().catch(function(error) {
		console.error(error);
	});
});

function checkFilters(articleCategories, filters, requiredFiters) {
	articleCategories.map(category => {
		category.toLowerCase();
	});

	var found = false;
	if (requiredFiters.length === 0) {
		filters.map(filter => {
			if (articleCategories.includes(filter)) {
				found = true;
			}
		});
	} else {
		var foundRequired = false;
		filters.map(filter => {
			if (articleCategories.includes(filter)) {
				found = true;
			}
		});
		requiredFilters.map(filter => {
			if (articleCategories.includes(filter)) {
				foundRequired = true;
			}
		});
		found = foundRequired && found;
	}
	return found;
}

function sanitizeArticle(description) {
	description
		.replace(/[\r\n]/g, " ")
		.replace(" .", ".") // we want to remove any line breaks from the blog post.
		.replace(/<(?:.|\n)*?>/gm, "")
		.replace("&nbsp;", " "); // for some reason they add HTML to the post content. Let's remove that.

	if (description.length > 150) {
		// truncate the description if more than 150 characters
		description = description.substring(0, 150).concat("...");
	}

	return description;
}

function prepareObject(articleDetails) {
	return {
		// build the response to send to Discord's webhook - base layout
		username: articleDetails.publisher,
		avatar_url: articleDetails.profilePicture,
		content: articleDetails.summary,
		embeds: [
			{
				description: articleDetails.entry.description,
				color: 3172587,
				timestamp: null,
				footer: {
					icon_url:
						"https://cdn.discordapp.com/emojis/363434654000349184.png?v=1",
					text: articleDetails.entry.author
				},
				author: {
					name: articleDetails.entry.title,
					url: articleDetails.entry.link,
					icon_url:
						"https://cdn.discordapp.com/emojis/363434654000349184.png?v=1"
				}
			}
		]
	};
}

function sendEmbed(embedObjectToSend) {
	// send the object via POST to Discord's webhook URL
	var url = webhookUrl;
	request(
		{
			url: url,
			method: "POST",
			json: true,
			body: embedObjectToSend,
			headers: {
				"content-type": "application/json"
			}
		},
		function(error, response, body) {
			console.log("error:", error); // Print the error if one occurred
			console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
		}
	);
}
