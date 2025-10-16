import logging
import sys
import structlog
import os

def setup_logging():
    """
    Set up structured logging for the application.
    """
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    if sys.stdout.isatty():
        # Development logging
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        # Production logging
        processors.append(structlog.processors.JSONRenderer())

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        level=log_level,
        format="%(message)s",
        stream=sys.stdout,
    )