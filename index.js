// connect to buzzer at P1 pin
var buzzer = require('@amperka/buzzer').connect(P1);
// led indicator
var led = require('@amperka/led').connect(P2);
// infrared receiver
var ir = require('@amperka/ir-receiver').connect(P3);
// connect to light senson at A2 pin
var sensor = require('@amperka/light-sensor').connect(A2);
// lib which return random int in period
var random = require('@amperka/hw-random');

// ir toogle button
const TOOGLE_IR = 378130479;

// min fq is 1000 Hz, max fq is 6000 Hz
var min = 2;
var max = 12;
var fq_gap = 500;
// initial fq is 5000 Hz
var prev = 10;

// initial status is work
var status = true;

// start frequency point
buzzer.frequency(prev*fq_gap);

var listener;

function checkListener() {
  // check status and controll led and buzzer
  if(status) {
    buzzer.turnOn();
    led.turnOn();
  } else {
    led.turnOff();
    buzzer.turnOff();
    if(listener) {
      // clear listener
      clearInterval(listener);
      listener = null;
    }
    return;
  }

  if(listener) {
    // listener already created
    return;
  }

  // create listener
  listener = setInterval(function() {
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
}

// start initial listener
checkListener();

// got ir code
ir.on('receive', function(code, repeat) {
  if(code === TOOGLE_IR && !repeat) {
    status = !status;
    checkListener();
  }
});