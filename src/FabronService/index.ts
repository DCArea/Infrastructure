import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";


const appLabels = { app: "nginx" };
const namespace_foo = new k8s.core.v1.Namespace("foo");

const deployment = new k8s.apps.v1.Deployment("nginx", {
    metadata: {
        namespace: namespace_foo.metadata.name
    },
    spec: {
        selector: { matchLabels: appLabels },
        replicas: 1,
        template: {
            metadata: { labels: appLabels },
            spec: { containers: [{ name: "nginx", image: "nginx" }] }
        }
    }
});
export const name = deployment.metadata.name;
