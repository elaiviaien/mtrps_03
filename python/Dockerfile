# -----------------------------------------------------------------------------
# BASE: system dependencies
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS base

ENV POETRY_HOME=/opt/poetry \
    PATH="/opt/poetry/bin:$PATH"


RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# -----------------------------------------------------------------------------
# POETRY INSTALLER
# -----------------------------------------------------------------------------
FROM base AS poetry-installer

RUN curl -sSL https://install.python-poetry.org | python3 - \
    && ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry \
    && poetry --version

# -----------------------------------------------------------------------------
# DEPENDENCIES BUILDER
# -----------------------------------------------------------------------------
FROM poetry-installer AS deps-builder

COPY requirements/pyproject.toml requirements/poetry.lock /app/

RUN poetry config virtualenvs.in-project true \
    && poetry install --no-root --only main --no-interaction --no-ansi \
    && mv .venv /opt/venv

# -----------------------------------------------------------------------------
# RUNTIME: minimal image + code + venv
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS runtime

ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app

# Copy venv with prod deps
COPY --from=deps-builder /opt/venv /opt/venv

# Copy application code once
COPY spaceship/ /app/spaceship/
COPY __init__.py /app/
COPY build/ /app/build/

# Use python -m to launch uvicorn from the venv
EXPOSE 8000
CMD ["/opt/venv/bin/python", "-m", "uvicorn", "spaceship.main:app", "--host", "0.0.0.0", "--port", "8000"]