var express = require('express');
var path = require('path');
var open = require('open');
var compression = require('compression');
var favicon = require('serve-favicon');
var proxy = require('express-http-proxy');

/*eslint-disable no-console */

var port = process.env.PORT || 3000;
var app = express();

app.use(compression());
app.use(express.static('build'));
//app.use(favicon(path.join(__dirname,'assets','dist','favicon.ico')));

app.use('/api/graphql', proxy('feelsbox-server-v2.herokuapp.com', {
    https: true,
    proxyReqPathResolver: () => {
        return 'https://feelsbox-server-v2.herokuapp.com/api/graphql';
    }
}));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(port, function(err) {
    if (err) {
        console.log(err);
    }
});