// import the postJob function from "../src/index"
import {
  createSpawnClient,
  SpawnClient,
  StableDiffusionConfig,
} from "../src/index";

import * as dotenv from "dotenv";

dotenv.config();

describe("testing spawn-js", () => {
  let spawn: SpawnClient;

  test("creation of client", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    expect(spawn).not.toBeNull();
    let data = await spawn.echo("hello");
    expect(data).not.toBeNull();
    expect(data).toBe("hello");
  });

  /**
   * Send a message to the spawn server and wait for the same message to be received.
   * @param message - The message to send.
   * @returns a text message which is the same as the input message.
   */

  test("getAppUserCredits", async () => {
    const data = await spawn.getAppUserCredits();
    expect(data).not.toBeNull();
  });

  test("getAppUserJobHistoryDetail", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.getAppUserJobHistory(10, 0);
    expect(data).not.toBeNull();
  });

  test("get service list", async () => {
    const data = await spawn.getServiceList();
    expect(data).not.toBeNull();
  });

  test("get add on list", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = spawn.getAddOnList();
    expect(data).not.toBeNull();
  });

  test("postJob", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.runStableDiffusion("A flying banana",{
      patches: [
        {
          name: 'Skippy Jack/f-boopboop',
          alpha_text_encoder: 0.5,
          alpha_unet: 0.5,
          steps: 1000,
        },
      ],
    });
    expect(data).not.toBeNull();
  });

  test("Get a config's cost for a job", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });

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
    const data = await spawn.getServiceConfigCost(
      "stable-diffusion-1-5",
      JSON.stringify(config)
    );
    expect(data).toBeDefined();
  });

  test("get the number of worker for this filter", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.getCountActiveWorker();
    expect(data).toBeDefined();
  });

  test("Create a patch", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    let dataset = [
      {
        url: "https://img.sanctuary.fr/fiche/origin/78.jpg",
        label:
          "fcompo style, a group of people standing next to each other, by Otomo Katsuhiro, french comic style, zenescope, complex emotion, cover corp",
      },
      {
        url: "https://ramenparados.com/wp-content/uploads/2020/10/Family-Compo-destacado.jpg",
        label:
          "fcompo style, a couple sitting on top of a red fire hydrant, a manga drawing, by Yumihiko Amano, shin hanga, city hunter, beautiful anime girl squatting, katsuhiro otomo and junji ito, realistic manga",
      },
      {
        url: "https://www.manga-news.com/public/images/pix/serie/4219/family-compo-visual-4.jpg",
        label:
          "fcompo style, a drawing of a woman bending over on a skateboard, a manga drawing, by Fujishima Takeji, pixiv, shin hanga, wearing a tank top and shorts, early 90s cg, ( ultra realistic ), portrait of mayuri shiina",
      },
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBexZRrbQC-wMlw3Y04K9KKPH_Mu0yX5sjrzHjybroJNtYEz-aVusWrPHAMJF1svM71QQ&usqp=CAU",
        label:
          "fcompo style, a drawing of a woman holding a baseball bat, inspired by Kusumi Morikage, pixiv, shin hanga, fully clothed. painting of sexy, あかさたなは on twitter, pin on anime, initial d",
      },
    ];

    const data = await spawn.runPatchTrainer(dataset, "f-compot7");
    expect(data).toBeDefined();
  });

  test("Share an add on", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.shareAddOn("f-compote3", "Bertrand");
    expect(data).toBeDefined();
  });

  test("Delete an add on", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.deleteAddOn("f-compo");
    expect(data).toBeDefined();
  });

  test("Rename an add on", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.renameAddOn("f-compote2", "f-compote3");
    expect(data).toBeDefined();
  });

  test("getResult", async () => {
    spawn = await createSpawnClient({
      app_id: process.env.TEST_APP_ID!,
      key: process.env.TEST_APP_KEY!,
      app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
      app_user_token: process.env.TEST_APP_USER_TOKEN!,
    });
    const data = await spawn.getResult("c97ac10a-f647-4ab7-a531-9a8708df1c8d");
    expect(data).not.toBeNull();
  });
});
