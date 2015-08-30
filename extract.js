var fs = require('fs');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var urlParser = require('url');
var webshot = Promise.promisify(require('webshot'));
var keys = require('./keys.js')
var cloudinary = Promise.promisifyAll(require('cloudinary'));
cloudinary.config(keys.cloudinaryConfig);


exports.url = function (url) {
  var output;
  return request(url)
          .spread(function(response, body) {
            output = { 'title': undefined, 'description': undefined, 'favicon': undefined, 'images': [], 'url': undefined };
            $ = cheerio.load(body);
            output.url = url;
            getTitle($, url, output);
            getDescription($, output);
            getFavicon($, url, output);
            getImages($, output, url);
          })
          .then(function(output){
            return webshot(url, 'frog.png');
          })
          .then(function(data) {
            return cloudinary.uploader.upload("frog.png");
          })
          .then(function(data){
            output.images.unshift(data.url);
            fs.unlinkSync("frog.png");
            console.log(output);
          })
          .catch(function(err) {
              console.error(err);
          });
}

 
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

function getImages($, output, url) {
  var imageArray = []; 
  var images = $("img");
  var imageLength = images.length;
  for ( var i = 0; i < images.length; i++) {
    if (images[i].attribs.src) {
      var image = enforceAbsoluteLink(url, images[i].attribs.src) 
      imageArray.push(image);
    }
  }
  output.images = imageArray;
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
