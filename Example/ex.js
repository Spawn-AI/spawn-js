const createSelasClient = require("../dist/index.cjs").createSelasClient;

const generateImage = async () => {
    const selas = await createSelasClient(
        {
          app_id: "ad2f7854-d3d5-418b-bcc6-e61a1779f985",
          key: "g6K-v2VW5C+5r$MG",
          app_user_external_id: "0xB740257c15bABb2b4F002Bf884b13C7aC648Be60",
          app_user_token: "ZG(znqsZL5oDUtUj"
        }
      );
      let text = await selas.echo({message : "hello"});
    console.log(text);
    await selas.runStableDiffusion("A flying banana");
}
generateImage();