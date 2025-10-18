import logging
import sys
import structlog
import os

def setup_logging():
    """
    Set up a simple, reliable structured logging configuration for the application.
    This version avoids dictConfig to ensure stability and visibility of logs.
    """
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

    # Define a stable set of processors for structlog
    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        # This processor is crucial for rendering exception info
        structlog.processors.format_exc_info,
        # Use a JSON renderer for machine-readable logs
        structlog.processors.JSONRenderer(),
    ]

    # Configure structlog to use these processors
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure the root logger to use a simple stream handler
    # This sends logs to standard output, which is what we need to see them
    handler = logging.StreamHandler(sys.stdout)

    # We do not set a formatter on the handler, as structlog handles the formatting
    # This prevents the conflicts we were seeing before

    # Get the root logger and clear any existing handlers
    root_logger = logging.getLogger()
    for h in root_logger.handlers:
        root_logger.removeHandler(h)

    root_logger.addHandler(handler)
    root_logger.setLevel(log_level)

    print("--- LOGGING HAS BEEN RELIABLY CONFIGURED ---")
