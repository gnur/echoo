# echoo

echoo shows which backend pods answer your requests, live in the browser.

The page polls `/api` on a fixed interval. Each backend process replies with a
random name (for example `stellar_rio`) and its hostname. Every backend gets a
tile with its request count, share of traffic, first and last answer, and a
live or stale status.

## What it's for

- **Kubernetes rolling updates.** Start a rollout and watch new pods appear,
  old pods go stale, and traffic move across. Failed requests get their own
  tile, so you can see right away if a rollout drops traffic.
- **Load balancing.** See how evenly a Service, Ingress or Gateway spreads
  requests across replicas, and what changes when you turn on session
  affinity.
- **Cross-region connectivity demos.** Run echoo in several clusters or regions
  behind a global load balancer or multi-cluster service mesh. The hostname
  on each tile shows which region served the request. Take a region down and
  watch the failover.

A pod counts as stale when it hasn't answered for five polling rounds (at
least 5 seconds). That is usually a pod that was terminated or removed from the
endpoints.

## Run it

Images for `linux/amd64` and `linux/arm64` are published to GHCR:

```bash
docker run --rm -p 3000:3000 ghcr.io/gnur/echoo:latest
```

On Kubernetes:

```bash
kubectl create deployment echoo --image=ghcr.io/gnur/echoo:latest --replicas=3 --port=3000
kubectl expose deployment echoo --port=80 --target-port=3000
kubectl port-forward service/echoo 8080:80
```

Open http://localhost:8080, then trigger a rollout in another terminal:

```bash
kubectl rollout restart deployment/echoo
```

`kubectl port-forward` to a Service pins the connection to one pod. To see
balancing across pods, put echoo behind an Ingress, Gateway or `LoadBalancer`
Service.

### Endpoints

| Path       | Returns                                              |
| ---------- | ---------------------------------------------------- |
| `/`        | The dashboard                                        |
| `/api`     | `{ name, hostname, boot, timestamp }` for this process |
| `/healthz` | `{ "status": "ok" }`, for liveness and readiness probes |

## Development

Requires [bun](https://bun.sh).

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build in .output/
bun run preview  # serve the production build
```

The UI follows the [design guidelines](https://dekeijzer.xyz/style-guide.md);
all values come from `app/assets/css/design-tokens.css`.

## Releases

Every push to `main` builds the multi-arch image and creates a GitHub release.
Releases are numbered `v<N>`, one higher than the latest `v*` tag (`v6.1` →
`v7` → `v8`). Each image is tagged with the release number, `latest` and the
commit SHA. Pull requests build the image without pushing it.
