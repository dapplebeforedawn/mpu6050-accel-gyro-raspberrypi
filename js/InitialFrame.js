// Generated by CoffeeScript 1.6.1
(function() {
  var Gravity, InitialFrame, InitialRotation, Matrix,
    _this = this;

  InitialRotation = require("./InitialRotation");

  Gravity = require("./Gravity");

  Matrix = require("./Matrix");

  InitialFrame = (function() {
    var applyXYZ, calcAccel, calcRotation, normalAccel, scale;

    function InitialFrame() {
      var _this = this;
      this.scale = function(array) {
        return InitialFrame.prototype.scale.apply(_this, arguments);
      };
      this.finalizeCal = function() {
        return InitialFrame.prototype.finalizeCal.apply(_this, arguments);
      };
      this.addCalData = function(accel, gyro, timestamp) {
        return InitialFrame.prototype.addCalData.apply(_this, arguments);
      };
      this.calCount = 0;
      this.timeDelta = 0;
      this.endVelocity = [0, 0, 0];
      this.positionDelta = [0, 0, 0];
      this.position = [0, 0, 0];
      this.gAccel = null;
      this.accelAndGrav = null;
      this.gyro = null;
      this.rotation = null;
      this.accel = null;
      this.gyros = [];
      this.accels = [];
    }

    InitialFrame.prototype.addCalData = function(accel, gyro, timestamp) {
      this.timestamp = timestamp;
      this.calCount += 1;
      this.accels = this.accels.concat([accel]);
      return this.gyros = this.gyros.concat([gyro]);
    };

    InitialFrame.prototype.finalizeCal = function() {
      var accelValues, gyroValues, sumFn,
        _this = this;
      sumFn = function(coord) {
        return function(pv, cv) {
          return pv + cv[coord];
        };
      };
      accelValues = applyXYZ(function(coord) {
        var sum;
        sum = _this.accels.reduce(sumFn(coord), 0);
        return sum / _this.calCount;
      });
      gyroValues = applyXYZ(function(coord) {
        var sum;
        sum = _this.gyros.reduce(sumFn(coord), 0);
        return sum / _this.calCount;
      });
      this.gAccel = accelValues;
      this.accelAndGrav = calcAccel.call(this);
      this.gyro = gyroValues;
      this.rotation = calcRotation.call(this);
      this.accel = normalAccel.call(this);
      return this.scaleMatrix = scale.call(this);
    };

    InitialFrame.prototype.tare = function(accel) {
      var t;
      t = function(coord) {
        return this.accel[coord] - accel[coord];
      };
      return applyXYZ.call(this, t);
    };

    normalAccel = function() {
      var inNED;
      inNED = this.rotation.rotate(this.accelAndGrav);
      return [inNED[0], inNED[1], inNED[2] + Gravity];
    };

    calcAccel = function() {
      var times9_8;
      times9_8 = function(coord) {
        return this.gAccel[coord] * Gravity;
      };
      return applyXYZ.call(this, times9_8);
    };

    calcRotation = function() {
      return new InitialRotation(this.accelAndGrav);
    };

    scale = function() {
      return new Matrix.ScaleMatrix(this.gAccel);
    };

    InitialFrame.prototype.scale = function(array) {
      return this.scaleMatrix.scaled(array);
    };

    applyXYZ = function(fcn) {
      return [0, 1, 2].map(fcn, this);
    };

    return InitialFrame;

  })();

  module.exports = InitialFrame;

}).call(this);
