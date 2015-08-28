var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var urlParser = require('url');
var url = process.argv[2];

request(url).spread(function(response, body) {
    var output = { 'title': undefined, 'description': undefined, 'favicon': undefined, 'images': [], 'url': undefined };
    $ = cheerio.load(body);
    output.url = url;
    getTitle($, url, output);
    getDescription($, output);
    getFavicon($, url, output);
    console.log(output);
}).catch(function(err) {
    console.error(err);
});

 
function getTitle ($, url, output) {
  output.title = urlParser.parse(url).hostname;
  output.title = $('title').text();
}

function getDescription($, output) {
  // TODO ... will .attrfail of $("meta[name='description']") is empty?
  output.description = $("meta[name='description']").attr('content');
}


function getFavicon($, url, output) {
  var first = $("link[rel='icon']").attr('href');
  var second = $("link[rel='shortcut icon']").attr('href');
  var third = $("meta[itemprop='image']").attr('content');
  var faviconGuesses = [first, second, third];
  faviconGuesses = faviconGuesses.filter(function(guess){ return guess; })
  faviconGuesses = faviconGuesses.map(function(guess) { return enforceAbsoluteLink(url, guess) })
  output.favicon = prefrencePngFavicons(faviconGuesses);
}

function enforceAbsoluteLink (url, link) {
  if (link[0] !== '/') {
    return link;
  } else {
    return url + link
  }
}

function prefrencePngFavicons (links) {
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var lastForChars = link.substring(link.length - 4, link.length)
    if (lastForChars === '.png') {
      return link;
    }
  }
  return links[0];
}
