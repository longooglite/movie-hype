import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifySocketIO from 'fastify-socket.io';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import Redis from 'ioredis';
import pino from 'pino';
import dotenv from 'dotenv';
import { startIngestor } from './services/worker.js';
dotenv.config();
const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});
export const buildServer = async () => {
    const app = Fastify({
        logger: {
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        },
    });
    await app.register(cors, { origin: true });
    await app.register(fastifySocketIO, {
        cors: { origin: '*' },
    });
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
    // Graceful shutdown: ensure Prisma and Redis disconnect
    app.addHook('onClose', async () => {
        await prisma.$disconnect();
        await redis.quit();
    });
    // Health endpoint
    app.get('/health', async () => {
        try {
            // Database check
            await prisma.$queryRaw `SELECT 1`;
        }
        catch (err) {
            logger.error({ err }, 'database health check failed');
            return { ok: false, database: 'down', redis: 'unknown' };
        }
        try {
            const pong = await redis.ping();
            return { ok: true, database: 'ok', redis: pong === 'PONG' ? 'ok' : 'degraded' };
        }
        catch (err) {
            logger.error({ err }, 'redis health check failed');
            return { ok: false, database: 'ok', redis: 'down' };
        }
    });
    // Socket.IO namespace
    app.io.of('/events').on('connection', (socket) => {
        logger.info({ id: socket.id }, 'client connected to /events');
        socket.on('disconnect', (reason) => {
            logger.info({ id: socket.id, reason }, 'client disconnected from /events');
        });
    });
    // Start background ingestor
    if (process.env.NODE_ENV !== 'test') {
        startIngestor({
            io: app.io,
            prisma,
            logger,
            redis,
        });
    }
    return app;
};
const port = Number(process.env.PORT ?? 4000);
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
    buildServer()
        .then((app) => {
        app.listen({ host: '0.0.0.0', port }, (err, address) => {
            if (err) {
                app.log.error(err);
                process.exit(1);
            }
            app.log.info(`server listening on ${address}`);
        });
        const handleSig = async (signal) => {
            app.log.info({ signal }, 'shutting down');
            try {
                await app.close();
            }
            finally {
                process.exit(0);
            }
        };
        process.on('SIGINT', handleSig);
        process.on('SIGTERM', handleSig);
    })
        .catch((err) => {
        logger.error({ err }, 'failed to start server');
        process.exit(1);
    });
}
