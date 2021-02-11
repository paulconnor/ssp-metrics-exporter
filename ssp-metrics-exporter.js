const fs = require('fs');
const yaml = require('js-yaml');

const NodeCache = require( "node-cache" );
const cache_ttl = 300 // 300 second cache data TTL

const express = require('express')
const app = express()
const port = 8080;
var   simLevel = 3;
var   debugLevel = 0;

var bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));

function simData(){

   var str = "";
   str = "# HELP ssp_authn_users User registration and activity.\n";
   str += "# TYPE ssp_authn_users gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_users{source=\"SIM\",category=\"1_active_now\"} 400\n";
      str += "ssp_authn_users{source=\"SIM\",category=\"2_active_last_hour\"} 579\n";
      str += "ssp_authn_users{source=\"SIM\",category=\"3_active_last_day\"} 2017\n";
      str += "ssp_authn_users{source=\"SIM\",category=\"4_active_last_week\"} 8614\n";
      str += "ssp_authn_users{source=\"SIM\",category=\"5_active_last_month\"} 14323\n";
      str += "ssp_authn_users{source=\"SIM\",category=\"6_active_last_year\"} 73982\n";
      str += "ssp_authn_users{source=\"SIM\",category=\"7_registered\"} 92325\n";
   }
   str += "# HELP ssp_authn_device device fingerprint registrations.\n";
   str += "# TYPE ssp_authn_device gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_device{source=\"SIM\",device_count=\"1/user\"} 9635\n";
      str += "ssp_authn_device{source=\"SIM\",device_count=\"2/user\"} 18041\n";
      str += "ssp_authn_device{source=\"SIM\",device_count=\"3/user\"} 11087\n";
      str += "ssp_authn_device{source=\"SIM\",device_count=\"4/user\"} 6899\n";
      str += "ssp_authn_device{source=\"SIM\",device_count=\"5/user\"} 4247\n";
      str += "ssp_authn_device{source=\"SIM\",device_count=\"6+/user\"} 792\n";
   }
   str += "# HELP ssp_authn_credential registrations.\n";
   str += "# TYPE ssp_authn_credential gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_credential{source=\"SIM\",credential=\"FIDO2\",category=\"1/user\"} 7636\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"FIDO2\",category=\"2/user\"} 8049\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"FIDO2\",category=\"3/user\"} 9103\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"FIDO2\",category=\"4/user\"} 8825\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"FIDO2\",category=\"5/user\"} 1259\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"FIDO2\",category=\"6+/user\"} 800\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"MOTP\",category=\"1/user\"} 5655\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"MOTP\",category=\"2/user\"} 3061\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"MOTP\",category=\"3/user\"} 2103\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"MOTP\",category=\"4/user\"} 439\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"MOTP\",category=\"5/user\"} 646\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"MOTP\",category=\"6+/user\"} 82\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"SMS\",category=\"1/user\"} 777\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"SMS\",category=\"2/user\"} 815\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"SMS\",category=\"3/user\"} 914\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"SMS\",category=\"4/user\"} 895\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"SMS\",category=\"5/user\"} 142\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"SMS\",category=\"6+/user\"} 86\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PUSH\",category=\"1/user\"} 773\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PUSH\",category=\"2/user\"} 821\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PUSH\",category=\"3/user\"} 919\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PUSH\",category=\"4/user\"} 897\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PUSH\",category=\"5/user\"} 145\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PUSH\",category=\"6+/user\"} 84\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PASSWORD\",category=\"1/user\"} 639\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PASSWORD\",category=\"2/user\"} 1040\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PASSWORD\",category=\"3/user\"} 2098\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PASSWORD\",category=\"4/user\"} 831\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PASSWORD\",category=\"5/user\"} 252\n";
      str += "ssp_authn_credential{source=\"SIM\",credential=\"PASSWORD\",category=\"6+/user\"} 110\n";
   }
   str += "# HELP ssp_authn_token - count of refresh token usage.\n";
   str += "# TYPE ssp_authn_token gauge\n";
   if (simLevel > 0) {
      str += "ssp_authn_token{source=\"SIM\",action=\"refresh\"} 9674\n";
   }
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
    primaryAuth: new RegExp(settings.events.primaryAuth) ,
    secondaryAuth: new RegExp(settings.events.secondaryAuth) ,
    authStart: new RegExp(settings.events.authStart) ,
    authEnd: new RegExp(settings.events.authEnd) ,
    invalidCred1: new RegExp(settings.events.invalidCred1),
    invalidCred2: new RegExp(settings.events.invalidCred2)
}


