import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('body','assets/images/body1.png');
    this.load.image('head','assets/images/head1.png');
    this.load.image('pink','assets/images/food/glowy-pink.png');
    this.load.image('blue','assets/images/food/glowy-blue.png');
    this.load.image('green','assets/images/food/glowy-green.png');
    this.load.image('lime','assets/images/food/glowy-lime.png');
    this.load.image('red','assets/images/food/glowy-red.png');
  }

  create () {
    this.state.start('Game')
  }

}
