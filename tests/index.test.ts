// import the postJob function from "../src/index"
import {createSelasClient, SelasClient, StableDiffusionConfig,PatchConfig} from "../src/index";

import * as dotenv from "dotenv";

dotenv.config();

describe("testing selas-js", () => {

    let selas: SelasClient;

    test("creation of client", async () => {
      selas = await createSelasClient(
        {
          app_id: process.env.TEST_APP_ID!,
          key: process.env.TEST_APP_KEY!,
          app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
          app_user_token: process.env.TEST_APP_USER_TOKEN!
        }
      );
      expect(selas).not.toBeNull();
      let data = await selas.echo({message : "hello"});
      expect (data).not.toBeNull();
      expect (data).toBe("hello");
    });

    /**
     * Send a message to the selas server and wait for the same message to be received.
     * @param message - The message to send.
     * @returns a text message which is the same as the input message.
     */

    test("getAppUserCredits", async() => {
        const data = await selas.getAppUserCredits();
        expect (data).not.toBeNull();
    });

    test("getAppUserJobHistoryDetail", async() => {
        const data = await selas.getAppUserJobHistory({limit: 10, offset: 0});
        expect (data).not.toBeNull();
    });

    test("get service list", async() => {
        const data = await selas.getServiceList();
        expect (data).not.toBeNull();
    });

    test("postJob", async() => {
      selas = await createSelasClient(
        {
          app_id: process.env.TEST_APP_ID!,
          key: process.env.TEST_APP_KEY!,
          app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
          app_user_token: process.env.TEST_APP_USER_TOKEN!
        }
      );
      const data = await selas.runStableDiffusion("A flying banana",{patches: [PatchConfig("test-patch")]});
      expect (data).not.toBeNull();

    });

    test("Get a config's cost for a job", async () => {
        selas = await createSelasClient(
            {
              app_id: process.env.TEST_APP_ID!,
              key: process.env.TEST_APP_KEY!,
              app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
              app_user_token: process.env.TEST_APP_USER_TOKEN!
            }
          );
    
        const config: StableDiffusionConfig = {
          steps: 28,
          skip_steps: 0,
          batch_size: 1,
          sampler: "k_euler",
          guidance_scale: 10,
          width: 512,
          height: 512,
          prompt: "banana in the kitchen",
          negative_prompt: "ugly",
          image_format: "jpeg",
          translate_prompt: false,
          nsfw_filter: false,
        };
        const data = await selas.getServiceConfigCost({ service_name: "stable-diffusion-1-5", job_config: JSON.stringify(config)});
        expect(data).toBeDefined();
      });

    test("get the number of worker for this filter", async () => {
      selas = await createSelasClient(
        {
          app_id: process.env.TEST_APP_ID!,
          key: process.env.TEST_APP_KEY!,
          app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
          app_user_token: process.env.TEST_APP_USER_TOKEN!
        }
      );
      const data = await selas.getCountActiveWorker();
      expect(data).toBeDefined();
    });

    test("Share an add on", async () => {
      selas = await createSelasClient(
        {
          app_id: process.env.TEST_APP_ID!,
          key: process.env.TEST_APP_KEY!,
          app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
          app_user_token: process.env.TEST_APP_USER_TOKEN!
        }
      );
      const data = await selas.shareAddOn({ app_user_external_id: "Skippy Jack" , add_on_name: 'test-patch' });
      expect(data).toBeDefined();
    });
    
    test("getResult", async() => {
      selas = await createSelasClient(
        {
          app_id: process.env.TEST_APP_ID!,
          key: process.env.TEST_APP_KEY!,
          app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
          app_user_token: process.env.TEST_APP_USER_TOKEN!
        }
      );
      const data = await selas.getResult("c97ac10a-f647-4ab7-a531-9a8708df1c8d");
      expect (data).not.toBeNull();
    });
});