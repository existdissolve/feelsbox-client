const express = require('express');
const path = require('path');
const open = require('open');
const compression = require('compression');
const favicon = require('serve-favicon');
const {createProxyMiddleware} = require('http-proxy-middleware');

/*eslint-disable no-console */

const port = process.env.PORT || 3000;
const app = express();

app.use(compression());
app.use(express.static('build'));
//app.use(favicon(path.join(__dirname,'assets','dist','favicon.ico')));

app.use('/api/graphql', createProxyMiddleware({
    target: 'https://feelsbox-server-v2.herokuapp.com',
    changeOrigin: true
}));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(port, function(err) {
    if (err) {
        console.log(err);
    }
});