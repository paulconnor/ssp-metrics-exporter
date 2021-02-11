const fs = require('fs');
const SSP = require('./ssp-txn.js');
const yaml = require('js-yaml');

const NodeCache = require( "node-cache" );
const cache_ttl = 300 // 300 second cache data TTL

var sspTxn = new SSP(); 

const express = require('express')
const app = express()
const port = 8080;
var   simLevel = 0;

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


function simData(){

   var str = "";
   str = "# HELP ssp_authn_users User registration and activity.\n";
   str += "# TYPE ssp_authn_users gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_users{category=\"1_active_now\"} 400\n";
      str += "ssp_authn_users{category=\"2_active_last_hour\"} 579\n";
      str += "ssp_authn_users{category=\"3_active_last_day\"} 2017\n";
      str += "ssp_authn_users{category=\"4_active_last_week\"} 8614\n";
      str += "ssp_authn_users{category=\"5_active_last_month\"} 14323\n";
      str += "ssp_authn_users{category=\"6_active_last_year\"} 73982\n";
      str += "ssp_authn_users{category=\"7_registered\"} 92325\n";
   }
   str += "# HELP ssp_authn_device device fingerprint registrations.\n";
   str += "# TYPE ssp_authn_device gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_device{device_count=\"1/user\"} 9635\n";
      str += "ssp_authn_device{device_count=\"2/user\"} 18041\n";
      str += "ssp_authn_device{device_count=\"3/user\"} 11087\n";
      str += "ssp_authn_device{device_count=\"4/user\"} 6899\n";
      str += "ssp_authn_device{device_count=\"5/user\"} 4247\n";
      str += "ssp_authn_device{device_count=\"6+/user\"} 792\n";
   }
   str += "# HELP ssp_authn_credential registrations.\n";
   str += "# TYPE ssp_authn_credential gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_credential{credential=\"FIDO2\",category=\"1/user\"} 7636\n";
      str += "ssp_authn_credential{credential=\"FIDO2\",category=\"2/user\"} 8049\n";
      str += "ssp_authn_credential{credential=\"FIDO2\",category=\"3/user\"} 9103\n";
      str += "ssp_authn_credential{credential=\"FIDO2\",category=\"4/user\"} 8825\n";
      str += "ssp_authn_credential{credential=\"FIDO2\",category=\"5/user\"} 1259\n";
      str += "ssp_authn_credential{credential=\"FIDO2\",category=\"6+/user\"} 800\n";
      str += "ssp_authn_credential{credential=\"MOTP\",category=\"1/user\"} 5655\n";
      str += "ssp_authn_credential{credential=\"MOTP\",category=\"2/user\"} 3061\n";
      str += "ssp_authn_credential{credential=\"MOTP\",category=\"3/user\"} 2103\n";
      str += "ssp_authn_credential{credential=\"MOTP\",category=\"4/user\"} 439\n";
      str += "ssp_authn_credential{credential=\"MOTP\",category=\"5/user\"} 646\n";
      str += "ssp_authn_credential{credential=\"MOTP\",category=\"6+/user\"} 82\n";
      str += "ssp_authn_credential{credential=\"SMS\",category=\"1/user\"} 777\n";
      str += "ssp_authn_credential{credential=\"SMS\",category=\"2/user\"} 815\n";
      str += "ssp_authn_credential{credential=\"SMS\",category=\"3/user\"} 914\n";
      str += "ssp_authn_credential{credential=\"SMS\",category=\"4/user\"} 895\n";
      str += "ssp_authn_credential{credential=\"SMS\",category=\"5/user\"} 142\n";
      str += "ssp_authn_credential{credential=\"SMS\",category=\"6+/user\"} 86\n";
      str += "ssp_authn_credential{credential=\"PUSH\",category=\"1/user\"} 773\n";
      str += "ssp_authn_credential{credential=\"PUSH\",category=\"2/user\"} 821\n";
      str += "ssp_authn_credential{credential=\"PUSH\",category=\"3/user\"} 919\n";
      str += "ssp_authn_credential{credential=\"PUSH\",category=\"4/user\"} 897\n";
      str += "ssp_authn_credential{credential=\"PUSH\",category=\"5/user\"} 145\n";
      str += "ssp_authn_credential{credential=\"PUSH\",category=\"6+/user\"} 84\n";
      str += "ssp_authn_credential{credential=\"PASSWORD\",category=\"1/user\"} 639\n";
      str += "ssp_authn_credential{credential=\"PASSWORD\",category=\"2/user\"} 1040\n";
      str += "ssp_authn_credential{credential=\"PASSWORD\",category=\"3/user\"} 2098\n";
      str += "ssp_authn_credential{credential=\"PASSWORD\",category=\"4/user\"} 831\n";
      str += "ssp_authn_credential{credential=\"PASSWORD\",category=\"5/user\"} 252\n";
      str += "ssp_authn_credential{credential=\"PASSWORD\",category=\"6+/user\"} 110\n";
   }
   str += "# HELP ssp_authn_token - count of refresh token usage.\n";
   str += "# TYPE ssp_authn_token gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_token{action=\"refresh\"} 9674\n";
   }
   return(str);

}

