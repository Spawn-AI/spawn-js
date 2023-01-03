import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Pusher from "pusher-js";

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

export type TrainingImage = {
  url: string;
  label: string;
};

export type PatchConfig = {
  name: string;
  alpha_text_encoder: number;
  alpha_unet: number;
  steps: number ;
};

export type PatchTrainerConfig = {
  dataset: any[];
  patch_name: string;
  description: string;
  learning_rate: number;
  steps: number;
  rank: number;
};

//Create an object of type PatchConfig
export function PatchConfig(name: string, alpha_text_encoder?: number,alpha_unet?: number,steps?: number): PatchConfig {
  return {
    name: name,
    alpha_text_encoder: alpha_text_encoder || 1.0,
    alpha_unet: alpha_unet || 1.0,
    steps: steps || 100,
  };
}


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

/**
 * SelasClient is the client to use to interact with the Selas API.
 * @param supabase - The supabase client to use.
 * @param app_id - The app id to use.
 * @param key - The key to use.
 * @param app_user_id - The app user id to use.
 * @param app_user_token - The app user token to use.
 */
export class SelasClient {
  supabase: SupabaseClient;
  app_id: string;
  key: string;
  app_user_external_id: string;
  app_user_token: string;
  worker_filter: WorkerFilter;
  services: any[];
  add_ons: any[];
  app_user_id: string;

  /**
   *
   * @param supabase
   * @param app_id
   * @param key
   * @param app_user_id
   * @param app_user_token
   * @param worker_filter
   *
   * @example
   * selas = await createSelasClient(
   *    {
   *      app_id: process.env.TEST_APP_ID!,
   *      key: process.env.TEST_APP_KEY!,
   *      app_user_id: process.env.TEST_APP_USER_ID!,
   *      app_user_token: process.env.TEST_APP_USER_TOKEN!
   *    }
   *  );
   */
  constructor(
    supabase: SupabaseClient,
    app_id: string,
    key: string,
    app_user_external_id: string,
    app_user_token: string,
    worker_filter?: WorkerFilter
  ) {
    this.supabase = supabase;
    this.app_id = app_id;
    this.key = key;
    this.app_user_external_id = app_user_external_id;
    this.app_user_token = app_user_token;
    this.worker_filter = worker_filter || { branch: "main" };

    this.app_user_id = "";
    this.services = [];
    this.add_ons = [];
  }

