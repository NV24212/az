import logging
import logging.config
import sys
import structlog
import os

def setup_logging():
    """
    Set up structured logging for the application using the standard Python
    logging.config.dictConfig. This is the most reliable method.
    """
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()

    # This configuration correctly integrates structlog with standard logging
    # It ensures that all logs are processed by structlog's processors
    # and rendered as JSON, including tracebacks for exceptions.
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": structlog.stdlib.ProcessorFormatter,
                "processor": structlog.processors.JSONRenderer(),
                "foreign_pre_chain": [
                    structlog.stdlib.add_logger_name,
                    structlog.stdlib.add_log_level,
                    structlog.processors.TimeStamper(fmt="iso"),
                ],
            },
        },
        "handlers": {
            "default": {
                "level": log_level,
                "class": "logging.StreamHandler",
                "formatter": "json",
            },
        },
        "loggers": {
            "": {
                "handlers": ["default"],
                "level": log_level,
                "propagate": True,
            },
        },
    }

    logging.config.dictConfig(config)

    # Configure the structlog wrapper to process logs through the standard
    # logging pipeline that we just configured.
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    print("--- LOGGING HAS BEEN DEFINITIVELY CONFIGURED ---")
