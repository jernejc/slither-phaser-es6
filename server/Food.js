/* ************************************************
** FOOD CLASS
************************************************ */
var Food = function (id, startX, startY, startColor, startSize) {
  var x = startX
  var y = startY
  var size = startSize
  var color = startColor
  var id = id

  // Define which variables and methods can be accessed
  return {
    x: x,
    y: y,
    size: size,
    color: color,
    id: id
  }
}

// Export the Food class 
module.exports = Food
