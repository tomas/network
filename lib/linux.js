"use strict";

//////////////////////////////////////////
// by Tomas Pollak - http://forkhq.com
//////////////////////////////////////////

var os   = require('os'),
    exec = require('child_process').exec;

/**
 * If no wifi, then there is no error but cbed get's a null in second param.
 **/
exports.get_active_network_interface_name = function(cb) {
  var cmd = "netstat -rn | grep UG | awk '{print $NF}'";
  exec(cmd, function(err, stdout) {
    if (err) return cb(err);

    var raw = stdout.toString().trim().split('\n');
    if (raw.length === 0 || raw === [''])
      return cb(new Error('No active network interface found.'));

    cb(null, raw[0]);
  });
};

exports.interface_type_for = function(nic_name, cb) {
  exec('cat /proc/net/wireless | grep ' + nic_name, function(err, out) {
    return cb(null, err ? 'Wired' : 'Wireless')
  })
};

exports.mac_address_for = function(nic_name, cb) {
  var cmd = "ifconfig | grep " + nic_name + " | grep 'HWaddr' | awk '{print $5}'";
  exec(cmd, cb);
};

exports.gateway_ip_for = function(nic_name, cb) {
  exec("ip r | grep " + nic_name + " | grep default | cut -d ' ' -f 3", cb);
};

exports.netmask_for = function(nic_name, cb) {
  var cmd = "ifconfig " + nic_name + " 2> /dev/null | grep 'Mask:' | awk '{print $4}'";
  exec(cmd, function(err, stdout) {
    if (err) return cb(err);

    var out = stdout.toString(),
        netmask = (out !== '') && out.replace('Mask:', '').split("\n")[0];

    cb(null, netmask);
  });
};

exports.get_network_interfaces_list = function(cb) {

  var count = 0,
      list = [],
      nics = os.networkInterfaces();

  var append_data = function(obj) {
    exports.mac_address_for(obj.name, function(err, res) {
      if (!err && res)
        obj.mac_address = res.trim();

      exports.interface_type_for(obj.name, function(err, res) {
        if (!err && res)
          obj.type = res;

        list.push(obj);
        --count || cb(null, list);
      })
    })
  }

  for (var key in nics) {
    if (key != 'lo0' && key != 'lo' && !key.match(/^tun/)) {

      count++;
      var obj = { name: key };

      nics[key].forEach(function(type) {
        if (type.family == 'IPv4') {
          obj.ip_address = type.address;
        }
      });

      append_data(obj);
    }
  }

  if (count == 0)
    cb(new Error('No interfaces found.'))
}
