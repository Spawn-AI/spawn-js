import { createClient } from '@supabase/supabase-js';
import Pusher from 'pusher-js';

class SelasClient {
  constructor(supabase, app_id, key, app_user_id, app_user_token, worker_filter) {
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
    this.getServiceList = async () => {
      const { data, error } = await this.rpc("app_user_get_services", {});
      if (data) {
        this.services = data;
      }
      return { data, error };
    };
    this.echo = async (args) => {
      return await this.rpc("app_user_echo", { message_app_user: args.message });
    };
    this.getAppUserCredits = async () => {
      const { data, error } = await this.rpc("app_user_get_credits", {});
      return { data, error };
    };
    this.getAppUserJobHistory = async (args) => {
      const { data, error } = await this.rpc("app_user_get_job_history_detail", {
        p_limit: args.limit,
        p_offset: args.offset
      });
      return { data, error };
    };
    this.postJob = async (args) => {
      const service = this.services.find((service2) => service2.name === args.service_name);
      if (!service) {
        throw new Error("Invalid model name");
      }
      const { data, error } = await this.rpc("app_owner_post_job_admin", {
        p_service_id: service["id"],
        p_job_config: JSON.stringify(args.job_config),
        p_worker_filter: this.worker_filter
      });
      return { data, error };
    };
    this.subscribeToJob = async (args) => {
      const client = new Pusher("n", {
        cluster: "eu"
      });
      const channel = client.subscribe(`job-${args.job_id}`);
      channel.bind("result", args.callback);
    };
    this.runStableDiffusion = async (args, model_name) => {
      const response = await this.postJob({
        service_name: model_name,
        job_config: args
      });
      if (response.error) {
        return { data: null, error: response.error };
      } else {
        return { data: response.data, error: null };
      }
    };
    this.supabase = supabase;
    this.app_id = app_id;
    this.key = key;
    this.app_user_id = app_user_id;
    this.app_user_token = app_user_token;
    this.worker_filter = worker_filter || { branch: "prod" };
    this.services = [];
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
    credentials.app_user_id,
    credentials.app_user_token,
    worker_filter
  );
  await selas.getServiceList();
  return selas;
};

export { SelasClient, createSelasClient, createSelasClient as default };
