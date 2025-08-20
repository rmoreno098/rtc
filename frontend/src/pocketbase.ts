import PocketBase from "pocketbase";

const config: string = import.meta.env.VITE_POCKETBASE_URL;
const pb = new PocketBase(config);

export default pb;
