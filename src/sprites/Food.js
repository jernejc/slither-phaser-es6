import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, color, size, id }) {
    super(game, x, y, color)

    this.game = game
    this.anchor.setTo(0.5)
    this.id = id
    this.size = size
  }

  update () {
    
  }

}
