// src/config/redis.ts
import Redis from 'ioredis';
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
});
redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});
export const connectRedis = async () => {
    try {
        await redis.connect();
        console.log('✅ Redis connected');
    }
    catch (err) {
        console.error('❌ Redis connection error:', err);
        process.exit(1);
    }
};
export default redis;
