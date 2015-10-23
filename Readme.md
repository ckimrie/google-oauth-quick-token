Quick Google OAuth2 Token Retrieval
===================================

## TL;DR

Command line to tool to quickly retrieve an Google OAuth2 tokens for API access to Google APIs.

## Intro

Most [Google APIs](https://developers.google.com/apis-explorer) only allow access by using OAuth2 as the authorisation mechanism. If you're running a background process or application without a GUI it can be tricky to get started since OAuth2 requires a step where a logged in user authorises your application (typically via a browser) before you can retrieve an API access token. Once the token is retrieved, this step will not need to be repeated since most OAuth applications will refresh their tokens automatically.

This commandline script lets you very quickly retrieve an OAuth2 token you can then use in your application to make requests to Google APIs.

## What you'll need:

* This script installed globally by using `npm install google-oauth-quick-token -g`
* OAuth Client Id & Client Secret for your application (see below on where to get these)


## Running the program

* 	Once installed (see above), run `google-oauth-quick-token` from the command line
* 	When prompted, enter your OAuth Client ID and Client Secret (see below)
* 	Select what APIs you want to request access for. Use up/down arrows and spacebar to select.
* 	Select what API scopes you want to request access for. Use up/down arrows and spacebar to select.
* 	Your browser will then open at a Google OAuth permission screen. Verify you are logged into the correct account and select "Authorize" 
*	Your browser will then present you with your OAuth2 tokens. Copy & paste into your application and use as needed.


## Client Id & Client Secret

The way OAuth2 works is that your application has a unique identifier and a _person_ then authorises that application identifier to be able to access the persons data via an API. 

These steps are designed for an application that _has no GUI_ and needs long life tokens. If your application has a GUI, then it is better to follow the [recommended OAuth flow described by Google](https://developers.google.com/identity/protocols/OAuth2).

 * 	Go to the [Google Developer Console](https://console.developers.google.com) and login using the Google ID you want to 'own' the application 
 *  Create a new project
 *	When inside the new project, select `APIs & auth` then `APIs` from the side menu and select what APIs you want to enable for your application
 *	Then select `Credentials` and then `Add credentials` (if this is the first time you may be prompted to create an OAuth consent screen).
 *	Choose `Other` as the Application type
 *	Enter a name for your API credentials
 *	Your client ID and client secret will be presented to you. Copy/paste or record them somewhere since you will need them to fetch your OAuth2 tokens
 