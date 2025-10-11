# ===============================================
# BUILD STAGE
# ===============================================
# compile to binary to reduce base image overhead
FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY bun.lockb bun.lockb

RUN bun install

# Copy source code
COPY ./src ./src
COPY ./tsconfig.json ./tsconfig.json

ENV NODE_ENV=production

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	./src/index.ts

# ===============================================
# RUNTIME STAGE
# ===============================================
# use Distroless image
FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

# Cloud Run will send PORT environment variable to the container
ENV PORT=8080

CMD ["./server"]

# expose port 8080
EXPOSE 8080
