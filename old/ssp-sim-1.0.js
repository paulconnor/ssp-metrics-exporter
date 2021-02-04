const fs = require('fs');
const yaml = require('js-yaml');

const NodeCache = require( "node-cache" );
const cache_ttl = 300 // 300 second cache data TTL

const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/*
const factors = ["RISKY_COUNTRY","DEVICE_MFP_MISMATCH","KNOWN_FRAUD","DIFFICULT_TRAVEL"]
const clients = ["democlient1","democlient2"]
const credentials = ["FIDO2","MOTP","SMS","PUSH","PASSWORD"]
const categories = ["1_active_now","2_active_last_hour","3_active_last_day","4_active_last_week","5_active_last_month","6_active_last_year","7_registered"]
const results = ["success","failure"]
*/




function simData(){

   var str = "# HELP ssp_authn_users User registration and activity.\n";
   str += "# TYPE ssp_authn_users gauge\n";
   str += "ssp_authn_users{category=\"1_active_now\"} 400\n";
   str += "ssp_authn_users{category=\"2_active_last_hour\"} 579\n";
   str += "ssp_authn_users{category=\"3_active_last_day\"} 2017\n";
   str += "ssp_authn_users{category=\"4_active_last_week\"} 8614\n";
   str += "ssp_authn_users{category=\"5_active_last_month\"} 14323\n";
   str += "ssp_authn_users{category=\"6_active_last_year\"} 73982\n";
   str += "ssp_authn_users{category=\"7_registered\"} 92325\n";
   str += "# HELP ssp_authn_device device fingerprint registrations.\n";
   str += "# TYPE ssp_authn_device gauge\n";
   str += "ssp_authn_device{device_count=\"1/user\"} 9635\n";
   str += "ssp_authn_device{device_count=\"2/user\"} 18041\n";
   str += "ssp_authn_device{device_count=\"3/user\"} 11087\n";
   str += "ssp_authn_device{device_count=\"4/user\"} 6899\n";
   str += "ssp_authn_device{device_count=\"5/user\"} 4247\n";
   str += "ssp_authn_device{device_count=\"6+/user\"} 792\n";
   str += "# HELP ssp_authn_credential registrations.\n";
   str += "# TYPE ssp_authn_credential gauge\n";
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
   str += "# HELP ssp_authn_token - count of refresh token usage.\n";
   str += "# TYPE ssp_authn_token gauge\n";
   str += "ssp_authn_token{action=\"refresh\"} 9674\n";

   return(str);

}

/**
 ** load the SSP Cred/factors/...
 **/
var settings
try {
    let fileContents = fs.readFileSync('./ssp-sim.yaml', 'utf8');
    settings = yaml.load(fileContents);
} catch (e) {
    console.log(e);
}
var events = {
    loginSuccess: new RegExp(settings.events.loginSuccess, "g") ,
    loginFailure: new RegExp(settings.events.loginFailure, "g") ,
    riskScore: new RegExp(settings.events.riskScore) ,
    riskFactor: new RegExp(settings.events.riskFactor) ,
    credential: new RegExp(settings.events.credential) ,
    authStart: new RegExp(settings.events.authStart) ,
    authEnd: new RegExp(settings.events.authEnd) 
}


/**
 *  * Returns a random number between min (inclusive) and max (exclusive)
 *   */
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

