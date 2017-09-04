'use strict';

var logger = require('log4js').getLogger('Sensor');

function initDrivers() {
  var logifocusSensor;

  try {
    logifocusSensor = require('./driver/logifocusSensor');
  } catch(e) {
    logger.error('Cannot load ./driver/logifocusSensor', e);
  }

  return {
    logifocusSensor: logifocusSensor
  };
}

function initNetworks() {
  var wifiLogifocus;

  try {
    wifiLogifocus = require('./network/wifi-logifocus');
  } catch (e) {
    logger.error('Cannot load ./network/wifi-logifocus', e);
  }

  return {
    'wifi-logifocus': wifiLogifocus
  };
}

module.exports = {
  networks: ['wifi-logifocus'],
  drivers: {
    logifocusSensor: ['logifocusTemp', 'logifocusHumi', 'logifocusPm10', 'logifocusPm25', 'logifocusBattery']
  },
  initNetworks: initNetworks,
  initDrivers: initDrivers
};
