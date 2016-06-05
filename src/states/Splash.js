import Phaser from 'phaser'
import { centerGameObjects } from '../utils'
import body from '../../assets/images/body.png'
import head from '../../assets/images/head.png'
import bodyE from '../../assets/images/bodyE.png'
import headE from '../../assets/images/headE.png'
import gPink from '../../assets/images/food/glowy-pink.png'
import gBlue from '../../assets/images/food/glowy-blue.png'
import gGreen from '../../assets/images/food/glowy-green.png'
import gLime from '../../assets/images/food/glowy-lime.png'
import gRed from '../../assets/images/food/glowy-red.png'

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
    this.game.load.image('body', body);
    this.game.load.image('head', head);
    this.game.load.image('bodyE', bodyE);
    this.game.load.image('headE', headE);
    this.game.load.image('pink', gPink);
    this.game.load.image('blue', gBlue);
    this.game.load.image('green', gGreen);
    this.game.load.image('lime', gLime);
    this.game.load.image('red', gRed);
  }

  create () {
    this.state.start('Game')
  }

}
