import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
import { getKubeconfig, setupAppStack } from "./app-stack";

const sa = setupAppStack("fabron");
export const kubeconfig_fabron = getKubeconfig(sa, "fabron");
