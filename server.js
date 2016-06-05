/* eslint no-console: 0 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 8080 : process.env.PORT;
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

var Player = require('./server/Player')
var Food = require('./server/Food')
var players;
var foodGroup;
var canvasW = 4600;
var canvasY = 4600;

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

server.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.log('==> 🌎 Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port); 

  init()
});

function init () {
  // Create an empty array to store players
  players = []

  // Create some initial food objects
  foodGroup = []
  generateFood()

  // Start listening for events
  setEventHandlers()
}

var generateFood = function() {
  for (var i = 0; i < 100; i++) {
    foodGroup.push(new Food({
      id: 'pink' + i,
      x: getRandomArbitrary(0, canvasW), 
      y: getRandomArbitrary(0, canvasY), 
      color: 'pink',
      size: 1
    }))
  }

  for (var i = 0; i < 40; i++) {
    foodGroup.push(new Food({
      id: 'blue' + i,
      x: getRandomArbitrary(0, canvasW), 
      y: getRandomArbitrary(0, canvasY), 
      color: 'blue',
      size: 5
    }))

    foodGroup.push(new Food({
      id: 'green' + i,
      x: getRandomArbitrary(0, canvasW), 
      y: getRandomArbitrary(0, canvasY), 
      color: 'green',
      size: 5
    }))
  }

  for (var i = 0; i < 20; i++) {
    foodGroup.push(new Food({
      id: 'lime' + i,
      x: getRandomArbitrary(0, canvasW), 
      y: getRandomArbitrary(0, canvasY), 
      color: 'lime',
      size: 10
    }))
  }

  for (var i = 0; i < 10; i++) {
    foodGroup.push(new Food({
      id: 'red' + i,
      x: getRandomArbitrary(0, canvasW), 
      y: getRandomArbitrary(0, canvasY), 
      color: 'red',
      size: 15
    }))
  }
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */
var setEventHandlers = function () {
  // Socket.IO
  io.on('connection', onSocketConnection)
}

// New socket connection
function onSocketConnection (client) {
  console.log('New player has connected: ' + client.id)

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  // Listen for move player message
  client.on('move player', onMovePlayer)

  // List for grow player message
  client.on('grow player', onGrowPlayer)

  // List for grow player message
  client.on('rotate player', onRotatePlayer)
}

// Socket client has disconnected
function onClientDisconnect () {
  console.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ' + this.id)
    return
  }

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('remove player', {id: this.id})
}

// New player has joined
function onNewPlayer (data) {
  // Create a new player
  var newPlayer = new Player(data.x, data.y, data.size)
  newPlayer.id = this.id

  console.log('onNewPlayer', newPlayer);
  // Broadcast new player to connected socket clients
  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), numSnakeSections: newPlayer.getSections()})

  // Send existing players to the new player
  var i, existingPlayer
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i]
    this.emit('new player', {
      id: existingPlayer.id, 
      x: existingPlayer.getX(), 
      y: existingPlayer.getY(), 
      numSnakeSections: existingPlayer.getSections()
    })
  }

  // Send the player the current foodGroup
  this.emit('food group', foodGroup)

  // Add new player to the players array
  players.push(newPlayer)
}

// Player has moved
function onMovePlayer (data) {
  //console.log('onMovePlayer', this.id, data)
  // Find player in array
  var player = playerById(this.id)

  // Player not found
  if (!player) {
    console.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  player.setX(data.x)
  player.setY(data.y)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: player.id, x: player.getX(), y: player.getY() })
}

// Player grew
function onGrowPlayer (data) {
  console.log('onGrowPlayer', this.id, data)
  // Find player in array
  var player = playerById(this.id)

  // Player not found
  if (!player) {
    console.log('Player not found: ' + this.id)
    return
  }

  // Update player length
  player.grow(data.size)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('grow player', {id: player.id, size: data.size, foodId: data.id })
}

function onRotatePlayer(data) {
  console.log('onRotatePlayer', this.id, data)
  // Find player in array
  var player = playerById(this.id)

  // Player not found
  if (!player) {
    console.log('Player not found: ' + this.id)
    return
  }

  // Update player length
  player.setAngle(data.angle)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('rotate player', {id: player.id, angle: player.getAngle() })
}

/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
