import * as k8s from "@pulumi/kubernetes";

export function create_ingress_nginx() {
    const ingress_nginx = new k8s.helm.v3.Chart("ingress-nginx", {
        repo: "ingress-nginx",
        chart: "ingress-nginx",
        namespace: "kube-system",
        values: {
            controller: {
                replicaCount: 1,
                admissionWebhooks: { enabled: false },
                service: { annotations: { "external-dns.alpha.kubernetes.io/hostname": "nginx.doomed.app." } }
            },
        }
    });


    const svc = ingress_nginx.getResource("v1/Service", "kube-system", "ingress-nginx-controller");
    const ip_ingress_nginx_controller = svc.status.loadBalancer.ingress[0].ip;
}