/*
var ssp_authn = {
   cache: new NodeCache(),

   update: function(client,credential,factor,result,value){
      var key = `${client}.${credential}.${factor}.${result}`
      var obj = { client: "",
                  credential: "",
                  factor: "",
                  result: "",
                  gauge: 0 };
      obj.client = client;
      obj.credential = credential;
      obj.factor = factor;
      obj.result = result;

      var record = this.cache.get(key)

      if ( record == undefined ){
         obj.gauge = value;
      } else {
         obj.gauge = value + record.gauge;
      }
      success = this.cache.set( key, obj, cache_ttl );
   },

   init: function(){
      var obj = { client: "",
                  credential: "",
                  factor: "",
                  result: "",
                  gauge: 0 };
      var key = "";
      for (var i = 0; i < settings.clients.length ; i++) {
         for (var j = 0; j < settings.credentials.length ; j++) {
            for (var k = 0; k < settings.factors.length ; k++) {
               for (var l = 0; l < settings.results.length ; l++) {
                  obj.client = settings.clients[i];
                  obj.credential = settings.credentials[j];
                  obj.factor = settings.factors[k];
                  obj.result = settings.results[l];
                  key = `${obj.client}.${obj.credential}.${obj.factor}.${obj.result}`
                  success = this.cache.set( key, obj, cache_ttl );
               }
            }
         }
      }
   },

   sim: function(){
      var counter=0;
      for (var i = 0; i < settings.clients.length ; i++) {
         for (var j = 0; j < settings.credentials.length ; j++) {
            for (var k = 0; k < settings.factors.length ; k++) {
               for (var l = 0; l < settings.results.length ; l++) {
                  counter = between(10,10000);
                  if (settings.results[l] == "failure") { counter = Math.floor(counter/10); }
                     this.update(settings.clients[i],settings.credentials[j],settings.factors[k],settings.results[l],counter);
               }
            }
         }
      }
   },

   print: function (){
      var response = "# HELP ssp_authn Number of authentication requests in the sample period. \n";
      response = response + "# TYPE ssp_authn gauge\n" ;
      keys = this.cache.keys();
      for (var ssp_authn in keys) {
         var rec = this.cache.get(keys[ssp_authn]);
         var str = `ssp_authn{client=\"${rec.client}\",credential=\"${rec.credential}\",factor=\"${rec.factor}\",result=\"${rec.result}\"} ${rec.gauge}\n"`
         response = response + str ;
      }
      this.cache.flushAll()
      this.init()
      return (response);
   }
}


var ssp_authn_duration = {
   cache: new NodeCache(),

   update: function(client,credential,result,value){
      var key = `${client}.${credential}.${result}`
      var obj = { client: "",
                  credential: "",
                  result: "",
                  gauge: 0 };
      obj.client = client;
      obj.credential = credential;
      obj.result = result;

      var record = this.cache.get(key)

      if ( record == undefined ){
         obj.gauge = value;
      } else {
         obj.gauge = value + record.gauge;
      }
      success = this.cache.set( key, obj, cache_ttl );
   },

   init: function(){
      var key = "";
      var obj = { client: "",
                  credential: "",
                  result: "",
                  gauge: 0 };
      for (var i = 0; i < settings.clients.length ; i++) {
         for (var j = 0; j < settings.credentials.length ; j++) {
            for (var l = 0; l < settings.results.length ; l++) {
               obj.client = settings.clients[i];
               obj.credential = settings.credentials[j];
               obj.result = settings.results[l];
               key = `${obj.client}.${obj.credential}.${obj.result}`
               success = this.cache.set( key, obj, cache_ttl );
            }
         }
      }
   },

   sim: function(){
      var counter=0;
      for (var i = 0; i < settings.clients.length ; i++) {
         for (var j = 0; j < settings.credentials.length ; j++) {
            for (var l = 0; l < settings.results.length ; l++) {
               counter = Math.random() * (2 - 11) + 2; 
               if (counter < 0) {counter = counter * -1.0}
               this.update(settings.clients[i],settings.credentials[j],settings.results[l],counter);
            }
         }
      }
   },

   print: function (){
      var response = "# HELP ssp_authn_duration: average time to authenticate over the sample period. \n";
      response = response + "# TYPE ssp_authn_duration gauge\n" ;
      keys = this.cache.keys();
      for (var ssp_authn in keys) {
         var rec = this.cache.get(keys[ssp_authn]);
         var str = `ssp_authn_duration{client=\"${rec.client}\",credential=\"${rec.credential}\",result=\"${rec.result}\"} ${rec.gauge}\n"`
         response = response + str ;
      }
      this.cache.flushAll()
      this.init()
      return (response);
   }
}
// Initialise the collector 
ssp_authn.init();
ssp_authn_duration.init();
*/

app.get('/sim', (req, res) => {
  ssp_authn_txn.sim();
  res.send('Simulation Complete!')
})

