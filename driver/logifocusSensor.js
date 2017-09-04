'use strict';

var util = require('util');

var SensorLib = require('../index');
var Sensor = SensorLib.Sensor;
var logger = Sensor.getLogger('Sensor');
var logifocus = require('../logifocus');

function LogifocusSensor(sensorInfo, options) {
  var self = this;

  Sensor.call(self, sensorInfo, options);

  if (sensorInfo.model) {
    self.model = sensorInfo.model;
  }

  self.dataType = LogifocusSensor.properties.dataTypes[self.model][0];
  self.seq = self.id.split('-')[3];
  logger.debug('boh: seq:', self.seq, self.id);
}

LogifocusSensor.properties = {
  supportedNetworks: ['wifi-logifocus'],
  dataTypes: {
    logifocusTemp: ['temperature'],
    logifocusHumi: ['humidity'],
    logifocusPm10: ['dust'],
    logifocusPm25: ['dust'],
    logifocusBattery: ['batteryGauge']
  },
  onChange: {
    logifocusTemp: false,
    logifocusHumi: false,
    logifocusPm10: false,
    logifocusPm25: false,
    logifocusBattery: false
  },
  discoverable: true,
  addressable: false,
  recommendedInterval: 60000,
  maxInstances: 10,
  maxRetries: 8,
  idTemplate: '{gatewayId}-logifocus-{deviceAddress}-{seq}',
  models: ['logifocusTemp', 'logifocusHumi', 'logifocusPm10', 'logifocusPm25', 'logifocusBattery'],
  category: 'sensor'
};

util.inherits(LogifocusSensor, Sensor);

LogifocusSensor.prototype._get = function (cb) {
  var self = this;
  var value = logifocus.getValue(self.device.address, self.seq);
  var time = logifocus.getTime(self.device.address);
  var result = {
    status: 'on',
    id: self.id,
    result: {},
    time: {}
  };

  logger.debug(self.dataType + ':', value, '(' + new Date(time).toLocaleString() + ')');

  result.result[self.dataType] = value;
  result.time[self.dataType] = time;

  if (cb) {
    return cb(null, result);
  } else {
    self.emit('data', result);
  }
};

/*
LogifocusSensor.prototype._enableChange = function () {
};

LogifocusSensor.prototype._clear = function () {
  apc100.deregisterSensor(this.id);
  apc100.stopPolling();
};
*/

module.exports = LogifocusSensor;
