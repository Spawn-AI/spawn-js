# spawn JS

A Node.js implementation of the spawn protocol to let your customers use our AI services through your application.

## Overview

The spawn JS module is a Node.js implementation of the spawn protocol. It allows you to run jobs on the spawn platform from your javascript code. The spawn Node module is available on [npm](https://www.npmjs.com/package/@spawn/spawn-js). You can find the source code for the spawn JS module on [GitHub](https://github.com/SpawnAI/spawn-js). The spawn js module is licensed under the [MIT License](https://opensource.org/licenses/MIT). The spawn Node module is currently in beta, so please report any bugs or issues you encounter.

## Installation

To install the spawn js module, you can run the following command in your terminal:
```bash
npm install @spawn/spawn-js
```

## Usage

To use the spawn js module, you need to require it in your JavaScript code and create a spawn client object. To get started, you need to create a spawn account and create an app. You can find more information about creating a spawn account and creating an app in the [spawn documentation](https://spawn.ai/docs/). Once you have created an app, you can create a new user for you customer using the spawn Node Client, set the associated token and let your customer use our services.


```js
const spawn = require('@spawn/spawn-js');


const client = await createSpawnClient({
    app_id: process.env.TEST_APP_ID!,
    key: process.env.TEST_APP_KEY!,
    app_user_external_id: process.env.TEST_APP_USER_EXTERNAL_ID!,
    app_user_token: process.env.TEST_APP_USER_TOKEN!,
});
```

### Usage of IA services

spawn-js have all the needed methods for running jobs on the spawn platform.

To know how many workers are active on the spawn platform, you can use the getCountActiveWorker method. It will return the number of workers for each service.
```js
let workers = await client.getCountActiveWorker();
```

#### Fetching informations about what you can do

To know what services are available to this application user on the spawn platform, you can use the getServiceList method. It will return a list of services.
```js
let services = await client.getServiceList();
```
To know what add-ons are available to this application user on the spawn platform, you can use the getAddonList method. It will return a list of add-ons.
```js
let services = client.getAddonList();
```

Credits are necessary to run jobs on the spawn platform. To know how many credits are available to this application user on the spawn platform, you can use the getAppUserCredits method. It will return the number of credits.
```js
let credits = await client.getAppUserCredits();
```

#### Running an image generation job

The following example shows how to run a stable diffusion job with minimal parameters.

```js
const response = await client.runStableDiffusion("a cute cat");
```

To get the cost of a job without running it, you can use the costStableDiffusion method. Its syntax is exactly the same as runStableDiffusion.

```js
const cost = await client.costStableDiffusion("a cute cat");
```

```js

It is possible to specify additional parameters for the jobs. Those parameters are defined in this list :
```js
/**
  * @param prompt - the description of the image to be generated
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
  */
```

To specify those parameters, you can use the runStableDiffusion method and pass in an object with the parameters you want to change as arguments.

```js
const response = await client.runStableDiffusion("a cute cat",{width: 640, height: 384, image_format: "jpeg"});
```

More specific at our plateform, you can alter your jobs by using one or multiple add-ons that are have been trained or shared to your application.
```js
const response = await client.runStableDiffusion("a cute cat",{patches: [
      {
        name: 'Serge/chinese_landscape',
        alpha_text_encoder: 0.5,
        alpha_unet: 0.5,
        steps: 1000,
      },
    ],});
```

The response object will contain the job_id of the job that was created. You can use this job_id to check the status of the job and to retrieve the results of the job. This result can take a few second to be produced.

```js
const result = await client.getResult(response['job_id']);
```

You can also subscribe to the job by calling the subscribeToJob method on the spawn client object and passing in an object with the job_id and a callback function as arguments. The callback function will be called whenever new data is available for the job:

```js
const response = await client.runStableDiffusion("a cute cat");

if (response) {
    await client.subscribeToJob(
      response['job_id'],
      function (data) {console.log(data);}
    );
} else {
    console.log(response.error);
}
```

#### Running a patch creation job

The following example shows how to run a patch creation job with minimal parameters.

```js
    spawn = await createSpawnClient(
      {
        app_id: process.env.TEST_APP_ID!,
        key: process.env.TEST_APP_KEY!,
        secret: process.env.TEST_APP_SECRET!,
      },
      { branch: "main" }
    );
    let dataset = [
      {
        url: "https://img.sanctuary.fr/fiche/origin/78.jpg",
        label: "fcompo style, a group of people standing next to each other, by Otomo Katsuhiro, french comic style, zenescope, complex emotion, cover corp"
      },
      {
        url: "https://ramenparados.com/wp-content/uploads/2020/10/Family-Compo-destacado.jpg",
        label: "fcompo style, a couple sitting on top of a red fire hydrant, a manga drawing, by Yumihiko Amano, shin hanga, city hunter, beautiful anime girl squatting, katsuhiro otomo and junji ito, realistic manga"
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
    const data = await spawn.runPatchTrainer(dataset, "f-compo style");
    expect(data).toBeDefined();
```

To get the cost of a job without posting it, you can use the costPatchTrainer method. Its syntax is the same as the runPatchTrainer method.

```js
const data = await spawn.costPatchTrainer(dataset, "f-compo style");
```

To train a patch, you need a list of images and label that will be used to train the patch. They will alter the stable diffusion model to generate images that are similar to the images you provide. The label is used to describe the images you provide. It can be a sentence or a list of words.

#### Fetching the user's results and your history

You can fetch the results of the user's jobs by using the getAppUserJobHistory method. This method takes two arguments: the limit and the offset. The limit is the number of jobs you want to fetch and the offset is the number of jobs you want to skip. The offset is useful if you want to paginate the results.

```js
let results = client.getResult(job_id);
```

To have a real time update on the job completion, you can use the subscribeToJob method. This method takes two arguments: the job_id and a callback function. The callback function will be called whenever new data is available for the job.
```js
const response = await client.runStableDiffusion("a cute cat");

if (response) {
    await client.subscribeToJob({
      job_id: response['job_id'],  
      callback: function (data) {
        console.log(data);
      },
    });
} else {
    console.log(response.error);
}
```

It is possible to get the history of the user's jobs by using the getAppUserJobHistory method. This method takes two arguments: the limit and the offset. The limit is the number of jobs you want to fetch and the offset is the number of jobs you want to skip. The offset is useful if you want to paginate the results. It allows to fetch a list of jobs that can be image creating jobs or patch creation jobs.

```js
getAppUserJobHistory = async (limit: number, offset: number)
```

#### Managing the user's add-on

You can manage the user's add-on by using the following methods:

```js
const is_renamed = await spawn.renameAddOn('landscape add-on', 'forest add-on');

const is_shared = await spawn.shareAddOn('forest add-on', 'Benoit');

const is_deleted = await spawn.deleteAddOn('forest add-on');
```

## Documentation

For more information about the spawn js module, please refer to the [spawn Node documentation](https://spawn.ai/docs/spawn-node).

