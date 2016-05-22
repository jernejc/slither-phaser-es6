
import Phaser from 'phaser'
import Food from '../sprites/Food'
import {setResponsiveWidth} from '../utils'

export default class extends Phaser.State {
  init () {
    this.snakeHead;
    this.snakeSection = new Array();
    this.snakePath = new Array();
    this.numSnakeSections = 30;
    this.snakeSpacer = 2;
    this.foodGroup;
  }

  preload () {
    this.game.load.image('ball','assets/images/aqua_ball.png');
    this.game.load.image('red','assets/images/food/orb-red.png');
    this.game.load.image('blue','assets/images/food/orb-blue.png');
    this.game.load.image('green','assets/images/food/orb-green.png');
  }

  create () {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, 3600, 3600);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    // Snake and its head
    this.snakeHead = this.game.add.sprite(400, 300, 'ball');
    this.snakeHead.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.snakeHead, Phaser.Physics.ARCADE);
    
    for (let i = 1; i <= this.numSnakeSections - 1; i++) {
      this.snakeSection[i] = this.game.add.sprite(400, 300, 'ball');
      this.snakeSection[i].anchor.setTo(0.5, 0.5);
    }
    
    for (let i = 0; i <= this.numSnakeSections * this.snakeSpacer; i++) {
      this.snakePath[i] = new Phaser.Point(400, 300);
    }

    this.game.camera.follow(this.snakeHead);

    // Add foodGroup and generate a few randoms ones
    this.foodGroup = this.game.add.physicsGroup();

    for (let i = 0; i < 30; i++) {
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'blue');
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'red');
      this.foodGroup.create(this.game.world.randomX, this.game.world.randomY, 'green');
    }

    console.log('this.snakePath', this.snakePath);
    console.log('this.snakeSection', this.snakeSection);

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
    //console.log('_handleColision', arguments);

    switch(food.key) {
      case 'green':
        this._growSnake(1)
      break;
      case 'red':
        this._growSnake(2)
      break;
      case 'blue':
        this._growSnake(3)
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
      this.snakeSection[this.numSnakeSections] = this.game.add.sprite(this.snakeSection[this.numSnakeSections - 1].x + this.snakeSpacer, this.snakeSection[this.numSnakeSections - 1].y + this.snakeSpacer, 'ball');
      this.snakeSection[this.numSnakeSections].anchor.setTo(0.5, 0.5)
      this.numSnakeSections++;

      for (let i = this.snakePath.length; i <= this.numSnakeSections * this.snakeSpacer; i++) {
        this.snakePath[i] = new Phaser.Point(this.snakePath[i - 1].x, this.snakePath[i - 1].y);
      }
    }
  }
}
