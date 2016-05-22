
import Phaser from 'phaser'
import Food from '../sprites/Food'
import {setResponsiveWidth} from '../utils'

export default class extends Phaser.State {
  init () {
    this.snakeHead;
    this.snakeSection = new Array();
    this.snakePath = new Array();
    this.numSnakeSections = 30;
    this.snakeSpacer = 1;
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

    this.cursors = this.game.input.keyboard.createCursorKeys();

    // Snake and its head
    this.snakeHead = this.game.add.sprite(400, 300, 'head');
    this.snakeHead.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.snakeHead, Phaser.Physics.ARCADE);
    
    for (let i = 1; i <= this.numSnakeSections - 1; i++) {
      this.snakeSection[i] = this.game.add.sprite(400, 300, 'body');
      this.snakeSection[i].anchor.setTo(0.5, 0.5);
    }
    
    for (let i = 0; i <= this.numSnakeSections * this.snakeSpacer; i++) {
      this.snakePath[i] = new Phaser.Point(400, 300);
    }

    this.snakeHead.body.collideWorldBounds = true;
    this.game.camera.follow(this.snakeHead);

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
    //this.game.add.existing(this.snakeHead)
  }

  update () {
    this.snakeHead.body.velocity.setTo(0, 0);
    this.snakeHead.body.angularVelocity = 0;

    if (this.game.physics.arcade.collide(this.snakeHead, this.foodGroup, this._handleColision, this._processHandler, this)) {
      console.log('nom nom nom');
    }

    if (this.cursors.up.isDown) {
      this.snakeHead.body.velocity.copyFrom(this.game.physics.arcade.velocityFromAngle(this.snakeHead.angle, 300));

      let part = this.snakePath.pop();
      part.setTo(this.snakeHead.x, this.snakeHead.y);
      this.snakePath.unshift(part);

      for (let i = 1; i <= this.numSnakeSections - 1; i++) {
        this.snakeSection[i].x = (this.snakePath[i * this.snakeSpacer]).x;
        this.snakeSection[i].y = (this.snakePath[i * this.snakeSpacer]).y;
      }
    }

    if (this.cursors.left.isDown)
      this.snakeHead.body.angularVelocity = -300;
    else if (this.cursors.right.isDown)
      this.snakeHead.body.angularVelocity = 300;
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.snakeHead, 32, 32)
    }
  }

  /******************** 
  ** Private helpers **
  ********************/

  _handleColision (head, food) {
    console.log('_handleColision', arguments);

    switch(food.key) {
      case 'green':
        this._growSnake(1)
      break;
      case 'red':
        this._growSnake(20)
      break;
      case 'blue':
        this._growSnake(3)
      break;
      case 'lime':
        this._growSnake(10)
      break;
      case 'pink':
        this._growSnake(2)
      break;
    }

    food.kill();
  }

  _processHandler (head, food) { 
    //console.log('_processHandler', arguments);

    return true;
  }

  _growSnake (length) {
    //console.log('_growSnake', arguments);

    let lastPoint = this.snakePath[this.snakePath.length];

    for (let i = 0; i <= length; i++) {
      this.snakeSection[this.numSnakeSections] = this.game.add.sprite(this.snakeSection[this.numSnakeSections - 1].x + this.snakeSpacer, this.snakeSection[this.numSnakeSections - 1].y + this.snakeSpacer, 'body');
      this.snakeSection[this.numSnakeSections].anchor.setTo(0.5, 0.5)
      this.numSnakeSections++;

      for (let i = this.snakePath.length; i <= this.numSnakeSections * this.snakeSpacer; i++) {
        this.snakePath[i] = new Phaser.Point(this.snakePath[i - 1].x, this.snakePath[i - 1].y);
      }
    }
  }
}
