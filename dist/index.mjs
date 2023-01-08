import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher-js';

function PatchConfig(name, alpha_text_encoder, alpha_unet, steps) {
  return {
    name,
    alpha_text_encoder: alpha_text_encoder || 1,
    alpha_unet: alpha_unet || 1,
    steps: steps || 100
  };
}
class SelasClient {
  constructor(supabase, app_id, key, app_user_external_id, app_user_token, worker_filter) {
    this.handle_error = (error) => {
      if (error.code === "") {
        throw new Error(
          "The database cannot be reached. Contact the administrator."
        );
      }
      if (error.message === "Invalid API key") {
        throw new Error("The API key is invalid. Contact the administrator.");
      }
      if (error.code === "22P02") {
        throw new Error("The credentials are not correct.");
      }
      if (error.code === "P0001") {
        throw new Error(error.message);
      }
    };
    this.rpc = async (fn, params) => {
      const paramsWithToken = {
        ...params,
        p_app_id: this.app_id,
        p_key: this.key,
        p_app_user_id: this.app_user_id,
        p_app_user_token: this.app_user_token
      };
      const { data, error } = await this.supabase.rpc(fn, paramsWithToken);
      return { data, error };
    };
    this.test_connection = async () => {
      const { data, error } = await this.rpc("app_user_echo", {
        message_app_user: "check"
      });
      if (error) {
        this.handle_error(error);
      }
      if (data) {
        if (String(data) !== "check") {
          throw new Error(
            "There is a problem with the database. Contact the administrator."
          );
        }
      }
    };
    this.getServiceList = async () => {
      const { data, error } = await this.rpc("app_user_get_services", {});
      if (error) {
        this.handle_error(error);
      }
      if (data) {
        this.services = data;
      }
      return data;
    };
    this.getAddOnList = async () => {
      const { data, error } = await this.rpc("app_user_get_add_ons", {});
      if (error) {
        this.handle_error(error);
      }
      if (data) {
        this.add_ons = data;
      }
      return data;
    };
    this.setUserID = async () => {
      const { data, error } = await this.supabase.rpc("app_user_get_id", {
        p_app_id: this.app_id,
        p_key: this.key,
        p_app_user_external_id: this.app_user_external_id,
        p_app_user_token: this.app_user_token
      });
      if (error) {
        throw new Error(error.message);
      }
      if (data) {
        this.app_user_id = String(data);
      }
    };
    this.echo = async (message) => {
      const { data, error } = await this.rpc("app_user_echo", {
        message_app_user: message
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getAppUserCredits = async () => {
      const { data, error } = await this.rpc("app_user_get_credits", {});
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getAppUserJobHistory = async (limit, offset) => {
      const { data, error } = await this.rpc("app_user_get_job_history_detail", {
        p_limit: limit,
        p_offset: offset
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getServiceConfigCost = async (service_name, job_config) => {
      const service_id = this.services.find(
        (service) => service.name === service_name
      )["id"];
      if (!service_id) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.supabase.rpc(
        "get_service_config_cost_client",
        { p_service_id: service_id, p_config: job_config }
      );
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.postJob = async (service_name, job_config) => {
      const service = this.services.find(
        (service2) => service2.name === service_name
      );
      if (!service) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.rpc("post_job", {
        p_service_id: service["id"],
        p_job_config: JSON.stringify(job_config),
        p_worker_filter: this.worker_filter
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getResult = async (job_id) => {
      const { data, error } = await this.rpc("app_user_get_job_result", {
        p_job_id: job_id
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.subscribeToJob = async (job_id, callback) => {
      const client = new Pusher("ed00ed3037c02a5fd912", {
        cluster: "eu"
      });
      const channel = client.subscribe(`job-${job_id}`);
      channel.bind("result", callback);
    };
    this.costStableDiffusion = async (prompt, args) => {
      const service_name = args?.service_name || "stable-diffusion-2-1-base";
      if (!this.services.find((service2) => service2.name === service_name)) {
        throw new Error(`The service ${service_name} does not exist`);
      }
      const service_interface = this.services.find(
        (service2) => service2.name === service_name
      ).interface;
      if (service_interface !== "stable-diffusion") {
        throw new Error(
          `The service ${service_name} does not have the stable-diffusion interface`
        );
      }
      for (const patch of args?.patches || []) {
        if (!this.add_ons.find((add_on) => add_on.name === patch.name)) {
          throw new Error(`The add-on ${patch.name} does not exist`);
        }
        if (!this.add_ons.find((add_on) => add_on.name === patch.name).service_name.includes(service_name)) {
          throw new Error(
            `The service ${service_name} does not have the add-on ${patch.name}`
          );
        }
      }
      let add_ons = args?.patches?.map(
        (patch) => this.patchConfigToAddonConfig(patch)
      );
      const config = {
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
        add_ons
      };
      const service = this.services.find(
        (service2) => service2.name === service_name
      );
      if (!service) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.supabase.rpc(
        "get_service_config_cost_client",
        { p_service_id: service["id"], p_config: JSON.stringify(config) }
      );
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.runStableDiffusion = async (prompt, args) => {
      const service_name = args?.service_name || "stable-diffusion-2-1-base";
      if (!this.services.find((service) => service.name === service_name)) {
        throw new Error(`The service ${service_name} does not exist`);
      }
      const service_interface = this.services.find(
        (service) => service.name === service_name
      ).interface;
      if (service_interface !== "stable-diffusion") {
        throw new Error(
          `The service ${service_name} does not have the stable-diffusion interface`
        );
      }
      for (const patch of args?.patches || []) {
        if (!this.add_ons.find((add_on) => add_on.name === patch.name)) {
          throw new Error(`The add-on ${patch.name} does not exist`);
        }
        let service = this.add_ons.find(
          (add_on) => add_on.name === patch.name
        ).service_name;
        console.log(service);
        if (!this.add_ons.find((add_on) => add_on.name === patch.name).service_name.includes(service_name)) {
          throw new Error(
            `The service ${service_name} does not have the add-on ${patch.name}`
          );
        }
      }
      let add_ons = args?.patches?.map(
        (patch) => this.patchConfigToAddonConfig(patch)
      );
      const config = {
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
        add_ons
      };
      const response = await this.postJob(service_name, config);
      return response;
    };
    this.patchConfigToAddonConfig = (patch_config) => {
      return {
        id: this.add_ons.find((add_on) => add_on.name === patch_config.name).id,
        config: {
          alpha_unet: patch_config.alpha_unet,
          alpha_text_encoder: patch_config.alpha_text_encoder,
          steps: patch_config.steps
        }
      };
    };
    this.costPatchTrainer = async (dataset, patch_name, args) => {
      const service_name = args?.service_name || "patch_trainer_v1";
      if (!this.services.find((service2) => service2.name === service_name)) {
        throw new Error(`The service ${service_name} does not exist`);
      }
      const service_interface = this.services.find(
        (service2) => service2.name === service_name
      ).interface;
      if (service_interface !== "train-patch-stable-diffusion") {
        throw new Error(
          `The service ${service_name} does not have the train-patch-stable-diffusion interface`
        );
      }
      await this.getAddOnList();
      if (!this.add_ons.find((add_on) => add_on.name === patch_name)) {
        throw new Error(`The add-on ${patch_name} does not exist`);
      }
      const trainerConfig = {
        dataset,
        patch_name,
        description: args?.description || "",
        learning_rate: args?.learning_rate || 1e-4,
        steps: args?.steps || 100,
        rank: args?.rank || 4
      };
      const service = this.services.find(
        (service2) => service2.name === service_name
      );
      if (!service) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.supabase.rpc(
        "get_service_config_cost_client",
        { p_service_id: service["id"], p_config: JSON.stringify(trainerConfig) }
      );
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.runPatchTrainer = async (dataset, patch_name, args) => {
      const service_name = args?.service_name || "patch_trainer_v1";
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
      if (this.add_ons.find((add_on) => add_on.name === patch_name)) {
        throw new Error(`The add-on ${patch_name} already exists`);
      }
      let is_creating = await this.rpc("app_user_is_creating_add_on", {
        p_add_on_name: patch_name
      });
      if (is_creating.data) {
        throw new Error(`There is already an ${patch_name} add-on being created`);
      }
      const trainerConfig = {
        dataset,
        patch_name,
        description: args?.description || "",
        learning_rate: args?.learning_rate || 1e-4,
        steps: args?.steps || 100,
        rank: args?.rank || 4
      };
      const response = await this.postJob(service_name, trainerConfig);
      return response;
    };
    this.shareAddOn = async (add_on_name, app_user_external_id) => {
      const my_add_on = this.add_ons.find(
        (add_on) => add_on.name === add_on_name
      );
      if (!my_add_on) {
        throw new Error(`The add-on ${add_on_name} does not exist`);
      }
      const { data, error } = await this.rpc("app_user_share_add_on", {
        p_add_on_id: my_add_on.id,
        p_app_user_external_id: app_user_external_id
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.deleteAddOn = async (add_on_name) => {
      const my_add_on = this.add_ons.find(
        (add_on) => add_on.name === add_on_name
      );
      if (!my_add_on) {
        throw new Error(`The add-on ${add_on_name} does not exist`);
      }
      const { data, error } = await this.rpc("app_user_delete_add_on", {
        p_add_on_id: my_add_on.id
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.renameAddOn = async (add_on_name, new_add_on_name) => {
      const my_add_on = this.add_ons.find(
        (add_on) => add_on.name === add_on_name
      );
      if (!my_add_on) {
        throw new Error(`The add-on ${add_on_name} does not exist`);
      }
      if (this.add_ons.find((add_on) => add_on.name === new_add_on_name)) {
        throw new Error(`The add-on ${new_add_on_name} already exists`);
      }
      let is_creating = await this.rpc("app_user_is_creating_add_on", {
        p_add_on_name: new_add_on_name
      });
      if (is_creating.data) {
        throw new Error(`There is already an ${new_add_on_name} add-on being created`);
      }
      const { data, error } = await this.rpc("app_user_rename_add_on", {
        p_add_on_id: my_add_on.id,
        p_new_name: new_add_on_name
      });
      await this.getAddOnList();
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
    this.getCountActiveWorker = async () => {
      const { data, error } = await this.supabase.rpc("get_active_worker_count", {
        p_worker_filter: this.worker_filter
      });
      if (error) {
        this.handle_error(error);
      }
      return data;
    };
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
}
const createSelasClient = async (credentials, worker_filter) => {
  const SUPABASE_URL = "https://lgwrsefyncubvpholtmh.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnd3JzZWZ5bmN1YnZwaG9sdG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk0MDE0MzYsImV4cCI6MTk4NDk3NzQzNn0.o-QO3JKyJ5E-XzWRPC9WdWHY8WjzEFRRnDRSflLzHsc";
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

export { PatchConfig, SelasClient, createSelasClient, createSelasClient as default };
