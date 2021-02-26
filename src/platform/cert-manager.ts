import * as k8s from "@pulumi/kubernetes";

export function create_cert_manager() {
    const name_default = "cert-manager";
    const namespace = new k8s.core.v1.Namespace(name_default, { metadata: { name: name_default } })
    const cert_manager = new k8s.helm.v3.Chart(name_default, {
        repo: "jetstack",
        chart: name_default,
        namespace: name_default,
        values: {
            installCRDs: true
        }
    });
}
