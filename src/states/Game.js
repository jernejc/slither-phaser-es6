
import Phaser from 'phaser'
import Food from '../sprites/Food'
import Player from '../objects/Player'
import {setResponsiveWidth} from '../utils'
import io from 'socket.io-client'
let socket = io(`http://localhost:3000`)

export default class extends Phaser.State {
  init () {
    this.foodGroup;
  }

  preload () {
    this.game.load.image('body','assets/images/body1.png');
    this.game.load.image('head','assets/images/head1.png');
    this.game.load.image('pink','assets/images/food/glowy-pink.png');
    this.game.load.image('blue','assets/images/food/glowy-blue.png');
    this.game.load.image('green','assets/images/food/glowy-green.png');
    this.game.load.image('lime','assets/images/food/glowy-lime.png');
    this.game.load.image('red','assets/images/food/glowy-red.png');
  }

  create () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, 4600, 4600);

    this.enemies = [];
    this.player = new Player({
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.centerY,
      assets: {
        head: 'head',
        body: 'body'
      }
    })

    this.game.camera.follow(this.player.snakeHead);

    // Add foodGroup and generate a few randoms ones
    this.foodGroup = this.game.add.physicsGroup();

    for (let i = 0; i < 100; i++) {
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'pink');
    }

    for (let i = 0; i < 40; i++) {
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'blue');
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'green');
    }

    for (let i = 0; i < 10; i++) {
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'red');
    }

    for (let i = 0; i < 20; i++) {
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'lime');
    }

    // set the sprite width to 30% of the game width
    //setResponsiveWidth(this.snakeHead, 30, this.game.world)
    //this.game.add.existing(this.player.snakeHead)

    // Socket connection successful
    socket.on('connect', this._onSocketConnected)

    // Socket disconnection
    //socket.on('disconnect', onSocketDisconnect)

    // New player message received
    //socket.on('new player', onNewPlayer)

    // Player move message received
    //socket.on('move player', onMovePlayer)

    // Player removed message received
    //socket.on('remove player', onRemovePlayer)
  }

  update () {
    if (this.game.physics.arcade.collide(this.player.snakeHead, this.foodGroup, this._handleColision, this._processHandler, this)) {
      console.log('nom nom nom');
    }

    // Update player
    this.player.update();
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player.snakeHead, 32, 32)
    }
  }

  /******************** 
  ** Private helpers **
  ********************/

  _handleColision (head, food) {
    //console.log('_handleColision', arguments);

    switch(food.key) {
      case 'green':
        this.player.grow(1)
      break;
      case 'red':
        this.player.grow(20)
      break;
      case 'blue':
        this.player.grow(3)
      break;
      case 'lime':
        this.player.grow(10)
      break;
      case 'pink':
        this.player.grow(2)
      break;
    }

    food.kill();
  }

  _processHandler (head, food) { 
    //console.log('_processHandler', arguments);

    return true;
  }

  /*******************
  ** Event handlers **
  *******************/

  _onSocketConnected () {
    console.log('Connected to socket server')

    // Reset enemies on reconnect
    this.enemies.forEach(function (enemy) {
      enemy.player.kill()
    })
    this.enemies = []

    // Send local player data to the game server
    socket.emit('new player', { x: this.player.snakeHead.x, y: this.player.snakeHead.y })
  }
}
