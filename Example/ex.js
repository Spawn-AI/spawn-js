const createSelasClient = require("../dist/index.cjs").createSelasClient;

const generateImage = async () => {
    const selas = await createSelasClient(
        {
          app_id: "4aabad12-8f3d-46bc-b1f5-d830a1fc6ced",
          key: "0mm6k$dbP%+8we2@",
          app_user_external_id: "packing",
          app_user_token: "awg&W&Jynhg7P-6z"
        }
      );
      let text = await selas.echo({message : "hello"});
    console.log(text);
    await selas.runStableDiffusion("A flying banana");
}
generateImage();