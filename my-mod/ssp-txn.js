const NodeCache = require( "node-cache" );
const cache_ttl = 300 // 300 second cache data TTL
const fs = require('fs');
const yaml = require('js-yaml');

function sspTxnRec() {
   this.txn = {
      source: "",
      startTime: 0.0,
      endTime: 0.0,
      appName: "",
      factors: [],
      primaryCredential: "",
      secondaryCredential: "",
      riskScore: 0,
      riskFactor: null,
      result: false
   };
}

function ssp() {
   this.cache = new NodeCache() || null;
   this.rec = new sspTxnRec()  || null;
   try {
      let fileContents = fs.readFileSync('./ssp-sim.yaml', 'utf8');
      this.settings = yaml.load(fileContents);
   } catch (e) {
      console.log(e);
   }
}

ssp.prototype.sim = function () {
      var duration = 0.0;
      var txnId = "";
      var txnRec = new sspTxnRec();

      if (simLevel > 1) {
         for (var i = 0; i < this.settings.clients.length ; i++) {
            for (var j = 0; j < this.settings.credentials.length ; j++) {
               for (var k = 0; k < this.settings.factors.length ; k++) {
                  for (var l = 0; l < this.settings.results.length ; l++) {
                     txnId = "82b5166b-83ba-" + Math.floor(1000 + Math.random() * 9000) + "-99ce-6993e194ce3b";
                     txnRec.source = "SIM";
                     txnRec.startTime = 0.0;
                     txnRec.endTime = txnRec.startTime + (Math.random() * 10);
                     txnRec.appName = this.settings.clients[i];
                     txnRec.factors[0] = this.settings.factors[k];
                     txnRec.primaryCredential = this.settings.credentials[Math.floor(Math.random() * (this.settings.credentials.length - 1))];
                     txnRec.secondaryCredential = this.settings.credentials[Math.floor(Math.random() * (this.settings.credentials.length - 1))];
                     txnRec.riskScore = Math.floor(Math.random() * 90);
                     txnRec.riskFactor = this.settings.factors[k];
                     txnRec.result = this.settings.results[l];
                     this.cache.set(txnId,txnRec);
                  }
               }
            }
         }
      }
}

ssp.prototype.flush = function (){

      var keys = this.cache.keys();
      var keyId = 0;
      for (keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         if (Number(rec.endTime) !== 0) {
            this.cache.del(keys[keyId]);
         }
      }
}

ssp.prototype.print = function (){
      var ssp_authn_response = "# HELP ssp_authn: Authentication request tagged with details of the request. The metric itself is the duration of authentication process. \n";
      ssp_authn_response = ssp_authn_response + "# TYPE ssp_authn gauge\n" ;
      var ssp_risk_response = "# HELP ssp_risk: Risk score for the authn transaction and primary risk factor. \n";
      ssp_risk_response = ssp_risk_response + "# TYPE ssp_risk gauge\n" ;

      var keys = this.cache.keys();
      for (var keyId in keys) {
         var rec = this.cache.get(keys[keyId]);
         if (Number(rec.endTime) !== 0) {
            var duration = Number(rec.endTime) - Number(rec.startTime);
            var str1 = `ssp_authn{client=\"${rec.appName}\",credential1=\"${rec.primaryCredential}\",credential2=\"${rec.secondaryCredential}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${duration}\n`
            ssp_authn_response += str1 ; 
            var str2 = `ssp_risk{client=\"${rec.appName}\",credential1=\"${rec.primaryCredential}\",credential2=\"${rec.secondaryCredential}\",factor=\"${rec.riskFactor}\",result=\"${rec.result}\",txnId=\"${keys[keyId]}\"} ${rec.riskScore}\n`
            ssp_risk_response += str2 ; 
         }
      }
      return (ssp_authn_response + ssp_risk_response);
}

ssp.prototype.start = function(key,timestamp) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
         var txnRec = new sspTxnRec();
         // Not found, so start of a new transaction.
         txnRec.startTime = timestamp;
         txnRec.source = "SIM";
         txnRec.endTime = 0.0;
         txnRec.riskScore = 0;
         txnRec.result = "";
         txnRec.credential1 = "";
         txnRec.credential2 = "";
         txnRec.appName = "";
         txnRec.factor = "";

         ssp_authn_txn.cache.set(key,txnRec);
         console.log("authStart - ", key, " - ", timestamp); 
      } else {
         console.log("authStart - Duplicate key : ",key);
      }
}

ssp.prototype.end = function(key,timestamp) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("END Cant find txnId = ", key);
      } else {
         trans.endTime = timestamp;
         ssp_authn_txn.cache.set(key,trans);
      }
      console.log("authEnd - ", key, " - ", timestamp); 
}

ssp.prototype.riskScore = function(key,timestamp,appName,factor,score) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("RISKSCORE Cant find txnId = ", key);
      } else {
         trans.appName = appName;
         trans.riskScore = score;
         trans.riskFactor = factor;
         ssp_authn_txn.cache.set(key,trans);
      }
      console.log("Risk Score - ", key, " - ", timestamp, " - ", appName, " - ", factor , " - ", score);
}

ssp.prototype.riskFactor = function(key,timestamp, appName, factor,score) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("RISKFACTOR Cant find txnId = ", key);
      } else {
         //var obj = { "factor": factor, "score": score };
         //trans.factors[0] = { "factor": factor, "score": score };
         trans.factors.push({ "factor": factor, "score": score });
         ssp_authn_txn.cache.set(key,trans);
      }
      console.log("Risk Factor - ", key, " - ", timestamp, " - ", appName, " - ", factor, " - ", score); 
}

ssp.prototype.primaryCredential = function(key,timestamp, credential) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("PRIMARY CRED Cant find txnId = ", key);
      } else {
         trans.primaryCredential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
}

ssp.prototype.secondaryCredential = function(key,timestamp, credential) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("SECONDARY CRED Cant find txnId = ", key);
      } else {
         trans.secondaryCredential = credential;
         ssp_authn_txn.cache.set(key,trans);
      }
}

ssp.prototype.result =  function(key,timestamp,result) {
      var trans = ssp_authn_txn.cache.get(key);
      if (trans == undefined) {
	 console.log("RESULT Cant find txnId = ", key);
      } else {
         trans.endTime = timestamp;
         trans.result = result;
         ssp_authn_txn.cache.set(key,trans);
      }
      if (!result) {console.log("Failure - ", key, " - ", timestamp);}
      if (result) {console.log("success - ", key, " - ", timestamp);}
}

