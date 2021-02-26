import * as k8s from "@pulumi/kubernetes";
import * as crds from "./crds"

function create_cert_manager() {
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

function create_cluster_issuer() {
    var ci = new crds.certmanager.v1.ClusterIssuer("letsencrypt", {
        metadata: { name: "letsencrypt" },
        spec: {
            acme: {
                server: "https://acme-v02.api.letsencrypt.org/directory",
                email: "suraciii@outlook.com",
                privateKeySecretRef: { name: "letsencrypt" },
                solvers: [
                    {
                        http01: {
                            ingress: {
                                class: "nginx"
                            }
                        }
                    }
                ]
            }
        }
    })
}

create_cert_manager();
create_cluster_issuer();