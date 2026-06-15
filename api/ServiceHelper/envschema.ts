import * as yup from 'yup';


const envSchema = yup.object({
    NEXT_PUBLIC_API_URL: yup.string().url().required("NEXT_PUBLIC_API_URL is missing or invalid"),

});

const getEnv = () => {
    try {
        return envSchema.validateSync({
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        });
    } catch (err: any) {
        throw new Error(
            `Environment validation failed: ${err.message || err}. ` +
            `Make sure NEXT_PUBLIC_API_URL is set in your .env file.`
        );
    }
};

export default getEnv;

