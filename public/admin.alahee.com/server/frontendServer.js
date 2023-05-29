const express = require('express');
var fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const morgan = require('morgan');
const fileUpload = require('express-fileupload');
// const api = require('./server/api');

const app = express();

const https = require('https');

var key = fs.readFileSync(__dirname + '/certifacte/front/server.key');
var cert = fs.readFileSync(__dirname + '/certifacte/front/server.cert');
var ca = fs.readFileSync(__dirname + '/certifacte/front/server.ca');

var credentials = {
  key: key,
  cert: cert,
  ca: ca
};

app.use(fileUpload());

// IP's allowed all access this server
// let whitelist = ['http://admin.alahee.com', 'https://admin.alahee.com'];

// let corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };

// Cross-Origin Resource Sharing
// app.use(cors(corsOptions));

app.use(cors());

// app.use(cors({
//   'allowedHeaders': ['sessionId', 'Content-Type'],
//   'exposedHeaders': ['sessionId'],
//   'origin': '*',
//   'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   'preflightContinue': false
// }));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
  );
  next();
});

app.use(cookieParser());

app.use(
  session({ secret: 'alahee', saveUninitialized: false, resave: false }),
);

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(morgan('dev'));

// app.use('/api', api);
// newly added lines.
app.use("/api", require("./frontend_api/api"));
app.use("/api/dynamic-routes", require('./frontend_api/dynamics-routes'));

var apps = https.createServer(credentials, app);

apps.listen(5001, () =>
  console.log('Alahee frontend server is running on localhost:5001'),
);
