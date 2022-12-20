import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

type WorkerFilter = {
    id?: string;
    name?: string;
    branch?: string;
    is_dirty?: boolean;
    cluster?: number;
};
type PatchConfig = {
    name: string;
    alpha_text_encoder: number;
    alpha_unet: number;
    steps: number;
};
declare function PatchConfig(name: string, alpha_text_encoder?: number, alpha_unet?: number, steps?: number): PatchConfig;
type StableDiffusionConfig = {
    steps: number;
    skip_steps: number;
    batch_size: 1 | 2 | 4 | 8 | 16;
    sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a" | "dpm_multistep";
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
    add_ons?: any[];
};
declare class SelasClient {
    supabase: SupabaseClient;
    app_id: string;
    key: string;
    app_user_id: string;
    app_user_token: string;
    worker_filter: WorkerFilter;
    services: any[];
    add_ons: any[];
    constructor(supabase: SupabaseClient, app_id: string, key: string, app_user_id: string, app_user_token: string, worker_filter?: WorkerFilter);
    handle_error: (error: any) => void;
    test_connection: () => Promise<void>;
    private rpc;
    getServiceList: () => Promise<any[] | null>;
    getAddOnList: () => Promise<any[] | null>;
    echo: (args: {
        message: string;
    }) => Promise<any[] | null>;
    getAppUserCredits: () => Promise<any[] | null>;
    getAppUserJobHistory: (args: {
        limit: number;
        offset: number;
    }) => Promise<any[] | null>;
    postJob: (args: {
        service_name: string;
        job_config: object;
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
    subscribeToJob: (args: {
        job_id: string;
        callback: (result: object) => void;
    }) => Promise<void>;
    getServiceConfigCost: (args: {
        service_name: string;
        job_config: string;
    }) => Promise<any[] | null>;
    private patchConfigToAddonConfig;
    runStableDiffusion: (prompt: string, args?: {
        service_name?: string;
        steps?: number;
        skip_steps?: number;
        batch_size?: 1 | 2 | 4 | 8 | 16;
        sampler?: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a" | "dpm_multistep";
        guidance_scale?: number;
        width?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
        height?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
        negative_prompt?: string;
        image_format?: "png" | "jpeg" | "avif" | "webp";
        translate_prompt?: boolean;
        nsfw_filter?: boolean;
        patches?: PatchConfig[];
    }) => Promise<{
        data: any[] | null;
        error: _supabase_supabase_js.PostgrestError | null;
    }>;
}
declare const createSelasClient: (credentials: {
    app_id: string;
    key: string;
    app_user_id: string;
    app_user_token: string;
}, worker_filter?: WorkerFilter) => Promise<SelasClient>;

export { PatchConfig, SelasClient, StableDiffusionConfig, WorkerFilter, createSelasClient, createSelasClient as default };
