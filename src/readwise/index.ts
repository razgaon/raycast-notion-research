import { useFetch as useRayFetch } from "@raycast/utils";
import { getPreferenceValues } from "@raycast/api";
import { Preferences } from "../config/index";

const readerUrl = "https://readwise.io/api/v3/save/";

const preferences = getPreferenceValues<Preferences>();

const READWISE_API_KEY = preferences.readerApiKey;

export const useReadwiseFetch = (body: string) => {
  const reqBody = {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${READWISE_API_KEY}`,
    },
    execute: READWISE_API_KEY && body ? true : false,
  };
  console.log(reqBody);
  const res = useRayFetch(readerUrl, reqBody);

  return res;
}; 
