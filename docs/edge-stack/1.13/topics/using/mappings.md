# Advanced Mapping configuration

Ambassador Edge Stack is designed so that the author of a given Kubernetes service can easily and flexibly configure how traffic gets routed to the service. The core abstraction used to support service authors is a mapping, which maps a target backend service to a given host or prefix. For Layer 7 protocols such as HTTP, gRPC, or WebSockets, the `Mapping` resource is used. For TCP, the `TCPMapping` resource is used.

Ambassador Edge Stack _must_ have one or more mappings defined to provide access to any services at all. The name of the mapping must be unique.

## System-wide defaults for Mappings

Certain aspects of mappings can be set system-wide using the `defaults` element of the `ambassador Module`:
see [using defaults](../../using/defaults) for more information. The `Mapping` element will look first in
the `httpmapping` default class.

## Mapping evaluation order

Ambassador Edge Stack sorts mappings such that those that are more highly constrained are evaluated before those less highly constrained. The prefix length, the request method, constraint headers, and query parameters are all taken into account.

If absolutely necessary, you can manually set a `precedence` on the mapping (see below). In general, you should not need to use this feature unless you're using the `regex_headers` or `host_regex` matching features. If there's any question about how Ambassador Edge Stack is ordering rules, the diagnostic service is a good first place to look: the order in which mappings appear in the diagnostic service is the order in which they are evaluated.

## Optional fallback Mapping

Ambassador Edge Stack will respond with a `404 Not Found` to any request for which no mapping exists. If desired, you can define a fallback "catch-all" mapping so all unmatched requests will be sent to an upstream service.

For example, defining a mapping with only a `/` prefix will catch all requests previously unhandled and forward them to an external service:

```yaml
---
apiVersion: getambassador.io/v2
kind:  Mapping
metadata:
  name:  catch-all
spec:
  prefix: /
  service: https://www.getambassador.io
```

### Using `precedence`

Ambassador Edge Stack sorts mappings such that those that are more highly constrained are evaluated before those less highly constrained. The prefix length, the request method, and the constraint headers are all taken into account. These mechanisms, however, may not be sufficient to guarantee the correct ordering when regular expressions or highly complex constraints are in play.

For those situations, a `Mapping` can explicitly specify the `precedence`. A `Mapping` with no `precedence` is assumed to have a `precedence` of 0; the higher the `precedence` value, the earlier the `Mapping` is attempted.

If multiple `Mapping`s have the same `precedence`, Ambassador Edge Stack's normal sorting determines the ordering within the `precedence`; however, there is no way that Ambassador Edge Stack can ever sort a `Mapping` with a lower `precedence` ahead of one at a higher `precedence`.

### Using `tls`

In most cases, you won't need the `tls` attribute: just use a `service` with an `https://` prefix. However, note that if the `tls` attribute is present and `true`, Ambassador Edge Stack will originate TLS even if the `service` does not have the `https://` prefix.

If `tls` is present with a value that is not `true`, the value is assumed to be the name of a defined TLS context, which will determine the certificate presented to the upstream service. TLS context handling is a beta feature of Ambassador Edge Stack at present; please [contact us on Slack](https://a8r.io/Slack) if you need to specify TLS origination certificates.

### Using `cluster_tag`

If the `cluster_tag` attribute is present, its value will be prepended to cluster names generated from
the `Mapping`. This provides a simple mechanism for customizing the `cluster` name when working with metrics.

## Namespaces and Mappings

If `AMBASSADOR_NAMESPACE` is correctly set, Ambassador Edge Stack can map to services in other namespaces by taking advantage of Kubernetes DNS:

- `service: servicename` will route to a service in the same namespace as the Ambassador Edge Stack, and
- `service: servicename.namespace` will route to a service in a different namespace.

### Linkerd interoperability (`add_linkerd_headers`)

When using Linkerd, requests going to an upstream service need to include the `l5d-dst-override` header to ensure that Linkerd will route them correctly. Setting `add_linkerd_headers` does this automatically, based on the `service` attribute in the `Mapping`. 

If `add_linkerd_headers` is not specified for a given `Mapping`, the default is taken from the `ambassador`[Module](../../running/ambassador). The overall default is `false`: you must explicitly enable `add_linkerd_headers` for Ambassador Edge Stack to add the header for you (although you can always add it yourself with `add_request_headers`, of course).

### "Upgrading" to non-HTTP protocols (`allow_upgrade`)

HTTP has [a mechanism][upgrade-mechanism] where the client can say
`Connection: upgrade` / `Upgrade: PROTOCOL` to switch ("upgrade") from
the current HTTP version to a different one, or even a different
protocol entirely.  Ambassador itself understands and can handle the
different HTTP versions, but for other protocols you need to tell
Ambassador to get out of the way, and let the client speak that
protocol directly with your upstream service.  You can do this by
setting the `allow_upgrade` field to a case-insensitive list of
protocol names Ambassador will allow switching to from HTTP.  After
the upgrade, Ambassador does not interpret the traffic, and behaves
similarly to how it does for TCPMappings.

[upgrade-mechanism]: https://tools.ietf.org/html/rfc7230#section-6.7

This "upgrade" mechanism is a useful way of adding HTTP-based
authentication and access control to another protocol that might not
support authentication; for this reason the designers of the WebSocket
protocol made this "upgrade" mechanism the *only* way of initiating a
WebSocket connection.  In a Mapping for an upstream service that
supports WebSockets, you would write

```yaml
allow_upgrade:
- websocket
```

The Kubernetes apiserver itself uses this "upgrade" mechanism to
perform HTTP authentication before switching to SPDY for endpoint used
by `kubectl exec`; if you wanted to use Ambassador to expose the
Kubernetes apiserver such that `kubectl exec` functions, you would
write

```yaml
---
apiVersion: getambassador.io/v2
kind: Mapping
metadata:
  name: apiserver
spec:
  service: https://kubernetes.default
  prefix: /
  allow_upgrade:
  - spdy/3.1
```

There is a deprecated setting `use_websocket`; setting `use_websocket:
true` is equivalent to setting `allow_upgrade: ["websocket"]`.
