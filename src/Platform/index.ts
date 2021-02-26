import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
import { setupAppStack } from "./app-stack";
import { create_cert_manager } from "./cert-manager";
import { create_external_dns } from "./ext-dns";
import { create_ingress_nginx } from "./nginx-ing";

create_ingress_nginx()
create_external_dns()
create_cert_manager()

// export const kubeconfig_fabron = 
setupAppStack("fabron");
