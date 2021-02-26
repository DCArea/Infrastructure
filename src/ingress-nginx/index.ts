import * as k8s from "@pulumi/kubernetes";

const name = "ingress-nginx";
function create_ingress_nginx() {
    const namespace = new k8s.core.v1.Namespace(name, { metadata: { name: name } })
    const ingress_nginx = new k8s.helm.v3.Chart(name, {
        repo: name,
        chart: name,
        namespace: name,
        values: {
            controller: {
                replicaCount: 1,
                admissionWebhooks: { enabled: false },
                service: { annotations: { "external-dns.alpha.kubernetes.io/hostname": "nginx.doomed.app." } }
            },
        }
    });

    const svc = ingress_nginx.getResource("v1/Service", name, "ingress-nginx-controller");
    const ip_ingress_nginx_controller = svc.status.loadBalancer.ingress[0].ip;
    return ip_ingress_nginx_controller;
}

export const ip = create_ingress_nginx();
