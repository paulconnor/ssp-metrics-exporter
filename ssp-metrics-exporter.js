const fs = require('fs');
const yaml = require('js-yaml');

const NodeCache = require( "node-cache" );
const cache_ttl = 300 // 300 second cache data TTL

const express = require('express')
const app = express()
const port = 8080;
var   simLevel = 2;
var   debugLevel = 2;

var bodyParser = require('body-parser');
//app.use(bodyParser.json()); // support json encoded bodies
//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.json({limit: '200mb'}));
app.use(bodyParser.urlencoded({limit: '200mb', extended: true}));


const maxAuthSessionTimer = 5000; // milliseconds ; timer to scan for abandoned calls.
const maxAuthSessionDuration = 120000; // milliseconds ; assumes authn is abandoned if not completed with 2 minutes


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
    authStart: new RegExp(settings.events.authStart) ,
    authEnd: new RegExp(settings.events.authEnd) ,
    iarisk: new RegExp(settings.events.iarisk) ,
    factorSuccess: new RegExp(settings.events.factorSuccess) ,
    factorFail: new RegExp(settings.events.factorFail),
    registeredDevice: new RegExp(settings.events.registeredDevice),
    unregisteredDevice: new RegExp(settings.events.unregisteredDevice)
}


/**
 *  * Returns a random number between min (inclusive) and max (exclusive)
 *   */
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


var ssp_cred_fail_txn = {
   cache: new NodeCache(),

   fail: function(uid,appName, userName, factorType, responseCode, factorRole,txnId) {

     var rec = {
        appName: "",
        source: "SSP",
        userName: "",
        factorType: "",
        factorRole: "",
        responseCode: "",
        txnId: ""
     }
     rec.userName = userName || "anonymous" ;
     rec.appName = appName || "anonymous" ;
     rec.factorType = factorType || "unknown" ;
     rec.factorRole = factorRole || "unknown" ;
     rec.responseCode = responseCode || "unknown" ;
     rec.txnId = txnId || "unknown" ;

     if (rec.txnId !== "unknown") {
        var trans = ssp_authn_txn.cache.get(rec.txnId);
        if (trans !== undefined) {
           if (rec.factorRole === "primary") {
              trans.primaryCredential = rec.factorType;
           } else {
              if (rec.factorRole === "secondary") {
                 trans.secondaryCredential = rec.factorType;
              }
           }
           ssp_authn_txn.cache.set(rec.txnId,trans);
        }
     }

     if (debugLevel > 0) {console.log(uid, "\t", events.invalidCredential, "\t", rec.userName, "\t", rec.appName, "\t", rec.factorType, "\t", rec.factorRole, "\t", rec.responseCode); }
     ssp_cred_fail_txn.cache.set(uid,rec);
   },

   flush: function (){

      var keys = ssp_cred_fail_txn.cache.keys();
      for (var keyId in keys) {
         ssp_cred_fail_txn.cache.del(keys[keyId]);
      }
   },

   print: function() {

      var str = "";
      var keys = ssp_cred_fail_txn.cache.keys();
      for (var keyId in keys) {
         var rec = ssp_cred_fail_txn.cache.get(keys[keyId]);
         var respCode = rec.responseCode.match(/\d+/)[0];
         str += `ssp_cred_error{appName=\"${rec.appName}\",uid=\"${keys[keyId]}\",source=\"${rec.source}\",userName=\"${rec.userName}\",factorType=\"${rec.factorType}\"} ${respCode}\n`
      }
      if (debugLevel == 11) {console.log("CRED-FAIL PRINT : " + str);};
      return (str);
   },
   sim: function() {
      var rec = {
        appName: "",
        source: "SIM",
        userName: "",
        factorType: "",
        factorRole: "",
        responseCode: "",
        txnId: ""
      };
      if (simLevel > 1) {
         for (var i = 0; i < settings.clients.length ; i++) {
            for (var j = 0; j < settings.credentials.length ; j++) {
                  if (Math.random() < 0.5) {
                     rec.txnId = "82b5166b-83ba-" + Math.floor(1000 + Math.random() * 9000) + "-99ce-6993e194ce3b";
                     rec.userName = "SIM" + Math.floor(1 + Math.random() * 5),
                     rec.appName = settings.clients[i];
                     rec.factorType = settings.credentials[j];
                     rec.factorRole = "secondary";
                     rec.responseCode =  '401 UNAUTHORIZED';
                     var uid = Date.now() + Math.random();
                     ssp_cred_fail_txn.cache.set(uid,rec);
                  }
            }
         }
      }
   }
}

