FROM python:3.11-alpine

ENV POETRY_HOME=/opt/poetry
ENV PATH="$POETRY_HOME/bin:$PATH"

WORKDIR /app

# Install system dependencies
RUN apk update \
    && apk add --no-cache curl git

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

COPY requirements/pyproject.toml requirements/poetry.lock ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

COPY spaceship/ /app/spaceship/
COPY __init__.py /app/
COPY build/ /app/build/

EXPOSE 8000
CMD ["poetry", "run", "uvicorn", "spaceship.main:app", "--host", "0.0.0.0", "--port", "8000"]