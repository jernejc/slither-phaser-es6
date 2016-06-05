/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (startX, startY, startSections, startAngle) {
  var x = startX
  var y = startY
  var numSnakeSections = startSections
  var angel = startAngle
  var id

  // Getters and setters
  var getX = function () {
    return x
  }

  var getY = function () {
    return y
  }

  var getSections = function () {
    return numSnakeSections
  }

  var getAngle = function () {
    return angel
  }

  var setX = function (newX) {
    x = newX
  }

  var setY = function (newY) {
    y = newY
  }

  var grow = function(size) {
    numSnakeSections = numSnakeSections + size
  }

  var setAngle = function(newAngle) {
    angel = newAngle
  }

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    getSections: getSections,
    getAngle: getAngle,
    setX: setX,
    setY: setY,
    setAngle: setAngle,
    grow: grow,
    id: id
  }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player