var ssp_device = {

   Recognized:  0,
   Unrecognized: 0,
   found: function(isRecognized) {

      if (isRecognized) {
         this.Recognized += 1;
      } else {
         this.Unrecognized += 1;
      }

     if (debugLevel > 2) {console.log("ssp_device ", "\t", this.Recognized, "\t", this.Unrecognized); }
   },

   flush: function (){

      this.Recognized = 0;
      this.Unrecognized = 0;
   },

   print: function() {

      var str = "# HELP ssp_device: Count of the number of times a device has been recognized or not during authentication. \n";
      str +=  "# TYPE ssp_device gauge\n" ;
      str += `ssp_device{source=\"SSP\",recognized=\"true\"} ${this.Recognized}\n`
      str += `ssp_device{source=\"SSP\",recognized=\"false\"} ${this.Unrecognized}\n`
      return (str);
   },

   sim: function() {
      var recog =  Math.floor(10 + Math.random() * 50);
      var unrecog =  Math.floor(50 + Math.random() * 30);

      var str = "";
      str += `ssp_device{source=\"SIM\",recognized=\"true\"} ${recog}\n`
      str += `ssp_device{source=\"SIM\",recognized=\"false\"} ${unrecog}\n`
      return (str);
   }
}



var ssp_risk_txn = {
   riskCache: new NodeCache(),
   userCache: new NodeCache(),

   sim: function(){
      var duration = 0.0;
      var txnId = "";
      var rec = {
	 uuid: "",
         source: "SIM",
         userName: "",
         appName: "",
         riskReason: "",
         riskScore: 0,
         riskThreshold: 0,
         risky: ""
      };
      if (simLevel > 1) {
         for (var i = 0; i < settings.clients.length ; i++) {
            for (var j = 0; j < settings.credentials.length ; j++) {
               for (var k = 0; k < settings.factors.length ; k++) {
                  for (var l = 0; l < settings.results.length ; l++) {
                     txnId = "82b5166b-83ba-" + Math.floor(1000 + Math.random() * 9000) + "-99ce-6993e194ce3b";
                     rec.userName = "SIM" + Math.floor(1 + Math.random() * 5),
                     rec.appName = settings.clients[i];
                     rec.uuid = "simulated-uuid";
                     rec.riskScore = Math.floor(Math.random() * 60);
                     rec.riskThreshold = Math.floor(Math.random() * 90);
                     rec.risky = (rec.riskScore > rec.riskThreshold) ? "true" : "false" ;
                     rec.riskReason = settings.factors[k];
                     this.riskCache.set(txnId,rec);
                  }
               }
            }
         }
      }
   },
   user: function(uuid,username) {
      ssp_risk_txn.userCache.set(uuid,username);
      if (debugLevel > 0 ) {console.log("\tRISK.USER = " + uuid + " / " + username );};
   },
   risk: function(uuid,appName,riskReason, riskScore, riskThreshold, risky) {
      var rec = {
         uuid: "",
         source: "SSP",
         userName: "",
         appName: "",
         riskReason: "",
         riskScore: 0,
         riskThreshold: 0,
         risky: ""
      };
      rec.userName = ssp_risk_txn.userCache.get(uuid) || "anonymous" ;
      rec.uuid = uuid || "anonymous" ;
      rec.appName = appName || "anonymous" ;
      rec.riskReason = riskReason;
      rec.riskScore = Number(riskScore);
      rec.riskThreshold = Number(riskThreshold);
      rec.risky = risky;
      ssp_risk_txn.riskCache.set(uuid,rec);
      if (debugLevel > 0 ) {console.log("\tRISK.EVENT = " + rec.uuid + " / " + rec.appName + " / " + rec.riskReason + " / " +  rec.riskScore + " / " +  rec.riskThreshold + " / " + rec.risky );};
   },

   flush: function (){

      var keys = ssp_risk_txn.riskCache.keys();
      for (var keyId in keys) {
         ssp_risk_txn.riskCache.del(keys[keyId]);
      }
   },

   print: function() {

      var str = "";
      var keys = ssp_risk_txn.riskCache.keys();
      for (var keyId in keys) {
         var rec = ssp_risk_txn.riskCache.get(keys[keyId]);
         str += `ssp_risk{appName=\"${rec.appName}\",source=\"${rec.source}\",userId=\"${rec.uuid}\",userName=\"${rec.userName}\",riskReason=\"${rec.riskReason}\",riskThreshold=\"${rec.riskThreshold}\"} ${rec.riskScore}\n`
      }
      if (debugLevel == 11) {console.log("RISK PRINT : " + str);};
      return (str);
   }

}

