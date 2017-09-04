'use strict';

var udp = require('dgram');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('./index').Sensor.getLogger('Sensor');

var deviceMap = {};

function extract(buf, startIdx, endIdx) {
  var strValue = buf.toString('utf8', startIdx, endIdx);
  var numValue = parseInt(strValue, 16);

  return numValue;
}

// TODO: Should implement length and CRC check
function convert(buf) {
  var obj = {
    header: extract(buf, 0, 2),
    //payloadLength: extract(buf, 2, 6),
    serialNo: buf.toString('utf8', 6, 10),
    temperature: extract(buf, 10, 14) / 100,
    humidity: extract(buf, 14, 18) / 100,
    battery: extract(buf, 18, 22),
    pm25: extract(buf, 22, 26),
    pm10: extract(buf, 26, 30),
    //crc: extract(buf, 38, 40),
    //tail: extract(buf, 40, 42)
  };

  return obj;
}

// TODO: Should implement buffering because WiFi can be broken
// TODO: Should implement sensor status off
function Logifocus() {
  EventEmitter.call(this);

  this.socket = udp.createSocket('udp4');

  this.socket.on('error', function (err) {
    logger.error('UDP error:', err);
  });

  this.socket.on('close', function () {
    logger.error('UDP socket is closed.');
  });

  this.socket.on('message', function (msg, rinfo) {
    var msgObj;

    logger.trace('message:', msg.toString());
    logger.trace('rinfo:', rinfo);
    msgObj = convert(msg);
    logger.debug('msgObj:', msgObj);

    deviceMap[msgObj.serialNo] = {
      temperature: msgObj.temperature,
      humidity: msgObj.humidity,
      pm10: msgObj.pm10,
      pm25: msgObj.pm25,
      battery: msgObj.battery,
      time: Date.now()
    };
  });

  this.socket.on('listening', function () {
    logger.info('Listening Logifocus AP UDP packet...');
  });

  this.socket.bind(9050);
}

util.inherits(Logifocus, EventEmitter);

Logifocus.prototype.discover = function () {
  logger.debug('deviceMap:', deviceMap);
  return deviceMap;
};

Logifocus.prototype.getValue = function (deviceAddress, seq) {
  var sensorItem = deviceMap[deviceAddress];

  return sensorItem && sensorItem[seq] || null;
};

Logifocus.prototype.getTime = function (deviceAddress) {
  var sensorItem = deviceMap[deviceAddress];

  return sensorItem && sensorItem.time || null;
};

module.exports = new Logifocus();
