"use strict";

//////////////////////////////////////////
// by Tomas Pollak - http://forkhq.com
//////////////////////////////////////////

var os   = require('os'),
    exec = require('child_process').exec;

exports.get_active_network_interface_name = function(cb) {
  var cmd = "netstat -rn | grep UG | awk '{print $6}'";
  exec(cmd, function(err, stdout) {
    if (err) return cb(err);

    var raw = stdout.toString().trim().split('\n');
    if (raw.length === 0 || raw === [''])
      return cb(new Error('No active network interface found.'));

    cb(null, raw[0]);
  });
};

/* unused

exports.interface_type_for = function(nic_name, cb) {
  exec('networksetup -listnetworkserviceorder | grep ' + nic_name, function(err, out) {
    if (err) return cb(err);

    var type = out.toString().match(/ethernet|lan/i) ? 'Wired' : 'Wireless';
    cb(null, type);
  })
};
*/

exports.mac_address_for = function(nic_name, cb) {
  var cmd = "networksetup -getmacaddress " + nic_name + " | awk '{print $3}'";
  exec(cmd, cb);
};

exports.gateway_ip_for = function(nic_name, cb) {
  var cmd = "ipconfig getoption " + nic_name + " router";
  exec(cmd, cb);
};

exports.netmask_for = function(nic_name, cb) {
  var cmd = "ipconfig getoption " + nic_name + " subnet_mask";
  exec(cmd, cb);
};

exports.get_network_interfaces_list = function(cb) {

  var list = [],
      nics = os.networkInterfaces();

  exec('networksetup -listallhardwareports', function(err, out) {
    if (err) return cb(err);

    out.toString().split(/Hardware/).slice(1).forEach(function(block) {

      var parts = block.match(/Port: (.+)/);
      if (!parts) return;

      var port = parts[1],
          type = port.match(/Ethernet/) ? 'Wired': port.match(/Wi-?Fi|AirPort/i) ? 'Wireless' : port;

      if (type == 'Wired' || type == 'Wireless') {

        var obj = {
            ip_address: null,
            type: type
        }

        obj.name = block.match(/Device: (\w+)/)[1];
        obj.mac_address = block.match(/Address: ([A-Fa-f0-9:-]+)/)[1];

        (nics[obj.name] || []).forEach(function(type) {
          if (type.family == 'IPv4') {
            obj.ip_address = type.address;
          }
        });

        list.push(obj);
      }

    })

    cb(null, list);
  })

};