app.get('/metrics', (req, res) => {
  var response = ssp_authn_txn.print();
  response += simData(); 
  ssp_authn_txn.flush();
  res.send(response);
})
// POST http://localhost:8080/api/users
// parameters sent with
//


var ssp_authn_txn = {
   cache: new NodeCache(),
   aggCache: new NodeCache(),
   txn: {
      startTime: 0.0,
      endTime: 0.0,
      appName: "",
      factors: [],
      credentials: [],
      riskScore: 0,
      riskFactor: null,
      result: false
   },
   sim: function(){
      var duration = 0.0;
      var txnId = "";
      for (var i = 0; i < settings.clients.length ; i++) {
         for (var j = 0; j < settings.credentials.length ; j++) {
            for (var k = 0; k < settings.factors.length ; k++) {
               for (var l = 0; l < settings.results.length ; l++) {
                  txnId = "82b5166b-83ba-" + Math.floor(1000 + Math.random() * 9000) + "-99ce-6993e194ce3b";
                  this.txn.startTime = 0.0
                  this.txn.endTime = this.txn.startTime + (Math.random() * 10);
                  this.txn.appName = settings.clients[i];
                  this.txn.factors[0] = settings.factors[k];
                  this.txn.credentials[0] = settings.credentials[j];
                  this.txn.riskScore = Math.floor(Math.random() * 90);
                  this.txn.riskFactor = settings.factors[k];
                  this.txn.result = settings.results[l];
                  this.cache.set(txnId,this.txn);
                  //this.update(settings.clients[i],settings.credentials[j],settings.factors[k],settings.results[l],counter);
               }
            }
         }
      }
   },

   flush: function (){

      var keys = this.cache.keys();
      var keyId = 0;
      for (keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         if (Number(rec.endTime) !== 0) {
            this.cache.del(keys[keyId]);
         }
      }

      keys = this.aggCache.keys();
      for (keyId in keys) {
         var rec = this.aggCache.get(keys[keyId]);
         rec.count = 0;
         rec.riskScoreTotal = 0;
         rec.riskScoreMin = 0;
         rec.riskScoreMax = 0;
         rec.durationTotal = 0;
         rec.durationMin = 0;
         rec.durationMax = 0;
	 this.aggCache.set(keys[keyId],rec);
      }
   },

   print: function (){
      var ssp_authn_response = "# HELP ssp_authn: Authentication request tagged with details of the request. The metric itself is the duration of authentication process. \n";
      ssp_authn_response = ssp_authn_response + "# TYPE ssp_authn gauge\n" ;
      var ssp_risk_response = "# HELP ssp_risk: Risk score for the authn transaction and primary risk factor. \n";
      ssp_risk_response = ssp_risk_response + "# TYPE ssp_risk gauge\n" ;

      var keys = this.cache.keys();
      var keyId = 0;

      for (keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         // If The authentication exchange is complete
         if (rec.endTime !== 0) { 
            var aggKey = rec.appName + "." + rec.credentials[0] + "." + rec.riskFactor + "." + rec.result ;
            var aggRec = this.aggCache.get(aggKey);
            var duration = Number(rec.endTime) - Number(rec.startTime);
            if (aggRec == undefined) {
               // If the first entry for this key
               aggRec = { "appName": rec.appName, "credential" : rec.credentials[0], "factor": rec.riskFactor, "result": rec.result, "count" : 1, "riskScoreTotal": rec.riskScore, "riskScoreMin": rec.riskScore, "riskScoreMax" : rec.riskScore, "durationTotal": duration, "durationMin": duration, "durationMax":duration  };
            } else {
               if (aggRec.riskScoreMin > rec.riskScore) { aggRec.riskScoreMin = rec.riskScore ; }
               if (aggRec.riskScoreMax < rec.riskScore) { aggRec.riskScoreMax = rec.riskScore ; }
               aggRec.riskScoreTotal = Number(aggRec.riskScoreTotal) + Number(rec.riskScore) ;
               if (aggRec.durationMin > duration) { aggRec.durationMin = duration ; }
               if (aggRec.durationMax < duration) { aggRec.durationMax = duration ; }
               aggRec.durationTotal = Number(aggRec.durationTotal) + duration ;
               aggRec.count += 1;
            }
	    this.aggCache.set(aggKey,aggRec);
         }


      }
      keys = this.cache.keys();
      for (keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         var duration = Number(rec.endTime) - Number(rec.startTime);
         var str1 = `ssp_authn{client=\"${rec.appName}\",credential=\"${rec.credentials[0]}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${duration}\n`
         ssp_authn_response += str1 ; 
         var str2 = `ssp_risk{client=\"${rec.appName}\",credential=\"${rec.credentials[0]}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${rec.riskScore}\n`
         ssp_risk_response += str2 ; 
      }
      return (ssp_authn_response + ssp_risk_response);
   },

   start: function(key,timestamp) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
         // Not found, so start of a new transaction.
         ssp_authn_txn.txn.startTime = timestamp;
         ssp_authn_txn.cache.set(key,this.txn);
//         console.log("authStart - ", key, " - ", timestamp); 
      }
   },

   end: function(key,timestamp) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("Cant find txnId = ", key);
      } else {
         trans.endTime = timestamp;
         ssp_authn_txn.cache.set(key,trans);
      }
