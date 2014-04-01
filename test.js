var network = require('./');

network.get_private_ip(function(err, res) {
  console.log('Private IP --- ');
  console.log(err || res);
})

network.get_gateway_ip(function(err, res) {
  console.log('Gateway IP --- ');
  console.log(err || res);
})

network.get_active_network_interface(function(err, res) {
  console.log('Active Network Interface --- ');
  console.log(err || res);
})
