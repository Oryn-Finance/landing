# STAGE 1: Install dependencies and build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies in one layer (faster)
RUN apk add --no-cache python3 make g++ && \
    corepack enable && \
    corepack prepare yarn@4.5.1 --activate

# Copy package files first for better caching
COPY package.json yarn.lock .yarnrc.yml ./

# Install ALL dependencies (including devDependencies needed for build)
# DO NOT set NODE_ENV=production here - we need devDeps (TypeScript, Tailwind, etc.)
RUN yarn install --immutable

# Copy source files
COPY . .

# Build the Next.js app (standalone mode creates minimal production bundle)
ENV NODE_ENV=production
RUN yarn build

# STAGE 2: Run the app with minimal dependencies
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user in one step
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

ENV NODE_ENV=production

# Copy standalone output from builder (includes all production dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use the standalone server.js instead of yarn start
CMD ["node", "server.js"]