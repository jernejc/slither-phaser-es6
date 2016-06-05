import Phaser from 'phaser'
import io from 'socket.io-client'

/* 
  RemotePlayer class 
*/

export default class {
  constructor ({ index, game, x, y, numSnakeSections, socket, assets }) {
    this.snakeHead;
    this.snakeSection = new Array();
    this.snakePath = new Array();
    this.numSnakeSections = numSnakeSections || 30;
    this.snakeSpacer = 1;
    this.game = game;
    this.socket = socket;
    this.id = index;
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

  update (cursor) {
    this.snakeHead.body.velocity.setTo(0, 0);
    this.snakeHead.body.angularVelocity = 0;

    if(cursor) {
      if (this.cursors.up.isDown) {
        this.movePlayer(this.snakeHead.x, this.snakeHead.y);
        this.socket.emit('move player', { x: this.snakeHead.x, y: this.snakeHead.y })
      }

      if (this.cursors.left.isDown)
        this.rotateHead(-300, true)
      else if (this.cursors.right.isDown)
        this.rotateHead(300, true)
    }
  }

  grow (food, enemy) {
    let lastPoint = this.snakePath[this.snakePath.length];

    for (let i = 0; i <= food.size; i++) {
      this.snakeSection[this.numSnakeSections] = this.game.add.sprite(this.snakeSection[this.numSnakeSections - 1].x + this.snakeSpacer, this.snakeSection[this.numSnakeSections - 1].y + this.snakeSpacer, 'body');
      this.snakeSection[this.numSnakeSections].anchor.setTo(0.5, 0.5)
      this.numSnakeSections++;

      for (let i = this.snakePath.length; i <= this.numSnakeSections * this.snakeSpacer; i++) {
        this.snakePath[i] = new Phaser.Point(this.snakePath[i - 1].x, this.snakePath[i - 1].y);
      }
    }

    if(!enemy)
      this.socket.emit('grow player', { size: food.size, id: food.id });
  }

  movePlayer (x,y) {
    this.snakeHead.body.velocity.copyFrom(this.game.physics.arcade.velocityFromAngle(this.snakeHead.angle, 300));
    this.snakeHead.x = (x !== this.snakeHead.x) ? x : this.snakeHead.x;
    this.snakeHead.y = (y !== this.snakeHead.y) ? y : this.snakeHead.y;

    let part = this.snakePath.pop();
    part.setTo(this.snakeHead.x, this.snakeHead.y);
    this.snakePath.unshift(part);

    for (let i = 1; i <= this.numSnakeSections - 1; i++) {
      this.snakeSection[i].x = (this.snakePath[i * this.snakeSpacer]).x;
      this.snakeSection[i].y = (this.snakePath[i * this.snakeSpacer]).y;
    }
  }

  rotateHead (angle, emit) {
    this.snakeHead.body.angularVelocity = angle;
    
    if(emit)
      this.socket.emit('rotate player', { angle: angle })
  }
}
