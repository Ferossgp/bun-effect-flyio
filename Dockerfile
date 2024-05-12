# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.0.35
FROM oven/bun:${BUN_VERSION}-slim as base

LABEL fly_launch_runtime="Bun"

# Bun app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Install node modules
COPY --link bun.lockb package-lock.json package.json ./
RUN bun install --ci

# Copy application code
COPY --link . .

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

# Configure litefs
COPY --from=flyio/litefs:0.5.9 /usr/local/bin/litefs /usr/local/bin/litefs
RUN mkdir -p /litefs /var/lib/litefs
COPY --from=tokenizer /work/libsignal_tokenizer.so /app/lib/libsignal_tokenizer.so
ADD litefs.yml /etc/litefs.yml

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
ENV PORT="3000"
ENV DB_PATH=/litefs/db.sqlite

ENTRYPOINT [ "litefs", "mount" ]