var ssp_authn_txn = {
   cache: new NodeCache(),
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
         riskScore: 0,
         result: false
      };
      if (simLevel > 1) {
         for (var i = 0; i < settings.clients.length ; i++) {
            for (var j = 0; j < settings.credentials.length ; j++) {
               for (var k = 0; k < settings.factors.length ; k++) {
                  for (var l = 0; l < settings.results.length ; l++) {
                     txnId = "82b5166b-83ba-" + Math.floor(1000 + Math.random() * 9000) + "-99ce-6993e194ce3b";
                     rec.source = "SIM";
                     rec.startTime = Date.now();
                     rec.userId = "SIM" + Math.floor(1 + Math.random() * 5),
                     rec.endTime = rec.startTime + (Math.random() * 10);
                     rec.appName = settings.clients[i];
                     rec.factors[0] = settings.factors[k];
                     rec.primaryCredential = settings.credentials[Math.floor(Math.random() * (settings.credentials.length))];
                     rec.secondaryCredential = settings.credentials[Math.floor(Math.random() * (settings.credentials.length))];
                     rec.riskScore = Math.floor(Math.random() * 90);
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
         if ((Number(rec.endTime) !== 0) && (Number(rec.startTime) !== 0)) {
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

      ssp_risk_response += ssp_risk_txn.print() ; 
      ssp_cred_error_response += ssp_cred_fail_txn.print() ; 

      var keys = this.cache.keys();
      for (var keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         if ((Number(rec.endTime) !== 0) && (Number(rec.startTime) !== 0)) {
            var duration = Number(rec.endTime) - Number(rec.startTime);
            var str1 = `ssp_authn{appName=\"${rec.appName}\",source=\"${rec.source}\",userId=\"${rec.userId}\",credential1=\"${rec.primaryCredential}\",credential2=\"${rec.secondaryCredential}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${duration}\n`
            if (debugLevel == 5) {console.log(str1);};
            ssp_authn_response += str1 ; 
         }
      }
      return (ssp_authn_response + ssp_risk_response  + ssp_cred_error_response);
   },

   start: function(key,timestamp,userId,appName) {
      if (key == undefined) {
         console.log("Undefined txnId provided with authStart message");
      }
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
            riskScore: 0,
            result: false
         };
         rec.startTime = timestamp;
         rec.userId = userId;
         rec.appName = appName;
         ssp_authn_txn.cache.set(key,rec);
         if (debugLevel > 0) {console.log(key, "\t", events.authStart,  " (new)\t", userId, "\t", appName, "\t", timestamp); }
      } else {
         trans.startTime = timestamp;
         trans.userId = userId;
         trans.appName = appName;
         ssp_authn_txn.cache.set(key,trans);
         if (debugLevel > 0) {console.log(key, "\t", events.authStart,  " (existing)\t", userId, "\t", appName, "\t", timestamp); }
      }
   },

   end: function(key,timestamp) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log(key, "\t", events.authEnd, "\t", "Cant find txnId = ", key);
         var rec = {
            source: "SSP",
            userId: "",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            riskScore: 0,
            result: false
         };
         rec.endTime = timestamp;
         ssp_authn_txn.cache.set(key,rec);
      } else {
         if (debugLevel > 0) {console.log(key, "\t", events.authEnd,  "\t", trans.userId, "\t", trans.appName, "\t", timestamp); }
         trans.endTime = timestamp;
         ssp_authn_txn.cache.set(key,trans);
      }
   },

   primaryCredential: function(key,timestamp, credential) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log(key, "\t", events.primaryAuth, "\t Cant find txnId = ", key);
         var rec = {
            source: "SSP",
            userId: "",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            riskScore: 0,
            result: false
         };
         rec.primaryCredential = credential;
         ssp_authn_txn.cache.set(key,rec);
      } else {
         if (debugLevel > 0) {console.log(key, "\t", events.primaryAuth,  "\t", trans.userId, "\t", trans.appName, "\t", credential, "\t", timestamp); }
         trans.primaryCredential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
   },
   secondaryCredential: function(key,timestamp, credential) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log(key, "\t", events.secondaryAuth, "\t Cant find txnId = ", key);
         var rec = {
            source: "SSP",
            userId: "",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            riskScore: 0,
            result: false
         };
         rec.secondaryCredential = credential;
         ssp_authn_txn.cache.set(key,rec);
      } else {
         if (debugLevel > 0) {console.log(key, "\t", events.secondaryAuth,  "\t", trans.userId, "\t", trans.appName, "\t", credential, "\t", timestamp); }
         trans.secondaryCredential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
   },
   result: function(key,timestamp,result) {
      if (key == undefined) {
	 console.log(key, "\t", events.authEnd, "\t txnId undefined = ", key);
      }
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log(key, "\t", events.authEnd, "\t Cant find txnId = ", key);
         var rec = {
            source: "SSP",
            userId: "",
            startTime: 0.0,
            endTime: 0.0,
            appName: "",
            factors: [],
            primaryCredential: "",
            secondaryCredential: "",
            riskScore: 0,
            result: false
         };
         rec.endTime = timestamp;
         rec.result = result;
         ssp_authn_txn.cache.set(key,rec);
      } else {
         if (debugLevel > 0) {console.log(key, "\t", events.authEnd,  "\t", trans.userId, "\t", trans.appName, "\t", result, "\t", timestamp); }
         trans.endTime = timestamp;
         trans.result = result;
         ssp_authn_txn.cache.set(key,trans);
      }
   },
   abandoned: function () {
      var keys = ssp_authn_txn.cache.keys();
      var currentTime = Date.now() / 1000 ;
      for (var keyId in keys) {
         var rec = ssp_authn_txn.cache.get(keys[keyId]);
         if (Number(rec.endTime) == 0) {
            if (Number(rec.startTime) !== 0) {
               if ((currentTime - Number(rec.startTime))  > (maxAuthSessionDuration/1000)) {
                  rec.result = "failure";
                  rec.endTime = currentTime.toString();
                  ssp_authn_txn.cache.set(keys[keyId],rec);
                  if (debugLevel > 0) {console.log(keys[keyId], "\t", "Login Abandoned",  "\t", rec.userId, "\t", rec.appName, "\t", rec.result ); }
               }
            }
         }
      }
   }
}

