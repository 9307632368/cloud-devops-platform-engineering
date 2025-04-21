# Things I would add later

This lab collects just enough metrics to explore on-call basics. It is not production-ready monitoring.

- A real database or queue dependency check instead of a switch that imitates failures.
- CPU, memory, disk and container metrics using an exporter.
- Tracing across services and request IDs linking traces to logs.
- External alert notifications, after testing routing and noise control.
- SLO/error-budget calculations over longer time windows.
- Authentication and HTTPS in front of any dashboard accessible off the laptop.
- Dashboard screenshots taken after actually running the stack.

I kept the first version small so the connection between one bad request and its alert is easy to follow.
