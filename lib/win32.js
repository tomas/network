"use strict";

var wmic = require('wmic'),
    exec = require('child_process').exec,
    os   = require('os');

function get_wmic_ip_value(what, nic_name, cb){
  exports.mac_address_for(nic_name, function(err, mac){
    if (err || !mac)
      return cb(err || new Error('No MAC Address found.'));

    wmic.get_value('nicconfig', what, 'MACAddress = \'' + mac + '\'', function(err, out){
      if (err) return cb(err);

      cb(null, out.split(',')[0].replace(/[^0-9\.]/g, ''));
    });
  })
}

exports.get_active_network_interface_name = function(cb) {
  wmic.get_value('nic', 'NetConnectionID', 'NetConnectionStatus = 2', cb);
};

exports.netmask_for = function(nic_name, cb) {
  get_wmic_ip_value('IPSubnet', nic_name, cb);
};

exports.gateway_ip_for = function(nic_name, cb) {
  get_wmic_ip_value('DefaultIPGateway', nic_name, cb);
};

exports.mac_address_for = function(nic_name, cb) {
  var cond = 'NetConnectionID = \'' + nic_name + '\'';
  wmic.get_value('nic', 'MACAddress', cond, cb);
}

exports.get_network_interfaces_list = function(callback) {

  var count, 
      list = [],
      node_nics = os.networkInterfaces();

  function done() {
    --count || callback(null, list);
  }

  function set_gateway(obj) {
    exports.gateway_ip_for(obj.name, function(err, res) {
      obj.gateway_ip = res && res != '' ? res : null;
      done();
    })
  }

  function set_netmask(obj) {
    exports.netmask_for(obj.name, function(err, res) {
      obj.netmask = res && res != '' ? res : null;
    })
  }

  wmic.get_list('nic', function(err, nics) {
    if (err) return callback(err);

    count = nics.length;
    nics.forEach(function(nic) {
      if (nic.Name && nic.NetConnectionID != '' && nic.MACAddress != '') {

        var obj = {
          name: nic.NetConnectionID,
          // description: nic.Name,
          mac_address: nic.MACAddress,
          ip_address: nic.IPAddress,
          vendor: nic.Manufacturer,
          model: nic.Description,
          type: nic.Name.match(/wi-?fi|wireless/i) ? 'Wireless' : 'Wired'
        }

        var node_nic = node_nics[obj.name] || [];

        node_nic.forEach(function(type) {
          if (type.family == 'IPv4') {
            obj.ip_address = type.address;
          }
        });

        list.push(obj);
        set_netmask(obj);        
        set_gateway(obj);
      } else {
        done();
      }
    })
  });

};
