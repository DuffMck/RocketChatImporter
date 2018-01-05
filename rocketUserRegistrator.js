var https = require('http');
var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

// the post options
var optionspost = {
    port: 80,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};
var baseBody = {
    "email": "",
    "name": "",
    "password": "",
    "username": "",
    "active": true,
    "roles": ['user'],
    "joinDefaultChannels": true,
    "requirePasswordChange": true,
    "sendWelcomeEmail": true,
    "verified": true
};

var executeAuthenticatedCalls = function (username, password, host, callback) {
    optionspost['host'] = host;
    optionspost['path'] = "/api/v1/login";
    var reqPost = https.request(optionspost, function (res) {
        console.log("Login call status: ", res.statusCode);

        res.on('data', function (d) {
            var data = JSON.parse(d);
            var userId = data.data.userId;
            var authTocket = data.data.authToken;
            console.log("Executing callback ... ");
            callback(userId, authTocket);
        });
    });

    // write the json data
    reqPost.write(JSON.stringify({
        "username": username,
        "password": password
    }));
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error(e);
    });
}


var registerUser = function (userId, authTocket, email, name, password, username, nextCb) {
    // Set endpoint
    optionspost['path'] = "/api/v1/users.create";
    // Set auth tocken 
    optionspost.headers['X-User-Id'] = userId;
    optionspost.headers['X-Auth-Token'] = authTocket;
    // create the JSON object
    baseBody['email'] = email;
    baseBody['name'] = name;
    baseBody['password'] = password;
    baseBody['username'] = username;
    var content = JSON.stringify(baseBody);

    console.info('Try register ' + email);

    // do the POST call
    var reqPost = https.request(optionspost, function (res) {
        console.log("statusCode: ", res.statusCode);

        res.on('data', function (d) {
            var data = JSON.parse(d);
            var success = data.success;
            if (data.status && data.status == 'error')
                success = false;

            var file = "./logs/" + (success ? "success" : "error") + ".log";
            var content = "\n" + (success ? JSON.stringify(data.user) : data.error ? data.error : data.message);

            if (success)
                console.log("Registered!");
            else
                console.log("Error during registration: " + content);

            fs.appendFile(file, content, function (err) {
                if (err) {
                    return console.log(err);
                }
            });
            nextCb();
        });
    });

    // write the json data
    reqPost.write(content);
    reqPost.end();
    reqPost.on('error', function (e) {
        console.error("Error during registration: " + e);
        nextCb();
    });
};

var readCSV = function (path, userId, authToken) {
    var parser = parse({ delimiter: ',' }, function (err, data) {
        async.eachSeries(data, function (line, callback) {
            registerUser(userId, authToken, line[0], line[1], line[2], line[3], callback);
        })
    });
    fs.createReadStream(path).pipe(parser);
}

module.exports = function (username, password, host, csvPath, extraOptions) {

    if (extraOptions) {
        if (extraOptions.active) baseBody.active = extraOptions.active;
        if (extraOptions.roles) baseBody.roles = extraOptions.roles;
        if (extraOptions.joinDefaultChannels) baseBody.joinDefaultChannels = extraOptions.joinDefaultChannels;
        if (extraOptions.requirePasswordChange) baseBody.requirePasswordChange = extraOptions.requirePasswordChange;
        if (extraOptions.sendWelcomeEmail) baseBody.sendWelcomeEmail = extraOptions.sendWelcomeEmail;
        if (extraOptions.verified) baseBody.verified = extraOptions.verified;
    }

    var logDir = "./logs";
    if (!fs.existsSync(logDir)){
        fs.mkdirSync(logDir);
    }


    executeAuthenticatedCalls(username, password, host, function (userId, authTocket) {
        console.log(`User ${userId} Token ${authTocket}`);
        readCSV(csvPath, userId, authTocket);
    });
};