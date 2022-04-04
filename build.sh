
helm uninstall -n analytics ssp-analytics
docker build . -t pconnor/ssp-metrics-exporter:latest
docker push  pconnor/ssp-metrics-exporter:latest

