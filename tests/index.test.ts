// import the postJob function from "../src/index"
import {getAppUserJobHistoryDetail,getAppUserCredits,postJob, StableDiffusionConfig} from "../src/index";

import * as dotenv from "dotenv";

dotenv.config();

describe("testing selas-js", () => {
    test("getAppUserJobHistoryDetail", async() => {
        const{data, error} = await getAppUserJobHistoryDetail({app_id: process.env.TEST_APP_ID!,
                        key: process.env.TEST_APP_KEY!,
                        app_user_id: process.env.TEST_APP_USER_ID!,
                        app_user_token: process.env.TEST_APP_USER_TOKEN!,
                        limit: 10,
                        offset: 0});
        expect (error).toBeNull();
        expect (data).not.toBeNull();
    });

    test("getAppUserCredits", async() => {
        const{data, error} = await getAppUserCredits({app_id: process.env.TEST_APP_ID!,
                        key: process.env.TEST_APP_KEY!,
                        app_user_id: process.env.TEST_APP_USER_ID!,
                        app_user_token: process.env.TEST_APP_USER_TOKEN!});
        expect (error).toBeNull();
        expect (data).not.toBeNull();
    });

    test("postJob", async() => {
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

        const {data, error} = await postJob({app_id: process.env.TEST_APP_ID!,
                        key: process.env.TEST_APP_KEY!,
                        app_user_id: process.env.TEST_APP_USER_ID!,
                        app_user_token: process.env.TEST_APP_USER_TOKEN!,

                        service_id: "04cdf9c4-5338-4e32-9e63-e15b2150d7f9",
                        job_config: config,
                        worker_filter: {branch: "prod"}
                    });
        expect (error).toBeNull();
        expect (data).not.toBeNull();

    });
});
