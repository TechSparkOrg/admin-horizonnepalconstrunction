export interface SlugProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