/**
 *  * Returns a random number between min (inclusive) and max (exclusive)
 *   */
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

app.get('/debug', (req, res) => {

  if (req.query.debuglevel !== undefined) {
     debugLevel = Number(req.query.debuglevel);
     var msg = "Debug set to level - " + debugLevel + "\n";
     res.send(msg);
  } else {
     res.send('debuglevel parameter required \n')
  }
})

app.get('/sim', (req, res) => {

  if (req.query.simlevel !== undefined) {
     simLevel = Number(req.query.simlevel);
     ssp_authn_txn.sim();
     if (simLevel < 2) {ssp_authn_txn.flush();}
     var msg = "Simulation set to level - " + simLevel + "\n";
     res.send(msg);
  } else {
     res.send('simlevel parameter required \n')
  }
})

app.get('/metrics', (req, res) => {
  var response = ssp_authn_txn.print();
  response += simData(); 
  if (debugLevel > 2) {console.log(response)};
  ssp_authn_txn.flush();
  ssp_authn_txn.sim();
  res.send(response);
})


var ssp_authn_txn = {
   cache: new NodeCache(),
   txn: {
      source: "",
      userId: "",
      startTime: 0.0,
      endTime: 0.0,
      appName: "",
      factors: [],
      primaryCredential: "",
      secondaryCredential: "",
      riskScore: 0,
      riskFactor: "NO_RISK",
      result: false
   },
   sim: function(){
      var duration = 0.0;
      var txnId = "";
      var rec = {
         source: "",
         userId: "",
         startTime: 0.0,
         endTime: 0.0,
         appName: "",
         factors: [],
         primaryCredential: "",
         secondaryCredential: "",
         credError: [ { credential: "", count: 0 }, { credential: "", count: 0}],
         riskScore: 0,
         riskFactor: "NO_RISK",
         result: false
      };
      if (simLevel > 1) {
         for (var i = 0; i < settings.clients.length ; i++) {
            for (var j = 0; j < settings.credentials.length ; j++) {
               for (var k = 0; k < settings.factors.length ; k++) {
                  for (var l = 0; l < settings.results.length ; l++) {
                     txnId = "82b5166b-83ba-" + Math.floor(1000 + Math.random() * 9000) + "-99ce-6993e194ce3b";
                     rec.source = "SIM";
                     rec.startTime = 0.0;
                     rec.userId = "SIM" + Math.floor(1 + Math.random() * 5),
                     rec.endTime = rec.startTime + (Math.random() * 10);
                     rec.appName = settings.clients[i];
                     rec.factors[0] = settings.factors[k];
                     rec.primaryCredential = settings.credentials[Math.floor(Math.random() * (settings.credentials.length - 1))];
                     rec.secondaryCredential = settings.credentials[Math.floor(Math.random() * (settings.credentials.length - 1))];
                     rec.credError[0].credential = rec.primaryCredential;
                     rec.credError[0].count = Math.floor(Math.random() * 7);
                     rec.credError[1].credential = rec.secondaryCredential;
                     rec.credError[1].count = Math.floor(Math.random() * 7);
                     rec.riskScore = Math.floor(Math.random() * 90);
                     rec.riskFactor = settings.factors[k];
                     rec.result = settings.results[l];
                     this.cache.set(txnId,rec);
                  }
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
   },

   print: function (){
      var ssp_authn_response = "# HELP ssp_authn: Authentication request tagged with details of the request. The metric itself is the duration of authentication process. \n";
      ssp_authn_response = ssp_authn_response + "# TYPE ssp_authn gauge\n" ;
      var ssp_risk_response = "# HELP ssp_risk: Risk score for the authn transaction and primary risk factor. \n";
      ssp_risk_response = ssp_risk_response + "# TYPE ssp_risk gauge\n" ;
      var ssp_cred_error_response = "# HELP ssp_cred_error: Count of errors when using 1st and 2nd facture authenticationr. \n";
      ssp_cred_error_response = ssp_cred_error_response + "# TYPE ssp_cred_error gauge\n" ;

      var keys = this.cache.keys();
      for (var keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         if (Number(rec.endTime) !== 0) {
            var duration = Number(rec.endTime) - Number(rec.startTime);
            var str1 = `ssp_authn{client=\"${rec.appName}\",source=\"${rec.source}\",userId=\"${rec.userId}\",credential1=\"${rec.primaryCredential}\",credential2=\"${rec.secondaryCredential}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${duration}\n`
            if (debugLevel == 5) {console.log(str1);};
            ssp_authn_response += str1 ; 
            var str2 = `ssp_risk{client=\"${rec.appName}\",source=\"${rec.source}\",userId=\"${rec.userId}\",credential1=\"${rec.primaryCredential}\",credential2=\"${rec.secondaryCredential}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${rec.riskScore}\n`
            if (debugLevel == 6) {console.log(str2);};
            ssp_risk_response += str2 ; 
            var str3 = `ssp_cred_error{client=\"${rec.appName}\",source=\"${rec.source}\",userId=\"${rec.userId}\",credential=\"${rec.credError[0].credential}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${rec.credError[0].count}\n`
            str3 += `ssp_cred_error{client=\"${rec.appName}\",source=\"${rec.source}\",userId=\"${rec.userId}\",credential=\"${rec.credError[1].credential}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${rec.credError[1].count}\n`
            if (debugLevel == 7) {console.log(str3);};
            ssp_cred_error_response += str3 ; 
         }
      }
      return (ssp_authn_response + ssp_risk_response  + ssp_cred_error_response);
   },

   start: function(key,timestamp,userId) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
         // Not found, so start of a new transaction.
         var rec = {
            source: "SSP",
            userId: "",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            credError: [ { credential: "", count: 0 }, { credential: "", count: 0}],
            riskScore: 0,
            riskFactor: "NO_RISK",
            result: false
         };
         rec.startTime = timestamp;
         rec.userId = userId;
         ssp_authn_txn.cache.set(key,rec);
         if (debugLevel > 0) {console.log("authStart - ", key, " - ", timestamp); }
      } else {
         trans.startTime = timestamp;
         trans.userId = userId;
         ssp_authn_txn.cache.set(key,trans);
         if (debugLevel > 0) {console.log("authStart - ", key, " - ", timestamp); }
      }
   },

   end: function(key,timestamp) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("END Cant find txnId = ", key);
      } else {
         trans.endTime = timestamp;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (debugLevel > 0) {console.log("authEnd - ", key, " - ", timestamp); }
   },

   riskScore: function(key,timestamp,appName,factor,score) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
         var rec = {
            source: "SSP",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            credError: [ { credential: "", count: 0 }, { credential: "", count: 0}],
            riskScore: 0,
            riskFactor: "NO_RISK",
            result: false
         };
         rec.appName = appName;
         rec.riskScore = score;
         rec.riskFactor = factor;
         ssp_authn_txn.cache.set(key,rec);
      } else {
         trans.appName = appName;
         trans.riskScore = score;
         trans.riskFactor = factor;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (debugLevel > 0) {console.log("Risk Score - ", key, " - ", timestamp, " - ", appName, " - ", factor , " - ", score);}
   },

   riskFactor: function(key,timestamp, appName, factor,score) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
         var rec = {
            source: "SSP",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            credError: [ { credential: "", count: 0 }, { credential: "", count: 0}],
            riskScore: 0,
            riskFactor: "NO_RISK",
            result: false
         };
         rec.factors.push({ "factor": factor, "score": score });
         rec.appName = appName;
         rec.riskScore = score;
         rec.riskFactor = factor;
         ssp_authn_txn.cache.set(key,rec);
      } else {
         trans.factors.push({ "factor": factor, "score": score });
         ssp_authn_txn.cache.set(key,trans);
      }
      if (debugLevel > 0) {console.log("Risk Factor - ", key, " - ", timestamp, " - ", appName, " - ", factor, " - ", score); }
   },
   primaryCredential: function(key,timestamp, credential) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("PRIMARY CRED Cant find txnId = ", key);
      } else {
         trans.primaryCredential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (debugLevel > 0) {console.log("Primary Credential - ", key, " - ", timestamp, " - ", credential); }
   },
   secondaryCredential: function(key,timestamp, credential) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("SECONDARY CRED Cant find txnId = ", key);
      } else {
         trans.secondaryCredential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (debugLevel > 0) {console.log("Secondary Credential - ", key, " - ", timestamp, " - ", credential); }
   },
   result: function(key,timestamp,result) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("RESULT Cant find txnId = ", key);
      } else {
         trans.endTime = timestamp;
         trans.result = result;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (!result) { if (debugLevel > 0) {console.log("Failure - ", key, " - ", timestamp)};}
      if (result) { if (debugLevel > 0) {console.log("success - ", key, " - ", timestamp)};}
   },
   fail: function(key,timestamp,credential,credId) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("FAIL Cant find txnId = ", key);
      } else {
         trans.credError[credId].count += 1;
         trans.credError[credId].credential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (debugLevel > 0) {console.log("Credential Error - ", key, " - ", timestamp, " - ", credential)};
   }
}


