const SpotifyWebApi = require("spotify-web-api-node");
const config = require("./config");

const spotifyApi = new SpotifyWebApi({
  clientId: config.spotifyClientId,
  clientSecret: config.spotifyClientSecret,
  redirectUri: config.spotifyRedirectUri,
});

module.exports = spotifyApi;
