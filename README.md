## Atharva Mhaske

Backend and cloud native engineer from Pune, India. I build LLM serving infrastructure on Kubernetes, Go observability tooling, and secrets tooling for Docker Swarm.

Google Summer of Code 2026 at [Open Science Labs](https://github.com/opensciencelabs) ([sugar-org](https://github.com/sugar-org)). Speaker at KubeCon India.

[Website](https://atharvamhaske.vercel.app) · [X](https://x.com/AtharvaXDevs) · [All repositories](https://github.com/atharvamhaske?tab=repositories) · [All merged contributions](https://github.com/search?q=author%3Aatharvamhaske+is%3Apr+is%3Amerged+is%3Apublic+-user%3Aatharvamhaske&type=pullrequests)

![Go](https://img.shields.io/badge/Go-00ADD8?logo=go&logoColor=white) ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white) ![Helm](https://img.shields.io/badge/Helm-0F1689?logo=helm&logoColor=white) ![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-000000?logo=opentelemetry&logoColor=white) ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?logo=prometheus&logoColor=white) ![Grafana](https://img.shields.io/badge/Grafana-F46800?logo=grafana&logoColor=white) ![Envoy](https://img.shields.io/badge/Envoy-AC6199?logo=envoyproxy&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

### Open source contributions

| Project | Merged PRs | What I work on |
|---|---|---|
| [openeverest/provider-kserve](https://github.com/openeverest/provider-kserve/pulls?q=is%3Apr+author%3Aatharvamhaske+is%3Amerged) | 18 | KServe provider for OpenEverest. LLM autoscaling (WVA, HPA, KEDA), multi-node head/worker, LoRA adapter catalog, Envoy AI Gateway access and API-key auth, vLLM and gen_ai metrics, Grafana dashboards, e2e CI |
| [braintrustdata/braintrust-sdk-go](https://github.com/braintrustdata/braintrust-sdk-go/pulls?q=is%3Apr+author%3Aatharvamhaske+is%3Amerged) | 17 | A2A tracing, OpenAI Responses and streaming fidelity (logprobs, refusals, citations, cache keys), Anthropic extended thinking and server tool use |
| [sugar-org/swarm-external-secrets](https://github.com/sugar-org/swarm-external-secrets/pulls?q=is%3Apr+author%3Aatharvamhaske+is%3Amerged) | 11 | AWS KMS transforms, Vault and OpenBao shared backend with JWT, plugin logging, GoReleaser, Kumo emulator tests |
| [open-telemetry/opentelemetry-go-compile-instrumentation](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/pulls?q=is%3Apr+author%3Aatharvamhaske+is%3Amerged) | 10 | Instrumentation for AMQP, Elastic, zap log correlation, Anthropic count_tokens, OpenAI streaming errors, go-redis, govulncheck in CI, contrib migration ADR |
| [openeverest](https://github.com/openeverest) (core, provider-kubeai, provider-sdk, provider-mariadb, provider-percona-server-mongodb, website) | 9 | Helm telemetry wiring, metrics port bind fixes across providers, build scripts, blog on running databases on Kubernetes locally |
| [flexprice/flexprice-front](https://github.com/flexprice/flexprice-front/pulls?q=is%3Apr+author%3Aatharvamhaske+is%3Amerged) | 4 | API key deletion dialog, catalog and onboarding fixes |
| [open-telemetry/opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io/pull/10965) | 1 | Go compile time instrumentation docs |
| [dodopayments/billingsdk](https://github.com/dodopayments/billingsdk/pull/192) | 1 | Hono support |

### In review

- [kserve/kserve#6041](https://github.com/kserve/kserve/pull/6041) named ClusterStorageContainers for LLMInferenceService
- [maximhq/bifrost](https://github.com/maximhq/bifrost/pulls?q=is%3Apr+author%3Aatharvamhaske) Bedrock and Anthropic fixes, MCP log metadata
- Braintrust tracing for Cloudflare Workers AI, Pinecone, Together AI, Weaviate
- OpenTelemetry route enrichment for echo and gorilla/mux
