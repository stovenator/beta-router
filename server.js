var express = require('express');
var proxy = require('express-http-proxy');
var device = require('express-device');
var moment = require('moment');
var url = require('url');

var app = express();
var start = moment().format('hh:m:ss');


var betaServer = process.env.CM_ACCEPT_BETA_SERVER || 'localhost:9090';
var mainServer = process.env.CM_ACCEPT_MAIN_SERVER || 'localhost:9091';
var betaServerPath = process.env.CM_ACCEPT_BETA_PATH || '';
var mainServerPath = process.env.CM_ACCEPT_MAIN_PATH || '';

var cmAcceptBetaServer = proxy(betaServer, {
    forwardPath: function(req, res) {
        return betaServerPath + url.parse(req.url).path;
    }
});
var cmAcceptServer = proxy(mainServer, {
    forwardPath: function(req, res) {
        return mainServerPath + url.parse(req.url).path;
    }
});

app.set('port', process.argv[2] || process.env.PORT || 8801);

app.use(device.capture({unknownUserAgentDeviceType: "desktop"}));

app.listen(app.get('port'), function() {
    var listening = 'Beta Router listening on port ' +  app.get('port') + ' in ' + process.env.NODE_ENV + ' mode';
    console.log(start, " : ", listening);
});

app.use('/diagnostic', function(req,res,next){
    res.send('OK');
});

app.use('/', function(req, res, next){
    if (req.device.type == 'phone'){
        cmAcceptServer(req, res, next);
    }
    else{
        cmAcceptBetaServer(req, res, next);
    }
});
