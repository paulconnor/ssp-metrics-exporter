#!/bin/bash

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

