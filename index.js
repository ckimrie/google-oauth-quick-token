#!/usr/bin/env node

var config = {
  "port": 8123,
  "googleBaseUrl" : "https://www.googleapis.com/discovery/v1/",
  "googleDiscoveryUrl" : "./apis?fields=items(title,discoveryLink)"
};
var request = require('request');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var inquirer = require('inquirer');
var async = require('async');
var _ = require('lodash');
var open = require('open');
var chalk = require('chalk');
var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var clientId, clientSecret, oauth2Client, server;


/**
 * Init
 */
function init(){

  inquirer.prompt([
    {
      type: "input",
      message: "What is your Google OAuth2 client ID?",
      name: "clientId",
      validate: function( answer ) {
        if ( answer.length < 1 ) {
          return "You must provide a client ID.";
        }
        return true;
      }
    },
    {
      type: "input",
      message: "What is your Google OAuth2 client secret?",
      name: "clientSecret",
      validate: function( answer ) {
        if ( answer.length < 1 ) {
          return "You must provide a client secret.";
        }
        return true;
      }
    }
  ], function(answers){
    clientId = answers.clientId;
    clientSecret = answers.clientSecret;

    request(googleUrl(config.googleDiscoveryUrl), onApiDiscoveryReturn);
  });
}






/**
 *
 * @param err
 * @param response
 * @param body
 */
function onApiDiscoveryReturn(err, response, body){
  if(err){
    console.error(err);
    process.exit(0);
  }


  var data = JSON.parse(body);
  askUserToSelectApis(data, onUserApiSelect)
}


/**
 *
 * @param {[]} data
 * @param {function} callback
 */
function askUserToSelectApis(data, callback){
  var choices = [];

  _.each(data.items, function(item){
    choices.push({
      name: item.title,
      value: item.discoveryLink,
      checked: false
    });
  });

  inquirer.prompt([
    {
      type: "checkbox",
      message: "Select APIs to request access",
      name: "apis",
      choices: choices,
      validate: function( answer ) {
        if ( answer.length < 1 ) {
          return "You must choose at least one API.";
        }
        return true;
      }
    }
  ], callback);
}

/**
 *
 * @param {[]} answers
 */
function onUserApiSelect(answers){

  fetchScopesForApis(answers.apis, function(scopes){
    askUserToSelectScopes(scopes, onUserScopeSelect);
  });

}

/**
 *
 * @param {[]} answers
 */
function onUserScopeSelect(answers){

  oauth2Client = new OAuth2Client(clientId, clientSecret, 'http://localhost:'+ config.port);

  startServer(function(){

    // generate consent page url
    var url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // will return a refresh token
      scope: answers.scopes
    });

    open(url);

  })


}

/**
 *
 * @param {function} callback
 */
function startServer(callback){
  server = http.createServer(function(request, response) {

    var urlComponents = url.parse(request.url);
    var code = querystring.parse(urlComponents.query).code;

    oauth2Client.getToken(code, function(err, tokens) {
      // set tokens to the client
      // TODO: tokens should be set by OAuth2 client.
      console.log('');
      console.log('');
      console.log(chalk.underline.white('Copy and paste the following token into your config:'));
      console.log(chalk.white(JSON.stringify(tokens, null, 4)));


      oauth2Client.setCredentials(tokens);

      var body = "<html><head>" +
        "<title>Youtube API OAuth token</title>" +
        "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css\">" +
        "</head><body>" +
        "<div class='container'>" +
        "<h1>Google API OAuth token</h1>" +
        "<h5>Copy and paste the following token into your config:</h5>" +
        "<pre class='col-xs-6'>" + JSON.stringify(tokens, undefined, 4)+ "</pre>" +
        "</div></body></html>";

      response.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/html' }
      );
      response.end(body);

      process.exit(0);
    });

  });
  server.listen(config.port, callback);
}


/**
 *
 * @param {[]} apis
 * @param {function} callback
 */
function fetchScopesForApis(apis, callback){

  var requests = [];

  _.each(apis, function(api){
    requests.push(function(done){
      request(googleUrl(api), done);
    })
  });

  async.parallel(requests, function(err, results){

    var scopes = [];
    _.each(results, function(result){

      var itemJson = JSON.parse(result[1]);

      _.each(itemJson.auth.oauth2.scopes, function(itemScopes, url){
        scopes.push(url);
      });

    });

    callback(scopes);
  });
}


/**
 *
 * @param {[]} scopes
 * @param {function} callback
 */
function askUserToSelectScopes(scopes, callback){
  var choices = [];

  _.each(scopes, function(item){
    choices.push({
      name: item,
      value: item,
      checked: true
    });
  });

  inquirer.prompt([
    {
      type: "checkbox",
      message: "Select scopes to request access",
      name: "scopes",
      choices: choices,
      validate: function( answer ) {
        if ( answer.length < 1 ) {
          return "You must choose at least one scope.";
        }
        return true;
      }
    }
  ], callback);
}



/**
 *
 * @param {string} uri
 * @return {string}
 */
function googleUrl(uri){
  return config.googleBaseUrl + ( uri.indexOf(0) === '.' ? uri.substr(1) : uri);
}



init();