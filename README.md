This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Storing the data
### Cloud data
The default database is accessed through the REST calls made in REST_db.ts.
The data is stored as triples (userID, modelName, JSON model data) with
(userID, modelName) as a key.

### Offline, local data
A setting in .env switches the location of the data.
To use local data you can provide a REST interface 
on localhost 
(e.g. run https://github.com/jeanflower/FinServer 
locally and make it use a local mongo database).

## Authentication
Is handled by Auth0, code in 
/src/contexts/auth0-context.js
Logo handling was understood by reading
https://community.auth0.com/t/company-logo-upload-not-url/38910/8
and then adding link to (raw)
https://github.com/jeanflower/FinNeoClient/raw/master/src/views/cat.png 
in Auth0 Tenant Settings page.

## Getting started for developers

### One-off setup steps
Install git and npm

git clone this repo, go into the finance folder, and do npm install.

This repo works stand-alone if there's a REST server
for it to query and update.  E.g. there's a cloud server 
running on Heroku and this app can work with that.

Optionally, for local testing or development free of a network,
install the sister repo; FinNeoServer, which provides the required
REST interface for finneo to interact with. 
https://github.com/jeanflower/FinNeoServer

The FinServer app works with a mongo database.
There's one running in the cloud or
install a local DB following instructions here
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

The `start*.sh` scripts expect a folder structure
with finneo, FinNeoServer and mongo as sibling folders.

## Everyday scripts for developers

### Run a local web server for the app
Start the web server locally (but still use cloud db):
`./startLocalWebServer.sh`

For local database and fast, network-free development
and testing, ensure you have FinServer and mongo
installed, then run the four scripts in sequence
```
./start1LocalDB.sh
./start2LocalRESTServer.sh
./start3LocalDBAndWebServer.sh
./start4Tests.sh
```

Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

Watch out for lint errors in the console from either
`startLocalWebServer.sh` or `start3LocalDBAndWebServer.sh`.

### Run the tests
`npm test` or `./startTests.sh`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

The browser tests (automated with selenium) will fail unless the web server is running (do 'npm start' before 'npm test').

The selenium tests fire up and drive Chrome processes.  If the tests properly complete, the Chrome process for the tests should close down properly.  But the chromedriver process does not get cleaned up.  If the tests are interrupted (e.g. restart partway through) then the cleanup does not occur.  After a lengthy testing session, you may prefer to clean up manually; open Activity Monitor, search by the text "chrome", and in a terminal window, `killall chromedriver` and `killall "Google Chrome"`.

See coverage by typing `npm test -- --coverage`.
(this seems to be dependent on changed files, not all tests)

### Linting
Run `./lintFixes.sh` keeps things clean.
Running the web server also reports linting issues in the console.

### Publishing to github pages
Doesn't work.
heroku git:remote -a finneo  
git push heroku master

### Publishing to github pages
Doesn't work.
Type
`npm run deploy`
and go to
https://jeanflower.github.io/FinNeoClient/

Setup was based on the guide here
https://reactgo.com/deploy-react-app-github-pages/

Or, trying Heroku from here
https://blog.heroku.com/deploying-react-with-zero-configuration
and tried
`heroku create -b https://github.com/flowerj/finneo-buildpack.git`
seeing `error code=H10 desc="App crashed"` in Heroku logs, following
https://dev.to/lawrence_eagles/causes-of-heroku-h10-app-crashed-error-and-how-to-solve-them-3jnl

### `npm run build`
Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

This repo has been ejected from the default create-react-app
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