var events = {
    loginSuccess: new RegExp(sspTxn.settings.events.loginSuccess, "g") ,
    loginFailure: new RegExp(sspTxn.settings.events.loginFailure, "g") ,
    riskScore: new RegExp(sspTxn.settings.events.riskScore) ,
    riskFactor: new RegExp(sspTxn.settings.events.riskFactor) ,
    primaryAuth: new RegExp(sspTxn.settings.events.primaryAuth) ,
    secondaryAuth: new RegExp(sspTxn.settings.events.secondaryAuth) ,
    authStart: new RegExp(sspTxn.settings.events.authStart) ,
    authEnd: new RegExp(sspTxn.settings.events.authEnd) 
}


/**
 *  * Returns a random number between min (inclusive) and max (exclusive)
 *   */
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


app.get('/sim', (req, res) => {

  if (req.query.simlevel !== undefined) {
     simLevel = Number(req.query.simlevel);
     sspTxn.sim();
     if (simLevel < 2) {sspTxn.flush();}
     var msg = "Simulation set to level - " + simLevel;
     res.send(msg);
  } else {
     res.send('simlevel parameter required')
  }
})

app.get('/metrics', (req, res) => {
  var response = sspTxn.print();
  response += simData(); 
  console.log(response);
  sspTxn.flush();
  sspTxn.sim();
  res.send(response);
})




app.post('/sspLogStream', function(req, res) {
  var result;


  for (var i = 0; i < req.body.length ; i++) {
     var msg = req.body[i].msg;

     result = msg.match(events.riskScore);
     if (result != null) { 
        sspTxn.riskScore(req.body[i].txnId, req.body[i].date, req.body[i].appName, result[1], result[2]); 
     }
     result = msg.match(events.riskFactor);
     if (result != null) { 
        sspTxn.riskFactor(req.body[i].txnId, req.body[i].date, req.body[i].appName, result[1], result[2]); 
     }

     if (msg.match(events.primaryAuth)) {
        sspTxn.primaryCredential(req.body[i].txnId, req.body[i].date, req.body[i]["factor-me-primary-ext-factorType"]); 
     }
     //result = msg.match(events.secondaryAuth);
     if (msg.match(events.secondaryAuth)) {
        sspTxn.secondaryCredential(req.body[i].txnId, req.body[i].date, req.body[i]["factor-me-secondary-ext-factorType"]); 
     }
     result = msg.match(events.authStart);
     if (result != null) { 
        sspTxn.start(req.body[i].txnId, req.body[i].date); 
     }
     if (msg.match(events.authEnd)) {
        sspTxn.result(req.body[i].txnId,req.body[i].date,"success");
     }
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})

