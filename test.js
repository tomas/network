var network = require('./lib');

network.get_public_ip(function(err, res) {
  console.log('Public IP --- ');
  console.log(err || res);
});

network.get_private_ip(function(err, res) {
  console.log('Private IP --- ');
  console.log(err || res);
});

network.get_gateway_ip(function(err, res) {
  console.log('Gateway IP --- ');
  console.log(err || res);
});

network.get_active_interface(function(err, res) {
  console.log('Active Network Interface --- ');
  console.log(err || res);
});

network.get_interfaces_list(function(err, res) {
  console.log('Network Interfaces List --- ');
  console.log(err || res);
});
