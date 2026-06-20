import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url().default('http://127.0.0.1:8000'),
});

const getEnv = () => {
    try {
        return envSchema.parse({
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const messages = (err as z.ZodError).issues.map((e: z.ZodIssue) => e.message);
            throw new Error(
                `Environment validation failed: ${messages.join(', ')}. ` +
                `Make sure NEXT_PUBLIC_API_URL is set in your .env file.`
            );
        }
        throw err;
    }
};

export default getEnv;
