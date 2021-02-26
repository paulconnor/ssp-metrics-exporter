#!/bin/bash

#if [ ! -z "${DOMAIN}" ] ; then helm install prometheus-operator -n monitoring prometheus-community/kube-prometheus-stack --version="10.1.1" --set nameOverride="prometheus-operator" --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.accessModes[0]=ReadWriteOnce --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=20Gi --set alertmanager.ingress.enabled=true --set "alertmanager.ingress.annotations.kubernetes\.io/ingress\.class"=nginx --set alertmanager.ingress.tls[0].secretName=monitoring-general-tls --set alertmanager.ingress.hosts[0]=alertmanager.${DOMAIN} --set alertmanager.ingress.tls[0].hosts[0]=alertmanager.${DOMAIN} --set grafana.ingress.enabled=true --set "grafana.ingress.annotations.kubernetes\.io/ingress\.class"=nginx --set grafana.ingress.tls[0].secretName=monitoring-general-tls --set grafana.ingress.hosts[0]=grafana.${DOMAIN} --set grafana.ingress.tls[0].hosts[0]=grafana.${DOMAIN} --set grafana.plugins=grafana-piechart-panel ; else echo "***** ERROR: DOMAIN environment variable is not set *****" ; fi

kubectl edit configmap -n monitoring prometheus-operator-grafana

# Add the following to data.grafana.ini
#    [auth.anonymous]
#    enabled = true
#    org_name = Main Org.
#    org_role = Viewer

kubectl scale deployment prometheus-operator-grafana -n monitoring --replicas=0
kubectl get pods -n monitoring
kubectl scale deployment prometheus-operator-grafana -n monitoring --replicas=1
kubectl get pods -n monitoring

