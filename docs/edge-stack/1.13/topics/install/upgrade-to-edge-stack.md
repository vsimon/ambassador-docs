# Upgrade to the Ambassador Edge Stack

If you currently have the open source API Gateway version of Ambassador, you can upgrade to the Ambassador Edge Stack with a few simple commands. When you upgrade to the Ambassador Edge Stack, you'll be able to access additional capabilities such as **automatic HTTPS/TLS termination, Swagger/OpenAPI support, API catalog, Single Sign-On, the Edge Policy Console UI, and more.** For more about the differences between Edge Stack and the API Gateway, see the [Editions page](/editions).

## Upgrading on supported Kubernetes environments

`edgectl` can automate the upgrade from installations that match the following criteria:

* the Ambassador API Gateway has been installed (and is still managed by) the
  [Ambassador Operator](../../install/aes-operator/).
* the `AmbassadorInstallation` has:
  * the `ambassador` name and `ambassador` namespace
  * `installOSS: true`

First, install `edgectl` by following the instructions
[here](../../using/edgectl/edge-control/#installing-edge-control).

Then, use the following command to upgrade the Ambassador API Gateway installation to Ambassador Edge Stack:

```
edgectl upgrade
```

## Upgrading from other installations

**Prerequisites**:

* You must have properly installed Ambassador previously following [these](../install-ambassador-oss) instructions.
* You must have TLS configured and working properly on your Ambassador instance

**To upgrade your instance of Ambassador**:

1. [Apply the migration manifest](#1-apply-the-migration-manifest)
2. [Test the new Deployment](#2-test-the-new-deployment)
3. [Redirect traffic](#3-redirect-traffic)
4. [Delete the old Deployment](#4-delete-the-old-deployment)
5. [Update and restart](#5-update-and-restart)
6. [Access the Edge Policy Console](#6-access-the-edge-policy-console)
7. [What's next?](#6-whats-next)

## Before you begin

Make sure that you follow the steps in the given order - not doing that might crash your Ambassador installation or make it inconsistent.

Check if you have an [`AuthService`](../../running/services/auth-service) or 
[`RateLimitService`](../../running/services/rate-limit-service) installed. If 
you do, make sure that they are using the [namespace-qualified DNS name](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/#namespaces-of-services).
If they are not, the initial migration tests may fail.

## 1. Apply the migration manifest

First, install the Ambassador Edge Stack alongside your existing Ambassador installation so you can test your workload against the new deployment.

Note: Make sure you apply the manifests in the same namespace as your current Ambassador installation.

Use the following command to install the Ambassador Edge Stack, replacing `<namespace>` appropriately:

```
kubectl apply -n <namespace> -f https://www.getambassador.io/yaml/oss-migration.yaml
```

## 2. Test the new Deployment

At this point, you have the Ambassador API Gateway and the Ambassador Edge Stack running side by side in your cluster. The Edge Stack is configured using the same configuration (Mappings, Modules, etc) as your current Ambassador.

Get the IP address to connect to the Ambassador Edge Stack by running the following command:
`kubectl get service test-aes -n <namespace>`

Test that AES is working properly.

## 3. Redirect traffic

Once you’re satisfied with the new deployment, update your current Ambassador service to redirect traffic to the Ambassador Edge Stack.

Edit the current Ambassador service with `kubectl edit service -n <namespace> ambassador` and change the selector to `product: aes`.

## 4. Delete the old Deployment

You can now safely delete the older Ambassador deployment and AES service.

```
kubectl delete deployment -n <namespace> ambassador
kubectl delete service -n <namespace> test-aes
```

## 5. Update and restart

Apply the new CRDs, resources and restart the Ambassador Edge Stack pod for changes to take effect:

```
kubectl apply -n <namespace> -f https://www.getambassador.io/yaml/aes-crds.yaml && \
kubectl apply -n <namespace> -f https://www.getambassador.io/yaml/resources-migration.yaml && \
kubectl rollout restart deployment/aes
```

## 6. Access the Edge Policy Console

You can now access the Edge Policy Console with the following options:
* `edgectl login -n <namespace> <AES_host>` or
* `https://{{AES_URL}}/edge_stack/admin`

## 7. What's next?

Now that you have the Ambassador Edge Stack up and running, check out the [Getting Started](../../../tutorials/getting-started) guide for recommendations on what to do next and take full advantage of its features.