  setUserID = async () => {
    const { data, error } = await this.supabase.rpc("app_user_get_id",{
      p_app_id: this.app_id,
      p_key: this.key,
      p_app_user_external_id: this.app_user_external_id,
      p_app_user_token: this.app_user_token});
    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      this.app_user_id = String(data);
    }
  }

  handle_error = (error: any) => {
    if (error.code === '') {
      throw new Error("The database cannot be reached. Contact the administrator.");
    }
    if (error.message === "Invalid API key"){
      throw new Error("The API key is invalid. Contact the administrator.");
    }
    if (error.code === '22P02'){
      throw new Error("The credentials are not correct.");
    }
    if (error.code === 'P0001'){
      throw new Error(error.message);
    }
  }

  test_connection = async () => {
    const { data, error } =  await this.rpc("app_user_echo", {message_app_user: "check"});
    if (error) {
      this.handle_error(error);
    }
    if (data){
      if (String(data) !== "check") {
        throw new Error("There is a problem with the database. Contact the administrator.");
      }
    }
  }

  /**
   * rpc is a wrapper around the supabase rpc function usable by the SelasClient.
   * @param fn - The name of the function to call.
   * @param params - The parameters to pass to the function.
   * @returns the result of the rpc call.
   * @example
   * const { data, error } = await this.rpc("app_user_echo", {message_app_owner: "hello"});
   */
  private rpc = async (fn: string, params: any) => {
    const paramsWithToken = {
      ...params,
      p_app_id: this.app_id,
      p_key: this.key,
      p_app_user_id: this.app_user_id,
      p_app_user_token: this.app_user_token,
    };
    const { data, error } = await this.supabase.rpc(fn, paramsWithToken);

    return { data, error };
  };

  getServiceList = async () => {
    const { data, error } = await this.rpc("app_user_get_services", {});
    if (error) {
      this.handle_error(error);
    }
    if (data) {
      this.services = data;
    }
    return data;
  };

  getAddOnList = async () => {
    const { data, error } = await this.rpc("app_user_get_add_ons", {});
    if (error) {
      this.handle_error(error);
    }
    if (data) {
      this.add_ons = data;
    }
    return data;
  };

  /**
   * echo is a test function to test the rpc call.
   * @param message - The message to echo.
   * @returns the result of the rpc call.
   * @example
   * const { data, error } = await this.echo({message: "hello"});
   */
  echo = async (args: { message: string }) => {
    const { data, error } =  await this.rpc("app_user_echo", { message_app_user: args.message });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };


  /**
   * getAppUserCredits returns the credits of the app user.
   * @returns the result of the rpc call.
   * @example
   * const { data, error } = await this.getAppUserCredits();
   */
  getAppUserCredits = async () => {
    const { data, error } = await this.rpc("app_user_get_credits", {});
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * getAppUserJobHistory returns the job history of the app user.
   * @param limit - The number of jobs to return.
   * @param offset - The offset to start from.
   * @returns the result of the rpc call as a json object.
   * @example
   * const { data, error } = await this.getAppUserJobHistory({limit: 10, offset: 0});
   */
  getAppUserJobHistory = async (args: { limit: number; offset: number }) => {
    const { data, error } = await this.rpc("app_user_get_job_history_detail", {
      p_limit: args.limit,
      p_offset: args.offset,
    });
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  /**
   * Create a new job. This job will be executed by the workers of the app.
   * @param service_id - the id of the service that will be executed.
   * @param job_config - the configuration of the job.
   * @returns the id of the job.
   */
  postJob = async (args: { service_name: string; job_config: object}) => {
    const service = this.services.find(service => service.name === args.service_name);
    if (!service) {
      throw new Error("Invalid model name")
    }

    
    const { data, error } = await this.rpc("post_job", {
      p_service_id: service["id"],
      p_job_config: JSON.stringify(args.job_config),
      p_worker_filter: this.worker_filter,
    });
    return { data, error };
  };

  /**
   * Wait for the  the result of a job and returns it.
   * @param job_id - the id of the job.
   * @callback - the function that will be used to process the result of the job.
   * @example
   *  client.subscribeToJob({job_id: response.data, callback: function (data) { console.log(data); }});
   */
  subscribeToJob = async (args: { job_id: string; callback: (result: object) => void }) => {
    const client = new Pusher("ed00ed3037c02a5fd912", {
      cluster: "eu",
    });

    const channel = client.subscribe(`job-${args.job_id}`);
    channel.bind("result", args.callback);
  };

  getServiceConfigCost = async (args: { service_name: string; job_config: string }) => {
    const service_id = this.services.find(service => service.name === args.service_name)['id'];
    if (!service_id) {
      throw new Error("Invalid model name")
    }    
    const { data, error } = await this.supabase.rpc("get_service_config_cost_client", {p_service_id: service_id,
                                                                                 p_config: args.job_config});
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  // method that change a PatchConfig into an addOnConfig
  private patchConfigToAddonConfig = (patch_config: PatchConfig) => {
    return {
      id : this.add_ons.find(add_on => add_on.name === patch_config.name).id,
      config : {
        alpha_unet: patch_config.alpha_unet,
        alpha_text_encoder: patch_config.alpha_text_encoder,
        steps: patch_config.steps,
      }
    }
  };

  /**
   * Run a StableDiffusion job on Selas API. The job will be run on the first available worker.
   *
   * @param args.prompt - the description of the image to be generated
   * @param args.negative_prompt - description of the image to be generated, but with negative words like "ugly", "blurry" or "low quality"
   * @param args.width - the width of the generated image
   * @param args.height - the height of the generated image
   * @param args.steps - the number of steps of the StableDiffusion algorithm. The higher the number, the more detailed the image will be. Generally, 30 steps is enough, but you can try more if you want.
   * @param args.batch_size - the number of images to be generated at each step.
   * @param args.guidance_scale - the weight of the guidance image in the loss function. Typical values are between 5. and 15. The higher the number, the more the image will look like the prompt. If you go too high, the image will look like the prompt but will be low quality.
   * @param args.init_image - the url of an initial image to be used by the algorithm. If not provided, random noise will be used. You can start from an existing image and make StableDiffusion refine it. You can specify the skip_steps to choose how much of the image will be refined (0 is like a random initialization, 1. is like a copy of the image).
   * @param args.mask - the url of a mask image. The mask image must be a black and white image where white pixels are the pixels that will be modified by the algorithm. Black pixels will be kept as they are. If not provided, the whole image will be modified.
   * @param args.skip_steps - the number of steps to skip at the beginning of the algorithm. If you provide an init_image, you can choose how much of the image will be refined. 0 is like a random initialization, 1. is like a copy of the image.
   * @param args.seed - the seed of the random number generator. Using twice the same we generate the same image. It can be useful to see the effect of parameters on the image generated. If not provided, a random seed will be used.
   * @param args.image_format - the format of the generated image. It can be "png" or "jpeg".
   * @param args.nsfw_filter - if true, the image will be filtered to remove NSFW content. It can be useful if you want to generate images for a public website.
   * @param args.translate_prompt - if true, the prompt will be translated to English before being used by the algorithm. It can be useful if you want to generate images in a language that is not English.
   **/
  runStableDiffusion = async (prompt: string, args?: {service_name?: string, steps?: number, skip_steps?: number, 
    batch_size?: 1 | 2 | 4 | 8 | 16, sampler?: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a" | "dpm_multistep", 
    guidance_scale?: number, width?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768, 
    height?: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768, negative_prompt?: string, 
    image_format?: "png" | "jpeg" | "avif" | "webp", translate_prompt?: boolean, nsfw_filter?: boolean,
    patches?: PatchConfig[]}) => {

    const service_name = args?.service_name || "stable-diffusion-2-1-base";
    // check if the model name has stable-diffusion as an interface
    if (!this.services.find(service => service.name === service_name)) {
      throw new Error(`The service ${service_name} does not exist`);
    }
    const service_interface = this.services.find(service => service.name === service_name).interface;
    if (service_interface !== "stable-diffusion") {
      throw new Error(`The service ${service_name} does not have the stable-diffusion interface`);
    }

    // check if the add on is available for this service
    for (const patch of args?.patches || []) {
      if (!this.add_ons.find(add_on => add_on.name === patch.name)) {
        throw new Error(`The add-on ${patch.name} does not exist`);
      }
      let service = this.add_ons.find(add_on => add_on.name === patch.name).service_name;
      console.log(service);
      if (!this.add_ons.find(add_on => add_on.name === patch.name).service_name.includes(service_name)) {
        throw new Error(`The service ${service_name} does not have the add-on ${patch.name}`);
      }
    }

    let add_ons = args?.patches?.map(patch => this.patchConfigToAddonConfig(patch));
    
    const config: StableDiffusionConfig = {
      steps: args?.steps || 28,
      skip_steps: args?.skip_steps || 0,
      batch_size: args?.batch_size || 1,
      sampler: args?.sampler || "k_euler",
      guidance_scale: args?.guidance_scale || 10,
      width: args?.width || 512,
      height: args?.height || 512,
      prompt: prompt || "banana in the kitchen",
      negative_prompt: args?.negative_prompt || "ugly",
      image_format: args?.image_format || "jpeg",
      translate_prompt: args?.translate_prompt || false,
      nsfw_filter: args?.nsfw_filter || false,
      add_ons : add_ons
    };
    const response = await this.postJob({
      service_name: service_name,
      job_config: config,
    });

    return response;
  };

  //return the number of active worker
  getCountActiveWorker = async () => {
    const { data, error } = await this.supabase.rpc("get_active_worker_count", {p_worker_filter: this.worker_filter});
    if (error) {
      this.handle_error(error);
    }
    return data;
  };

  runPatchTrainer = async (
    dataset: TrainingImage[],
    patch_name: string,
    args?: {
      service_name?: string;
      description?: string;
      learning_rate?: number;
      steps?: number;
      rank?: number;
    }
  ) => {
    const service_name = args?.service_name || "patch_trainer_v1";
    // check if the model name has stable-diffusion as an interface
    if (!this.services.find((service) => service.name === service_name)) {
      throw new Error(`The service ${service_name} does not exist`);
    }
    const service_interface = this.services.find(
      (service) => service.name === service_name
    ).interface;
    if (service_interface !== "train-patch-stable-diffusion") {
      throw new Error(
        `The service ${service_name} does not have the train-patch-stable-diffusion interface`
      );
    }

    await this.getAddOnList();

    // check if the patch name is already in add_ons
    if (this.add_ons.find((add_on) => add_on.name === patch_name)) {
      throw new Error(`The add-on ${patch_name} already exists`);
    }

    const trainerConfig: PatchTrainerConfig = {
      dataset: dataset,
      patch_name: patch_name,
      description: args?.description || "",
      learning_rate: args?.learning_rate || 1e-4,
      steps: args?.steps || 100,
      rank: args?.rank || 4,
    };

    const response = await this.postJob({
      service_name: service_name,
      job_config: trainerConfig,
    });
    return response;
  };

  // call the rpc app_user_share_add_on
  shareAddOn = async (args: {add_on_name: string,app_user_external_id: string}) => {
    const add_on_id = this.add_ons.find(add_on => add_on.name === args.add_on_name).id;

    if (!add_on_id) {
      throw new Error(`The add-on ${args.add_on_name} does not exist`);
    }

    const { data, error } = await this.rpc("app_user_share_add_on", {p_add_on_id: add_on_id,
      p_app_user_external_id: args.app_user_external_id});
    if (error) {
      this.handle_error(error);
    }
    return data;
 };

  getResult = async (job_id: string) => {
    const { data, error } = await this.rpc("app_user_get_job_result", {p_job_id: job_id});
    if (error) {
      this.handle_error(error);
    }
    return data;
  };


}

/**
 * createSelasClient creates a SelasClient.
 * @param credentials - The credentials to use.
 * @returns the SelasClient.
 * @example
 * selas = await createSelasClient(
 *   {
 *    app_id: process.env.TEST_APP_ID!,
 *    key: process.env.TEST_APP_KEY!,
 *    app_user_id: process.env.TEST_APP_USER_ID!,
 *    app_user_token: process.env.TEST_APP_USER_TOKEN!
 *   }
 * );
 */
export const createSelasClient = async (
  credentials: {
    app_id: string;
    key: string;
    app_user_external_id: string;
    app_user_token: string;
  },
  worker_filter?: WorkerFilter
) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const selas = new SelasClient(
    supabase,
    credentials.app_id,
    credentials.key,
    credentials.app_user_external_id,
    credentials.app_user_token,
    worker_filter
  );

  await selas.setUserID();

  await selas.test_connection();

  await selas.getServiceList();
  await selas.getAddOnList();

  return selas;
};

export default createSelasClient;
