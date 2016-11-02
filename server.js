var express = require('express');
var proxy = require('express-http-proxy');
var device = require('express-device');
var moment = require('moment');

var app = express();
var start = moment().format('hh:m:ss');

var betaServerName = process.env.CM_ACCEPT_BETA_SERVER || 'localhost:9090';
var mainServerName = process.env.CM_ACCEPT_SERVER || 'localhost:9090';

var cmAcceptBetaServer = proxy(betaServerName);
var cmAcceptServer = proxy(mainServerName);

app.set('port', process.argv[2] || process.env.PORT || 8801);

app.use(device.capture({unknownUserAgentDeviceType: "desktop"}));

app.listen(app.get('port'), function() {
    var listening = 'Beta Router listening on port ' +  app.get('port') + ' in ' + process.env.NODE_ENV + ' mode';
    console.log(start, " : ", listening);
});

app.use('/', function(req, res, next){
    if (req.device.type == 'phone'){
        console.log("Mobile, redirect to Beta");
        cmAcceptBetaServer(req, res, next);
    }
    else{
        console.log("Desktop, redirect to main");
        cmAcceptServer(req, res, next);
    }
});
