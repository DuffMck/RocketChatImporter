# RocketChat Importer
I always had problems with CSV import into RocketChat instances, so I wrote this simple script in order to add all users using the server API.

## CSV file
This script read lines from a CSV file that have this format:

`EMAIL,COMPLETE NAME,USER PASSWORD,USER NAME`

In this repo there's an example (users.csv), and as you can see __there's not an header__!

## Execute
- Create your CSV file or edit the example's one.
- Go into __index.js__ and change function parameters (__credentials must be from an admin user__)
- From terminal go to project directory and execute `node index.js`

## Log
Inside the `${project_root}/log/` folder you will find two files with results and server response:
- error.log for errors
- success.log for created users