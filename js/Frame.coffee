Rotation = require("./Rotator")
Gravity  = require("./Gravity")
Matrix = require("./Matrix")

class Frame
  constructor: (@initialFrame, @lastFrame, @accelValues, gyroValues, timestamp)->
    @timestamp     = timestamp                  # ms
    @timeDelta     = calcTimeDelta.call(@)      # seconds
    # @gAccel        = @accelValues               # g
    @gAccel        = scale.call(@)              # g
    @gyro          = gyroValues                 # deg/sec
    @rotation      = calcRotation.call(@)
    @accelAndGrav  = calcAccel.call(@)          # m/s^2
    @accel         = normalAccel.call(@)
    @endVelocity   = calcEndVelocity.call(@)    # m/s
    @positionDelta = calcPositionDelta.call(@)
    @position      = calcPosition.call(@)

  # output in mm
  toTableRow: ()->
    to_mm = (coord)-> (@position[coord] * 1000)
    in_mm = applyXYZ.call @, to_mm
    "#{in_mm[0]}, #{in_mm[1]}, #{in_mm[2]}"

  scale = ->
    @initialFrame.scale(@accelValues)

  calcAccel = ->
    times9_8 = (coord)-> (@gAccel[coord] * Gravity)
    applyXYZ.call @, times9_8

  # remove tilts from the accel values
  normalAccel = ->
    inNED = @rotation.rotate(@accelAndGrav)
    [ inNED[0], inNED[1], inNED[2] + Gravity ]

  calcTimeDelta = ->
    (@timestamp - @lastFrame.timestamp) / 1000

  calcRotation = ->
    @lastFrame.rotation
    # new Rotation @lastFrame.rotation, @gyro, @gAccel, @timeDelta

  calcEndVelocity = ->
    velocity = (coord)->
      @lastFrame.endVelocity[coord] + @accel[coord] * @timeDelta
      # @accel[coord] * @timeDelta    # "easy mode", velocity isn't additive
    applyXYZ.call @, velocity

  # d_x(t) = v(0)*t + 1/2*a*t^2
  calcPositionDelta = ->
    posDelta = (coord)->
      v0_t = @lastFrame.endVelocity[coord] * @timeDelta
      v0_t + 1/2 * @accel[coord] * Math.pow(@timeDelta, 2)
    applyXYZ.call @, posDelta

  # x(t) = x(0) + v(0)*t + 1/2*a*t^2
  calcPosition = ->
    newPosition = (coord)->
      @lastFrame.position[coord] + @positionDelta[coord]
    applyXYZ.call @, newPosition

  applyXYZ = (fcn)->
    [0,1,2].map fcn, @

module.exports = Frame
