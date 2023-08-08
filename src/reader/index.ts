import { useFetch as useRayFetch } from "@raycast/utils";
import { getPreferenceValues } from "@raycast/api";
import { Preferences } from "../config/index";
import { ReaderRequestBody, ReaderResponse } from "./types";

const readerUrl = "https://readwise.io/api/v3/save/";

const preferences = getPreferenceValues<Preferences>();

const READWISE_API_KEY = preferences.readerApiKey;

export const useReadwiseFetch = (readerRequestBody: ReaderRequestBody): ReaderResponse => {
  const reqBody = {
    method: "POST",
    body: JSON.stringify(readerRequestBody),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${READWISE_API_KEY}`,
    },
    execute: READWISE_API_KEY && Object.keys(readerRequestBody).length > 0 ? true : false,
  };

  const res = useRayFetch(readerUrl, reqBody);

  return res.data as ReaderResponse;
};
