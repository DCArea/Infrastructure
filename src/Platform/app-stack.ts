import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
const config = new pulumi.Config();

export function setupAppStack(name: string) {
    const namespace = new k8s.core.v1.Namespace(name, { metadata: { name: name } });
    const serviceAccount = createNamespaceAdminServiceAccount(name);
    return getKubeconfigOutput(serviceAccount, name);
}

function getKubeconfigOutput(sa: k8s.core.v1.ServiceAccount, ns: string): pulumi.Output<string> {
    const sa_secret = sa.secrets[0];
    const server_url = config.require("kubernetes_server_url");
    return sa_secret.apply(v => k8s.core.v1.Secret.get(v.name, `${ns}/${v.name}`).data)
        .apply(v => _getKubeconfig(server_url, v["ca.crt"], Buffer.from(v["token"], "base64").toString()));
}

function _getKubeconfig(server_url: string, crt_data: string, token: string): string {
    const kubeconfig_content = `
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${crt_data}
    server: ${server_url}
  name: default-cluster
contexts:
- context:
    cluster: default-cluster
    user: default-user
  name: default-context
current-context: default-context
kind: Config
preferences: {}
users:
- name: default-user
  user:
    token: ${token}
`;
    return kubeconfig_content;
}

function createNamespaceAdminServiceAccount(name: string) {
    const sa = new k8s.core.v1.ServiceAccount(`${name}-admin`, {
        metadata: { name: `${name}-admin`, namespace: name }
    });
    const crb = new k8s.rbac.v1.RoleBinding(`${name}-admin`, {
        metadata: { name: `${name}-admin`, namespace: name },
        roleRef: {
            apiGroup: "rbac.authorization.k8s.io",
            kind: "ClusterRole",
            name: "admin",
        },
        subjects: [
            {
                kind: "ServiceAccount",
                name: sa.metadata.name,
                namespace: name
            }
        ]
    });
    return sa;
}
