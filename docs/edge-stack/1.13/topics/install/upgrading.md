# Upgrading Ambassador Edge Stack

Since Ambassador Edge Stack's configuration is entirely stored in Kubernetes resources, no special process
is necessary to upgrade Ambassador Edge Stack.

The steps to upgrade depend on the method that was used to install Ambassador Edge Stack, as indicated below.

## Installed via the Operator?

If you installed using the Operator, then you'll need to [use the Operator to perform the upgrade](../aes-operator/#updates-by-the-operator).
To verify whether the Operator was used to install Ambassador Edge Stack, run the following command
to see if it returns resources:
```
$ kubectl get deployment -n ambassador -l 'app.kubernetes.io/name=ambassador,app.kubernetes.io/managed-by in (amb-oper,amb-oper-manifest,amb-oper-helm,amb-oper-azure)' 
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
ambassador         1/1     1            1           ...
```

## Installed via Helm?

If you installed using the Helm chart or `edgectl install`, then you should
[upgrade with the help of Helm](../helm/#upgrading-an-existing-ambassador-edge-stack-installation).
To verify this, run the following command to see if it returns resources:
```
$ kubectl get deployment -n ambassador -l 'app.kubernetes.io/name=ambassador'
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
ambassador         1/1     1            1           ...
```

## Installed via YAML manifests?

Finally, if you installed using YAML manifests, simply run the commands in the following section. To verify whether manifests were used to install Ambassador Edge Stack, run the following command to see if it returns resources:
```
$ kubectl get deployment -n ambassador -l 'product=aes'
NAME               READY   UP-TO-DATE   AVAILABLE   AGE
ambassador         1/1     1            1           ...
```

If none of the commands above return resources, you probably have an old installation and you should follow
the instructions for [upgrading to Ambassador Edge Stack](../upgrade-to-edge-stack/).

### Upgrading an installation with YAML manifests

If you previously installed Edge Stack using YAML manifests, you can upgrade with
these commands:

```
kubectl apply -f https://www.getambassador.io/yaml/aes-crds.yaml
kubectl apply -f https://www.getambassador.io/yaml/aes.yaml
```

This will trigger a rolling upgrade of Ambassador Edge Stack.

If you're using your own YAML, check our YAML to be sure of other changes.  At a minimum
you'll need to change the pulled `image` for the Ambassador Edge Stack container and redeploy.

### Set Up Service Catalog

Upgrading to version 1.12 or higher adds support for Service Catalog. [Set up Service Catalog](../../../tutorials/getting-started/#3-connect-your-cluster-to-ambassador-cloud) to view all of your service metadata in Ambassador Cloud.