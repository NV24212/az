import logging
import sys
import structlog
import os

def setup_logging():
    """
    Set up structured logging for the application, correctly integrating with
    the standard logging library.
    """
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    dev_logging = os.environ.get("DEV_LOGGING", "false").lower() == "true"

    # Common processors for both dev and prod
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.ExtraAdder(), # Adds extra context from standard library log calls
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    # Configure the structlog processor chain
    if dev_logging or (sys.stdout.isatty() and not dev_logging == "false"):
        # Human-readable logs for development
        processors = shared_processors + [structlog.dev.ConsoleRenderer()]
    else:
        # Machine-readable JSON logs for production
        processors = shared_processors + [
            structlog.processors.dict_tracebacks, # Ensure tracebacks are rendered correctly
            structlog.processors.JSONRenderer(),
        ]

    # Integrate structlog with the standard logging library
    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Get the root logger and configure it to use structlog
    root_logger = logging.getLogger()

    # Remove any existing handlers to prevent duplicate logging
    for handler in root_logger.handlers:
        root_logger.removeHandler(handler)

    # Add a handler that will process logs through the structlog pipeline
    handler = logging.StreamHandler(sys.stdout)
    # The formatter is not needed because structlog's processor chain handles rendering.
    root_logger.addHandler(handler)
    root_logger.setLevel(log_level)

    # Optionally silence noisy loggers from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
