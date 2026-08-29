# Performance And Scalability Rules

## Target performance outcomes

- Public initial render target: ~<2s on reasonable mobile connection.
- API P95 target: <500ms under expected load.
- Geo query contribution target: P95 <250-300ms where infra allows.
- Typical admin interactions: <1s perceived response where safe.

## Query efficiency rules

- Optimize hottest path: nearby active points within radius.
- Spatial constraints first, then filters/sort/limit.
- Return compact map payload for nearby endpoint.
- Use spatial index on geography column.

## Request discipline

- Debounce search input.
- Do not fetch on every map pixel movement.
- Trigger nearby fetch on explicit or significant user intent.

## Bundle/perf rules

- Dynamic import heavy modules (map/charts/editors) where practical.
- Load charting only in dashboard routes.
- Keep public home payload lean.

## Scalability posture

- Design for 10,000+ aid points and traffic spikes.
- Assume first bottleneck is shared DB resources.
- Keep DB replacement path straightforward.

## Caching posture

- Cache infrequently changing dictionaries/config/taxonomies.
- Keep operational aid-point data freshness-aware with short-lived or targeted cache strategy.
- No Redis by default in v1 unless measured need appears.