setInterval(ssp_authn_txn.abandoned, maxAuthSessionTimer);


app.post('/sspLogStream', function(req, res) {
  var result;
  for (var i = 0; i < req.body.length ; i++) {
     var msg = req.body[i].msg;

     result = msg.match(events.authStart);
     if (result != null) { 
        if (req.body[i].txnId == undefined) {
           console.log("ERROR PROCESSING AUTHSTART - " + msg);
           console.log(req.body[i]);
        }
        ssp_authn_txn.start(req.body[i].txnId, req.body[i].date,req.body[i].userLoginId,req.body[i].appName); 
     }
     if (msg.match(events.authEnd)) {
        ssp_authn_txn.result(req.body[i].txnId,req.body[i].date,"success");
        if (req.body[i].sub !== undefined) {
           ssp_risk_txn.user(req.body[i].sub,req.body[i].userUniversalId);
        } else {
           console.log("ERROR PROCESSING AUTHEND - " + msg);
           console.log(req.body[i]);
        }
     }

     result = msg.match(events.factorSuccess);
     var factorType = "";
     var factorRole = "";
     if (result != null) { 
        factorType = req.body[i]["factor-me-auth-complete-ext-factorType"] ;
        if (req.body[i].errorMsg === events.loginFailure) {
           factorRole = "primary";
           ssp_cred_fail_txn.fail(req.body[i].timestamp, req.body[i].appName,req.body[i].userLoginId,factorType,req.body[i].responseCode,factorRole,req.body[i].txnId);
        } else {
           if (req.body[i]["factor-me-auth-complete-ext-factorCount"] == 1) {

              ssp_authn_txn.primaryCredential(req.body[i].txnId,req.body[i].timestamp, factorType); 

           } else {

              ssp_authn_txn.secondaryCredential(req.body[i].txnId,req.body[i].timestamp, factorType); 
           }

           console.log("PROCESSING FACTOR SUCCESS - " + msg);
           //console.log(req.body[i]);
        }
     }

     result = msg.match(events.factorFail);
     var factorType = "";
     var factorRole = "";
     if (result != null) { 
        if (req.body[i].eventId === "factor.me.auth.complete.failure") {
           factorType = req.body[i]["factor-me-auth-complete-ext-factorType"] ;
           factorRole = "secondary";
        } else {
           console.log("ERROR PROCESSING FACTOR FAIL - " + msg);
           console.log(req.body[i]);
        }
       ssp_cred_fail_txn.fail(req.body[i].date, req.body[i].appName,req.body[i].userLoginId,factorType,req.body[i].responseCode,factorRole,req.body[i].txnId);
     }

     result = msg.match(events.iarisk);
     if (result != null) { 
       ssp_risk_txn.risk(req.body[i].userLoginId,req.body[i].appName,req.body[i].riskReason,req.body[i].riskScore,req.body[i].riskThreshold,req.body[i].risky);
     }

     result = msg.match(events.registeredDevice);
     if (result != null) { 
        ssp_device.found(true);
        console.log("found registered device")
     }

     result = msg.match(events.unregisteredDevice);
     if (result != null) { 
        ssp_device.found(false);
        console.log("found unregistered device")
     }

  }

  res.sendStatus(200);
});

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
     ssp_risk_txn.sim();
     ssp_cred_fail_txn.sim();
     if (simLevel < 2) {ssp_authn_txn.flush();}
     var msg = "Simulation set to level - " + simLevel + "\n";
     res.send(msg);
  } else {
     res.send('simlevel parameter required \n')
  }
})

app.get('/metrics', (req, res) => {
  var response = ssp_authn_txn.print();
  response += ssp_device.print();
  if (simLevel > 0) {
     response += ssp_device.sim()
  }
  //response += simData(); 
  if (debugLevel > 1) {console.log(response)};

  ssp_authn_txn.flush();
  ssp_risk_txn.flush();
  ssp_cred_fail_txn.flush();
  ssp_device.flush();

  ssp_authn_txn.sim();
  ssp_risk_txn.sim();
  ssp_cred_fail_txn.sim();

  res.send(response);
})

app.listen(port, () => {
  console.log(`SSP-METRICS-EXPORTER listening at http://0.0.0.0:${port}`)
})

