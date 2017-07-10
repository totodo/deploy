const express     = require("express");
const bodyParser  = require('body-parser');
const app         = express();
const port        = process.env.AUTO_DEPLOY_PORT || 6677;
const rebuild     = require("./rebuild");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', port);
app.get('/ping', (req, res) => res.send('pong'));
app.post('/deploy', (req, res) => {
  const body = req.body;
  rebuild(body);
  res.json({success: true});
});

module.exports = app;