//      console.log("authEnd - ", key, " - ", timestamp); 
   },

   riskScore: function(key,timestamp,appName,factor,score) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("Cant find txnId = ", key);
      } else {
         trans.appName = appName;
         trans.riskScore = score;
         trans.riskFactor = factor;
         ssp_authn_txn.cache.set(key,trans);
      }
//      console.log("Risk Score - ", key, " - ", timestamp, " - ", appName, " - ", factor , " - ", score);
   },

   riskFactor: function(key,timestamp, appName, factor,score) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("Cant find txnId = ", key);
      } else {
         //var obj = { "factor": factor, "score": score };
         //trans.factors[0] = { "factor": factor, "score": score };
         trans.factors.push({ "factor": factor, "score": score });
         ssp_authn_txn.cache.set(key,trans);
      }
//      console.log("Risk Factor - ", key, " - ", timestamp, " - ", appName, " - ", factor, " - ", score); 
   },
   credential: function(key,timestamp, credential, result) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("Cant find txnId = ", key);
      } else {
         trans.credentials[0] = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
//      console.log("credential - ", key, " - ", timestamp, " - ", credential, " - ", result);
   },
   result: function(key,timestamp,result) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("Cant find txnId = ", key);
      } else {
         trans.endTime = timestamp;
         trans.result = result;
         ssp_authn_txn.cache.set(key,trans);
      }
//      if (!result) {console.log("Failure - ", key, " - ", timestamp);}
//      if (result) {console.log("success - ", key, " - ", timestamp);}
   }
}

app.post('/collector', function(req, res) {
  var msg = req.body.msg;
  var result;

/*
  const loginSuccess = /Authentication for user (.*) successful/g;
  const loginFailure = /Invalid password for (.*) Invalid Credentials/g;
  const riskScore = /Final riskscore evaluated: (.*),(.*)/;
  const riskFactor = /Risk identified with the factor: (.*), risk_score: (.*)/;
  const credential = /Status for authenticateCredentials for (.*) for requestId (.*) : (.*)/;
  const authStart = /JWT signature verified successfully/;
  const authEnd = /Authentication for user (.*) successful/;
*/

  result = msg.match(events.riskScore);
  if (result != null) { ssp_authn_txn.riskScore(req.body.txnId, req.body.date, req.body.appName, result[1], result[2]); }
  result = msg.match(events.riskFactor);
  if (result != null) { ssp_authn_txn.riskFactor(req.body.txnId, req.body.date, req.body.appName, result[1], result[2]); }
  result = msg.match(events.credential);
  if (result != null) { ssp_authn_txn.credential(req.body.txnId, req.body.date, result[1], result[3]); }
  result = msg.match(events.authStart);
  if (result != null) { ssp_authn_txn.start(req.body.txnId, req.body.date); }
  if (msg.match(events.loginSuccess)) {
     ssp_authn_txn.result(req.body.txnId,req.body.date,true);
  }
  if (msg.match(events.loginFailure)) {
     ssp_authn_txn.result(req.body.txnId,req.body.date,false);
  }

  res.sendStatus(200);
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

