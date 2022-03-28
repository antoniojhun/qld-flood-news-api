const PORT = 8080;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const publications = [
	{
		name: "NEWS.com.au",
		address: "https://www.news.com.au/national/queensland",
		base: "",
		//article.storyblock
	},
	{
		name: "7NEWS",
		address: "https://7news.com.au/news/qld",
		base: "",
		//css-c8eknp-StyledSNEnt efjxvb7
	},
	{
		name: "9NEWS",
		address: "https://www.9news.com.au/queensland",
		base: "",
		//article.story-block
	},
	{
		name: "ABC NEWS",
		address: "https://www.abc.net.au/news/",
		base: "",
		//$("li[data-component='ListItem']")
	},
];
const articles = [];

publications.forEach((publication) => {
	axios.get(publication.address).then((response) => {
		const html = response.data;
		const $ = cheerio.load(html);

		$('a:contains("flood")', html).each(function () {
			const title = $(this).text();
			const url = $(this).attr("href");

			articles.push({
				title,
				url: publication.base + url,
				source: publication.name,
			});
		});
	});
});

app.get("/", (req, res) => {
	res.json("Welcome to Queensland Flood News API");
});

app.get("/news", (req, res) => {
	res.json(articles);
});

app.get("/news/:publicationId", (req, res) => {
	const publicationId = req.params.publicationId;

	const publicationAddress = publications.filter(
		(publication) => publication.name == publicationId
	)[0].address;
	const publicationBase = publications.filter(
		(publication) => publication.name == publicationId
	)[0].base;

	axios
		.get(publicationAddress)
		.then((response) => {
			const html = response.data;
			const $ = cheerio.load(html);
			const specificArticles = [];

			$('a:contains("flood")', html).each(function () {
				const title = $(this).text();
				const url = $(this).attr("href");
				specificArticles.push({
					title,
					url: publicationBase + url,
					source: publicationId,
				});
			});
			res.json(specificArticles);
		})
		.catch((err) => console.log(err));
});

app.listen(PORT, () => console.log("server is running on PORT " + PORT));
