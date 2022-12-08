import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

/**
 * WorkerFilter is a filter to select workers.
 * @param id - ID of the worker (optional).
 * @param name - Name of the worker (optional).
 * @param branch - Branch of the worker (optional).
 * @param is_dirty - Whether the worker is dirty (optional).
 * @param cluster - Cluster of the worker (optional).
 */
export type WorkerFilter = {
    id?: string;
    name?: string;
    branch?: string;
    is_dirty?: boolean;
    cluster?: number;
};

/**
 * StableDiffusionConfig is the configuration for the stable diffusion job.
 * @param steps - Number of steps to run the job for.
 * @param skip_steps - Number of steps to skip before starting the job.
 * @param batch_size - Batch size to use for the job.
 * @param sampler - Sampler to use for the job.
 * @param guidance_scale - Guidance scale to use for the job.
 * @param width - Width of the output image.
 * @param height - Height of the output image.
 * @param prompt - Prompt to use for the job.
 * @param negative_prompt - Negative prompt to use for the job.
 * @param init_image - Initial image to use for the job (optional).
 * @param mask - Mask to use for the job (optional).
 * @param image_format - Image format to use for the job.
 * @param translate_prompt - Whether to translate the prompt.
 * @param nsfw_filter - Whether to filter nsfw images.
 * @param seed - Seed to use for the job (optional).
 * @example - 
 *    const config: StableDiffusionConfig = {
 *    steps: 28,
 *    skip_steps: 0,
 *    batch_size: 1,
 *    sampler: "k_euler",
 *    guidance_scale: 10,
 *    width: 512,
 *    height: 512,
 *    prompt: "banana in the kitchen",
 *    negative_prompt: "ugly",
 *    image_format: "jpeg",
 *    translate_prompt: false,
 *    nsfw_filter: false,
 *  };
 */
export type StableDiffusionConfig = {
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

export class SelasClient {
    supabase: SupabaseClient;
    app_id: string;
    key: string;
    app_user_id: string;
    app_user_token: string;


    constructor(supabase: SupabaseClient, app_id: string, key: string, app_user_id: string, app_user_token: string) {
        this.supabase = supabase;
        this.app_id = app_id;
        this.key = key;
        this.app_user_id = app_user_id;
        this.app_user_token = app_user_token;
    }

    /**
    * rpc is a wrapper around the supabase rpc function usable by the SelasClient.
    * @param fn - The name of the function to call.
    * @param params - The parameters to pass to the function.
    * @returns the result of the rpc call.
    * @example
    * const { data, error } = await this.rpc("app_owner_echo", {message_app_owner: "hello"});
    */
    private rpc = async (fn: string, params: any) => {
        const paramsWithToken = { ...params, p_app_id: this.app_id, p_key: this.key, 
                                                p_app_user_id: this.app_user_id, p_app_user_token: this.app_user_token };
        const { data, error } = await this.supabase.rpc(fn, paramsWithToken);

        return { data, error };
    };

    getAppUserCredits = async () => {
        const { data, error } = await this.rpc("app_user_get_credits", {});
        return { data, error };
    };

    getAppUserJobHistoryDetail = async (args: {limit : number; offset : number}) => {
        const { data, error } = await this.rpc("app_user_get_job_history_detail", {p_limit : args.limit, p_offset : args.offset});
        return { data, error };
    };

    postJob = async ( args: { service_id : string, job_config : StableDiffusionConfig, worker_filter : WorkerFilter}) => {
        const { data, error } = await this.rpc("post_job", {p_service_id : args.service_id,
                                                                p_job_config : args.job_config,
                                                                p_worker_filter : args.worker_filter});
        return { data, error };
    };
}

export const createSelasClient = async (
    credentials: { app_id: string; key: string; app_user_id: string; app_user_token: string }
  ) => {
    const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";
  
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  
    return new SelasClient(supabase, credentials.app_id, credentials.key, credentials.app_user_id, credentials.app_user_token);
  };

module.exports = {createSelasClient, SelasClient};


