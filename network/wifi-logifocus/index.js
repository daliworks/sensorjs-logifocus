'use strict';

var sensorDriver = require('../../index');
var logifocus = require('../../logifocus');
var Network = sensorDriver.Network;
var Device = sensorDriver.Device;
var util = require('util');
var _ = require('lodash');
var logger = Network.getLogger();

function WifiLogifocus(options) {
  Network.call(this, 'wifi-logifocus', options);
}

util.inherits(WifiLogifocus, Network);

WifiLogifocus.prototype.discover = function(networkName, options, cb) {
  var self = this;
  var devices = [];
  var gatewayId;
  var discovered;

  if (_.isFunction(options)) {
    cb = options;
    options = undefined;
  }

  gatewayId = options.gatewayId;

  discovered = logifocus.discover();
  _.forEach(discovered, function (values, deviceAddress) {
    var sensors = [
      {
        id: [gatewayId, 'logifocus', deviceAddress, 'temperature'].join('-'),
        type: 'temperature',
        model: 'logifocusTemp',
        options: {
          name: 'Temperature'
        }
      },
      {
        id: [gatewayId, 'logifocus', deviceAddress, 'humidity'].join('-'),
        type: 'humidity',
        model: 'logifocusHumi',
        options: {
          name: 'Humidity'
        }
      },
      {
        id: [gatewayId, 'logifocus', deviceAddress, 'pm10'].join('-'),
        type: 'dust',
        model: 'logifocusPm10',
        options: {
          name: 'PM 10'
        }
      },
      {
        id: [gatewayId, 'logifocus', deviceAddress, 'pm25'].join('-'),
        type: 'dust',
        model: 'logifocusPm25',
        options: {
          name: 'PM 2.5'
        }
      },
      {
        id: [gatewayId, 'logifocus', deviceAddress, 'battery'].join('-'),
        type: 'batteryGauge',
        model: 'logifocusBattery',
        options: {
          name: 'Battery'
        }
      }
    ];

    // TODO: Should check whether device model ID must be found dynamically.
    //       Other sensorjs-xxx has the routine which emit 'discovered' and 'done' events.
    devices.push(new Device(self, deviceAddress, 'logifocus', sensors));
  });

  logger.debug('Discovered:', devices);

  return cb && cb(null, devices);
};

module.exports = new WifiLogifocus();
