# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

# User specific aliases and functions
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.272.b10-1.el7_9.x86_64/jre
export DOCKERFILE_HOME=/home/centos/siddhi-docker/docker-siddhi/docker-files/siddhi-runner/alpine

export DOMAIN=iamdemo.broadcom.com
export RELEASENAME=poc
export NAMESPACE=demo
export PREFIX=ssppoc
export CERTFILE=$HOME/certs/iamdemo.cer
export KEYFILE=$HOME/certs/iamdemo.key

export ANALYTICSNAMESPACE=analytics
export SSPRELEASENAME=`kubectl get deployment -A | grep azserver | awk '{ print $2 }' | sed s/-azserver//`
alias install='helm install ssp-analytics ssp-analytics/ssp-analytics -n $ANALYTICSNAMESPACE --set sspReleaseName=$SSPRELEASENAME'
alias uninstall='helm uninstall ssp-analytics -n analytics'
alias status='kubectl get pods,svc,servicemonitor,endpoints -n $ANALYTICSNAMESPACE'
alias build='docker build -t pconnor/ssp-metrics-exporter:latest .'
alias push='docker push pconnor/ssp-metrics-exporter:latest'
alias env="export METRICSPOD=`kubectl get pods -n analytics | grep exporter | awk '{ print $1 }'`"
alias make="uninstall; build ; push ; install; env; sleep 5; export METRICSPOD=`kubectl get pods -n analytics | grep exporter | awk '{ print $1 }'`"

export METRICSPOD=`kubectl get pods -n analytics | grep exporter | awk '{ print $1 }'`
alias logs='kubectl logs -f  -n $ANALYTICSNAMESPACE $METRICSPOD' 
alias sim0='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=0'
alias sim1='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=1'
alias sim2='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=2'
alias sim3='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=3'
alias debug0='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=0'
alias debug1='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=1'
alias debug2='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=2'
alias debug3='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=3'

alias git-a='git add -A'
alias git-c='git commit -m "cleanup"'
alias git-pl='git pull'
alias git-pu='git push -u origin main'
alias git-r='git remote set-url origin https://github.com/paulconnor/ssp-metrics-exporter.git'

alias load-data="helm  install ssp-data -n ${NAMESPACE}  ssp_helm_charts/ssp-data --version=1.0.1012 --set ssp.global.ssp.registry.credentials.username="authhub-install@ca" --set ssp.global.ssp.registry.credentials.password="346a437f8b869a8089a6c8766593fe8a99f1f4db" --set ssp.db.internalEnabled=false --set ssp.db.serviceHost=${SSPRELEASENAME}-db-pxc.demo.svc --set ssp.db.existingSecret=${SSPRELEASENAME}-db-pxc"
