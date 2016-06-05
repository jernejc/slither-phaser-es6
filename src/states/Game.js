
import Phaser from 'phaser'
import Food from '../sprites/Food'
import Player from '../objects/Player'
import {setResponsiveWidth} from '../utils'
import io from 'socket.io-client'

export default class extends Phaser.State {
  init () {
    this.foodGroup;
    this.players;
  }

  preload () {
    console.log('preload game')
  }

  create () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, 4600, 4600);
    this.players = [];

    // Connect to socket
    this.socket = io('http://' + window.location.hostname + ':8080');
    
    // Init me and make the camera follow me
    this.player = new Player({
      index: ["me"],
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.centerY,
      numSnakeSections: 30,
      socket: this.socket,
      assets: {
        head: 'head',
        body: 'body'
      }
    })
    this.game.camera.follow(this.player.snakeHead);

    // Add foodGroup and generate a few randoms ones
    this.foodGroup = this.game.add.physicsGroup();

    // set the sprite width to 30% of the game width
    //setResponsiveWidth(this.snakeHead, 30, this.game.world)
    //this.game.add.existing(this.player.snakeHead)

    // Socket connection successful
    this.socket.on('connect', this._onSocketConnected.bind(this))

    // Socket disconnection
    this.socket.on('disconnect', this._onSocketDisconnect)

    // New player message received
    this.socket.on('food group', this._onFoodGroup.bind(this))

    // New player message received
    this.socket.on('new player', this._onNewPlayer.bind(this))

    // Move player
    this.socket.on('move player', this._onMovePlayer.bind(this))

    // Grow player
    this.socket.on('grow player', this._onGrowPlayer.bind(this))

    // Rotate player
    this.socket.on('rotate player', this._onRotatePlayer.bind(this))

    // Player removed message received
    this.socket.on('remove player', this._onRemovePlayer.bind(this))
  }

  update () {
    if (this.game.physics.arcade.collide(this.player.snakeHead, this.foodGroup, this._handleFoodColision, this._processHandler, this)) {
      console.log('nom nom nom');
    }

    // Update player
    this.player.update(true);

    // Update other players
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].alive) {
        this.players[i].update()
        this.game.physics.arcade.collide(player, this.players[i].player, this._handlePlayerColision)
      }
    }
  }

  render () {
    /*if (__DEV__) {
      this.game.debug.spriteInfo(this.player.snakeHead, 32, 32)
    }*/
  }

  /******************** 
  ** Private helpers **
  ********************/

  _handleFoodColision (head, food) {
    console.log('_handleColision food', food);

    this.player.grow(food)
    food.kill()
  }

  _handlePlayerColision (me, them) {
    console.log('_handlePlayerColision', me, them)
  }

  _processHandler (head, food) { 
    console.log('_processHandler', arguments);

    return true;
  }

  /*******************
  ** Event handlers **
  *******************/

  _onSocketConnected () {
    console.log('_onSocketConnected Connected to socket server')

    // Reset enemies on reconnect
    this.players.forEach(function(player) {
      player.kill()
    })
    this.players = [];

    // Send local player data to the game server
    this.socket.emit('new player', { x: this.player.snakeHead.x, y: this.player.snakeHead.y, numSnakeSections: this.numSnakeSections, angle: this.player.snakeHead.body.angularVelocity })
  }

  _onFoodGroup (data) {
    var foodGroup = this.foodGroup;
    var game = this.game;

    data.forEach(function(foodItem) {
      foodGroup.add(new Food({
        game: game,
        x: foodItem.id.x, 
        y: foodItem.id.y, 
        color: foodItem.id.color,
        size: foodItem.id.size,
        id: foodItem.id.id
      }))
    })

    console.log('foodGroup', foodGroup);
  }

  _onNewPlayer (data) {
    console.log('New player connected:', data)

    // Avoid possible duplicate players
    var duplicate = this.players.find(function(player){
      return player.id == data.id;
    })
    if (duplicate) {
      console.log('Duplicate player!')
      return
    }

    // Add new player to the remote players array
    this.players.push(new Player({
      index: data.id,
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.centerY,
      numSnakeSections: data.numSnakeSections,
      socket: this.socket,
      assets: {
        head: 'headE',
        body: 'bodyE'
      }
    }))
  }

  _onMovePlayer (data) {
    //console.log('_onMovePlayer', data, this.players);
    var player = this.players.find(function(player){
      return player.id == data.id;
    })

    // Player not found
    if (!player) {
      console.log('Player not found: ', data.id)
      return
    }

    // Update player position
    player.movePlayer(data.x, data.y)
  }

  _onRotatePlayer (data) {
    //console.log('_onRotatePlayer', data);
    var player = this.players.find(function(player){
      return player.id == data.id;
    })

    // Player not found
    if (!player) {
      console.log('Player not found: ', data.id)
      return
    }

    // Update player position
    player.rotateHead(data.angle)
  }

  _onGrowPlayer (data) {
    console.log('_onGrowPlayer', data);
    var player = this.players.find(function(player){
      return player.id == data.id;
    })

    // Player not found
    if (!player) {
      console.log('Player not found: ', data.id)
      return
    }

    // Update player position
    player.grow(data.size, true)

    // Remove food item
    var food = this.foodGroup.children.find(function(foodItem) {
      return foodItem.id == data.foodId;
    })

    if(food)
      this.foodGroup.remove(food);
  }

  _onRemovePlayer (data) {
    console.log('_onRemovePlayer', data);
    var player = this.players.find(function(player){
      return player.id == data.id;
    })

    // Player not found
    if (!player) {
      console.log('Player not found: ', data.id)
      return
    }

    //player.player.kill()

    // Remove player from array
    this.players.splice(this.players.indexOf(player), 1)
  }
}
