import Phaser from 'phaser'
import io from 'socket.io-client'
let socket = io(`http://localhost:3000`)

/* 
  RemotePlayer class 
*/

export default class {
  constructor ({ game, x, y, assets }) {
    this.snakeHead;
    this.snakeSection = new Array();
    this.snakePath = new Array();
    this.numSnakeSections = 30;
    this.snakeSpacer = 1;
    this.game = game;
    this.cursors = this.game.input.keyboard.createCursorKeys();

    // Snake and its head
    this.snakeHead = this.game.add.sprite(400, 300, assets.head);
    this.snakeHead.anchor.setTo(0.5, 0.5);

    this.game.physics.enable(this.snakeHead, Phaser.Physics.ARCADE);
    
    for (let i = 1; i <= this.numSnakeSections - 1; i++) {
      this.snakeSection[i] = this.game.add.sprite(400, 300, assets.body);
      this.snakeSection[i].anchor.setTo(0.5, 0.5);
    }
    
    for (let i = 0; i <= this.numSnakeSections * this.snakeSpacer; i++) {
      this.snakePath[i] = new Phaser.Point(400, 300);
    }

    this.snakeHead.body.collideWorldBounds = true;
  }

  update () {
    this.snakeHead.body.velocity.setTo(0, 0);
    this.snakeHead.body.angularVelocity = 0;

    if (this.cursors.up.isDown) {
      this.snakeHead.body.velocity.copyFrom(this.game.physics.arcade.velocityFromAngle(this.snakeHead.angle, 300));

      let part = this.snakePath.pop();
      part.setTo(this.snakeHead.x, this.snakeHead.y);
      this.snakePath.unshift(part);

      for (let i = 1; i <= this.numSnakeSections - 1; i++) {
        this.snakeSection[i].x = (this.snakePath[i * this.snakeSpacer]).x;
        this.snakeSection[i].y = (this.snakePath[i * this.snakeSpacer]).y;
      }

      socket.emit('move player', { x: this.snakeHead.x, y: this.snakeHead.y })
    }

    if (this.cursors.left.isDown)
      this.snakeHead.body.angularVelocity = -300;
    else if (this.cursors.right.isDown)
      this.snakeHead.body.angularVelocity = 300;

  }

  grow (length) {
    //console.log('grow', arguments);

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