app.post('/sspLogStream', function(req, res) {
  var result;


  for (var i = 0; i < req.body.length ; i++) {
     var msg = req.body[i].msg;

     result = msg.match(events.riskScore);
     if (result != null) { 
        ssp_authn_txn.riskScore(req.body[i].txnId, req.body[i].date, req.body[i].appName, result[1], result[2]); 
     }
     result = msg.match(events.riskFactor);
     if (result != null) { 
        ssp_authn_txn.riskFactor(req.body[i].txnId, req.body[i].date, req.body[i].appName, result[1], result[2]); 
     }

     if (msg.match(events.primaryAuth)) {
        ssp_authn_txn.primaryCredential(req.body[i].txnId, req.body[i].date, req.body[i]["factor-me-primary-ext-factorType"]); 
     }
     //result = msg.match(events.secondaryAuth);
     if (msg.match(events.secondaryAuth)) {
        ssp_authn_txn.secondaryCredential(req.body[i].txnId, req.body[i].date, req.body[i]["factor-me-secondary-ext-factorType"]); 
     }
     result = msg.match(events.authStart);
     if (result != null) { 
        ssp_authn_txn.start(req.body[i].txnId, req.body[i].date,req.body[i].userLoginId); 
     }
     if (msg.match(events.authEnd)) {
        ssp_authn_txn.result(req.body[i].txnId,req.body[i].date,"success");
     }
     if (msg.match(events.invalidCred1)) {
        ssp_authn_txn.fail(req.body[i].txnId,req.body[i].date,req.body[i]["factor-me-primary-ext-factorType"],0);
     }
     if (msg.match(events.invalidCred2)) {
        ssp_authn_txn.fail(req.body[i].txnId,req.body[i].date,req.body[i]["factor-me-secondary-ext-factorType"],1);
     }
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`SSP-METRICS-EXPORTER listening at http://0.0.0.0:${port}`)
})

