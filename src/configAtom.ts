import { atomWithStorage } from "jotai/utils";

const defaultConfig = {
    baseURL: "https://api.openai.com/v1",
    apiKey: "",
    temperature: 0.7,
    model: "gpt-4o",
}

const configAtom = atomWithStorage("demo-config", defaultConfig);

export { configAtom };
