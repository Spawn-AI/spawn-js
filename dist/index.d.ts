import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

type WorkerFilter = {
    id?: string;
    name?: string;
    branch?: string;
    is_dirty?: boolean;
    cluster?: number;
};
type StableDiffusionConfig = {
    steps: number;
    skip_steps: number;
    batch_size: 1 | 2 | 4 | 8 | 16;
    sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a";
    guidance_scale: number;
    width: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
    height: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
    prompt: string;
    negative_prompt: string;
    init_image?: string;
    mask?: string;
    image_format: "png" | "jpeg" | "avif" | "webp";
    translate_prompt: boolean;
    nsfw_filter: boolean;
    seed?: number;
};
declare class SelasClient {
    supabase: SupabaseClient;
    app_id: string;
    key: string;
    app_user_id: string;
    app_user_token: string;
    worker_filter: WorkerFilter;
    constructor(supabase: SupabaseClient, app_id: string, key: string, app_user_id: string, app_user_token: string, worker_filter?: WorkerFilter);
    private rpc;
    echo: (args: {
        message: string;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getAppUserCredits: () => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getAppUserJobHistoryDetail: (args: {
        limit: number;
        offset: number;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    getServiceList: () => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    postJob: (args: {
        service_id: string;
        job_config: StableDiffusionConfig;
        worker_filter: WorkerFilter;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    subscribeToJob: (args: {
        job_id: string;
        callback: (result: object) => void;
    }) => Promise<void>;
}
declare const createSelasClient: (credentials: {
    app_id: string;
    key: string;
    app_user_id: string;
    app_user_token: string;
}) => Promise<SelasClient>;

export { SelasClient, StableDiffusionConfig, WorkerFilter, createSelasClient };
