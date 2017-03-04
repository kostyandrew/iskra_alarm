// connect to buzzer at P1 pin
var buzzer = require('@amperka/buzzer').connect(P1);
// connect to light senson at A2 pin
var sensor = require('@amperka/light-sensor').connect(A2);
// lib which return random int in period
var random = require('@amperka/hw-random');

// min fq is 1000 Hz, max fq is 6000 Hz
var min = 2;
var max = 12;
var fq_gap = 500;

var prev = 10;

// start frequency point
buzzer.frequency(prev*fq_gap);

setInterval(function() {
  var lx = sensor.read('lx');
  if(lx > 100) { // very dark overcast day (https://en.wikipedia.org/wiki/Lux)
    buzzer.turnOn();
  } else {
    buzzer.turnOff();
    return;
  }

  // calculate frequency period
  var start, end;
  start = prev - 1;
  end = prev + 1;
  if(prev <= min) {
    start = min;
    end = min+1;
  } else if(prev >= max) {
    start = max-1;
    end = max;
  }

  // get random frequency in period
  var fq = random.int(start*fq_gap, end*fq_gap);
  buzzer.frequency(fq);

  // save frequency point for next calculation
  prev = Math.round(fq/fq_gap);
}, 100);