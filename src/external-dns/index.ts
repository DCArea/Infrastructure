import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
import * as fs from 'fs';
const config = new pulumi.Config();

function create_external_dns() {
    const name_default = "external-dns";
    const namespace = new k8s.core.v1.Namespace(name_default, { metadata: { name: name_default } });
    const azurejson = config.requireSecret("azurejson");

    const secret = new kx.Secret("azure-config-file", {
        metadata: {
            namespace: name_default
        },
        type: "Opaque",
        stringData: {
            "azure.json": azurejson
        },
    });

    const sa = new k8s.core.v1.ServiceAccount(name_default, {
        metadata: { name: name_default, namespace: name_default }
    });
    const cr = new k8s.rbac.v1.ClusterRole(name_default, {
        metadata: { name: name_default },
        rules: [
            {
                apiGroups: [""],
                resources: ["services", "endpoints", "pods"],
                verbs: ["get", "watch", "list"]
            },
            {
                apiGroups: ["extensions", "networking.k8s.io"],
                resources: ["ingresses"],
                verbs: ["get", "watch", "list"]
            },
            {
                apiGroups: [""],
                resources: ["nodes"],
                verbs: ["list"]
            }
        ]
    })
    const crb = new k8s.rbac.v1.ClusterRoleBinding(`${name_default}-viewer`, {
        metadata: { name: `${name_default}-viewer` },
        roleRef: {
            apiGroup: "rbac.authorization.k8s.io",
            kind: "ClusterRole",
            name: name_default,
        },
        subjects: [
            {
                kind: "ServiceAccount",
                name: name_default,
                namespace: name_default
            }
        ]
    });

    const pb = new kx.PodBuilder({
        serviceAccountName: name_default,
        containers: [{
            name: name_default,
            image: "k8s.gcr.io/external-dns/external-dns:v0.7.3",
            args: [
                "--source=service",
                "--source=ingress",
                "--provider=azure",
                "--azure-resource-group=surac"
            ],
            volumeMounts: [
                secret.mount("/etc/kubernetes",)
            ]
        }],
    });
    const deployment = new kx.Deployment(name_default, {
        metadata: {
            namespace: name_default
        },

        spec: pb.asDeploymentSpec({
            strategy: { type: "Recreate" },
        })
    });
}

create_external_dns()