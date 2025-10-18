import logging
import sys
import structlog
import os

def setup_logging():
    """
    Set up structured logging for the application, correctly integrating with
    the standard logging library. This configuration ensures that logs from
    all modules are captured and processed by structlog.
    """
    log_level_name = os.environ.get("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_name, logging.INFO)

    # Define processors for structlog. These will process all log records.
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    # Use a console renderer for development (if a TTY is attached) for readability.
    # Use a JSON renderer for production for machine-readable logs.
    if sys.stdout.isatty():
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        processors.append(structlog.processors.JSONRenderer())

    # Configure the standard logging library to use structlog's processors.
    # This is the key part to make sure everything is integrated.
    logging.config.dictConfig({
        "version": 1,
        "disable_existing_loggers": False, # Keep existing loggers
        "formatters": {
            "default": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processors": processors,
                "foreign_pre_chain": [structlog.stdlib.add_log_level],
            },
        },
        "handlers": {
            "default": {
                "level": log_level_name,
                "class": "logging.StreamHandler",
                "formatter": "default",
            },
        },
        "loggers": {
            "": { # Root logger
                "handlers": ["default"],
                "level": log_level_name,
                "propagate": True,
            },
        }
    })
