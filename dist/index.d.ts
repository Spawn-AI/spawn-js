import { SupabaseClient } from '@supabase/supabase-js';

type WorkerFilter = {
    id?: string;
    name?: string;
    branch?: string;
    is_dirty?: boolean;
    cluster?: number;
};
type TrainingImage = {
    url: string;
    label: string;
};
type PatchTrainerConfig = {
    dataset: any[];
    patch_name: string;
    description: string;
    learning_rate: number;
    steps: number;
    rank: number;
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
    app_user_external_id: string;
    app_user_token: string;
    worker_filter: WorkerFilter;
    services: any[];
    add_ons: any[];
    app_user_id: string;
    constructor(supabase: SupabaseClient, app_id: string, key: string, app_user_external_id: string, app_user_token: string, worker_filter?: WorkerFilter);
    private handle_error;
    private rpc;
    test_connection: () => Promise<void>;
    getServiceList: () => Promise<any[] | null>;
    getAddOnList: () => Promise<any[] | null>;
    setUserID: () => Promise<void>;
    echo: (message: string) => Promise<any[] | null>;
    getAppUserCredits: () => Promise<any[] | null>;
    getAppUserJobHistory: (limit: number, offset: number) => Promise<any[] | null>;
    getServiceConfigCost: (service_name: string, job_config: string) => Promise<any[] | null>;
    private postJob;
    getResult: (job_id: string) => Promise<any[] | null>;
    subscribeToJob: (job_id: string, callback: (result: object) => void) => Promise<void>;
    costStableDiffusion: (prompt: string, args?: {
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
    }) => Promise<any[] | null>;
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
    }) => Promise<any[] | null>;
    private patchConfigToAddonConfig;
    costPatchTrainer: (dataset: TrainingImage[], patch_name: string, args?: {
        service_name?: string;
        description?: string;
        learning_rate?: number;
        steps?: number;
        rank?: number;
    }) => Promise<any[] | null>;
    runPatchTrainer: (dataset: TrainingImage[], patch_name: string, args?: {
        service_name?: string;
        description?: string;
        learning_rate?: number;
        steps?: number;
        rank?: number;
    }) => Promise<any[] | null>;
    shareAddOn: (add_on_name: string, app_user_external_id: string) => Promise<any[] | null>;
    deleteAddOn: (add_on_name: string) => Promise<any[] | null>;
    renameAddOn: (add_on_name: string, new_add_on_name: string) => Promise<any[] | null>;
    getCountActiveWorker: () => Promise<any[] | null>;
}
declare const createSelasClient: (credentials: {
    app_id: string;
    key: string;
    app_user_external_id: string;
    app_user_token: string;
}, worker_filter?: WorkerFilter) => Promise<SelasClient>;

export { PatchConfig, PatchTrainerConfig, SelasClient, StableDiffusionConfig, TrainingImage, WorkerFilter, createSelasClient, createSelasClient as default };
