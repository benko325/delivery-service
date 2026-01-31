# ADR-013: Monitoring and Observability with Pino, Prometheus, and Grafana

## Status
**Accepted** - 2025-01-31

## Context

A production-ready application requires comprehensive monitoring and observability to:
- Debug issues in production with structured, searchable logs
- Track application health and performance metrics
- Visualize business and technical KPIs
- Set up alerts for critical thresholds
- Correlate requests across the distributed system

### Requirements
- Structured logging with correlation IDs for request tracing
- Sensitive data redaction (passwords, tokens)
- Custom business metrics (orders, revenue, authentication)
- HTTP request latency tracking
- Error rate monitoring
- Dashboard visualization for operations team

### Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **Console.log** | Simple, no setup | Unstructured, no filtering, no levels |
| **Winston** | Popular, flexible | Heavier, more configuration |
| **Pino** | Fast, structured JSON, NestJS integration | Less familiar than Winston |
| **Prometheus + Grafana** | Industry standard, powerful | Additional infrastructure |
| **DataDog/New Relic** | All-in-one solution | Expensive, vendor lock-in |

## Decision

We will use **Pino** for structured logging and **Prometheus + Grafana** for metrics and visualization.

### Logging with Pino

**Configuration (app.module.ts):**
```typescript
LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    // Correlation ID generation
    genReqId: (req) =>
      req.headers["x-request-id"] ||
      `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    customProps: () => ({
      service: "delivery-service",
    }),
    // Sensitive data redaction
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.body.password",
        "req.body.refreshToken",
      ],
      censor: "[REDACTED]",
    },
  },
}),
```

**Key Features:**
- **Structured JSON logs** in production for log aggregation tools
- **Pretty printing** in development for readability
- **Correlation IDs** via `x-request-id` header or auto-generated
- **Automatic redaction** of sensitive fields
- **Service context** added to all log entries

### Metrics with Prometheus

**Custom Metric Providers (metrics.providers.ts):**
```typescript
// HTTP Request Duration
export const httpRequestDurationProvider = makeHistogramProvider({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

// Business Metrics
export const ordersCreatedCounterProvider = makeCounterProvider({
  name: "orders_created_total",
  help: "Total number of orders created",
  labelNames: ["status"],
});

export const revenueCounterProvider = makeCounterProvider({
  name: "revenue_total",
  help: "Total revenue from orders",
  labelNames: ["currency"],
});

// Error Tracking
export const errorsCounterProvider = makeCounterProvider({
  name: "errors_total",
  help: "Total number of errors",
  labelNames: ["type", "status_code"],
});
```

**MetricsService Facade (type-safe access):**
```typescript
@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric("orders_created_total")
    private readonly ordersCreated: Counter<string>,
    @InjectMetric("revenue_total")
    private readonly revenue: Counter<string>,
  ) {}

  incrementOrdersCreated(status: string = "created"): void {
    this.ordersCreated.inc({ status });
  }

  incrementRevenue(amount: number, currency: string = "EUR"): void {
    this.revenue.inc({ currency }, amount);
  }
}
```

**HTTP Request Interceptor (metrics.interceptor.ts):**
```typescript
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("http_request_duration_seconds")
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        const route = request.route?.path || request.path || "unknown";
        this.httpRequestDuration.observe(
          { method, route, status_code: statusCode },
          duration,
        );
      }),
    );
  }
}
```

**Exception Filter for Error Tracking (metrics-exception.filter.ts):**
```typescript
@Catch()
export class MetricsExceptionFilter implements ExceptionFilter {
  constructor(private readonly metricsService: MetricsService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    this.metricsService.incrementErrors(exception.constructor.name, statusCode);

    // Re-throw for default NestJS handling
    throw exception;
  }
}
```

### Available Metrics

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `http_request_duration_seconds` | Histogram | method, route, status_code | API latency tracking |
| `orders_created_total` | Counter | status | Order volume |
| `orders_completed_total` | Counter | - | Successful deliveries |
| `orders_cancelled_total` | Counter | - | Cancellation rate |
| `revenue_total` | Counter | currency | Business revenue |
| `order_amount` | Histogram | currency | Order value distribution |
| `login_attempts_total` | Counter | status | Auth monitoring |
| `errors_total` | Counter | type, status_code | Error rate |
| `active_drivers` | Gauge | - | Driver availability |
| `delivery_duration_seconds` | Histogram | restaurant_id | Delivery performance |

### Grafana Dashboard

Pre-configured dashboard with 10 panels:
- HTTP Request Rate (requests/second)
- HTTP Request Latency (p50, p95, p99)
- Orders Created Over Time
- Revenue Over Time
- Active Drivers Gauge
- Error Rate by Type
- Login Success/Failure Rate
- Order Status Distribution
- Top Restaurants by Orders
- Delivery Duration by Restaurant

### Infrastructure Setup

**Docker Compose services:**
```yaml
prometheus:
  image: prom/prometheus:v2.47.0
  ports:
    - "9095:9090"
  volumes:
    - ./apps/delivery-service/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana:10.2.0
  ports:
    - "3001:3000"
  volumes:
    - ./apps/delivery-service/grafana/provisioning:/etc/grafana/provisioning
```

**Prometheus scrape config:**
```yaml
scrape_configs:
  - job_name: "delivery-service"
    static_configs:
      - targets: ["delivery-service-api:3000"]
    metrics_path: "/metrics"
```

## Consequences

### Positive
- **Structured logging** - JSON logs work with ELK, CloudWatch, Datadog
- **Request tracing** - Correlation IDs link related log entries
- **Security** - Sensitive data automatically redacted
- **Performance visibility** - Latency histograms identify slow endpoints
- **Business insights** - Revenue, orders, and conversion metrics
- **Error alerting** - Track error rates by type and endpoint
- **Developer experience** - Pretty logs in development
- **Industry standard** - Prometheus/Grafana widely adopted

### Negative
- **Infrastructure overhead** - Requires Prometheus and Grafana containers
- **Storage requirements** - Metrics data accumulates over time
- **Learning curve** - PromQL for custom dashboards/alerts
- **Metric cardinality** - High-cardinality labels can impact performance

### Mitigations
- Docker Compose includes Prometheus and Grafana with health checks
- Grafana provisioning auto-loads datasource and dashboard
- Bounded label cardinality (no user IDs as labels)
- Retention policies configurable in Prometheus

## References
- [Pino - Super fast Node.js logger](https://getpino.io/)
- [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
- [@willsoto/nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
