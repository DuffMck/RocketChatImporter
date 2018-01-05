var registrator = require('./rocketUserRegistrator');

/**
 * Function accept following parameters:
 * - admin username
 * - admin password
 * - Rocket Chat url instance (without http) NB: https not supported
 * - file CSV to import
 */
registrator("admin","adminpwd","rocketchat.example.org",'users.csv');