import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
import { setupAppStack } from "./app-stack";

export { ip_ingress_nginx_controller } from "./nginx-ing";
export { deployment } from "./ext-dns"

export const kubeconfig_fabron = setupAppStack("fabron");
