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

export ANALYTICSNAMESPACE=analytics
export SSPRELEASENAME=`kubectl get deployment -A | grep azserver | awk '{ print $2 }' | sed s/-azserver//`
alias install='helm install ssp-analytics ssp-analytics/ssp-analytics -n $ANALYTICSNAMESPACE --set sspReleaseName=$SSPRELEASENAME'
alias uninstall='helm uninstall ssp-analytics -n analytics'
alias status='kubectl get pods,svc,servicemonitor,endpoints -n $ANALYTICSNAMESPACE'
alias build='docker build -t pconnor/ssp-metrics-exporter:latest .'
alias push='docker push pconnor/ssp-metrics-exporter:latest'

export METRICSPOD=`kubectl get pods -n analytics | grep exporter | awk '{ print $1 }'`
alias logs='kubectl logs -f  -n $ANALYTICSNAMESPACE $METRICSPOD' 
alias sim1='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=1'
alias sim2='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=2'
alias sim3='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/sim?simlevel=3'
alias debug1='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=1'
alias debug2='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=2'
alias debug3='kubectl exec -it -n $ANALYTICSNAMESPACE $METRICSPOD -- curl http://0.0.0.0:8080/debug?debuglevel=3'

alias git-a='git add -A'
alias git-c='git commit -m "cleanup"'
alias git-pl='git pull'
alias git-pu='git push -u origin main'
alias git-r='git remote set-url origin https://github.com/paulconnor/ssp-metrics-exporter.git'
