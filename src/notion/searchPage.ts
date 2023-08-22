import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";
import { Preferences } from "../config/index";

const preferences = getPreferenceValues<Preferences>();

const notion = new Client({ auth: preferences.notionApiKey });

export async function searchPages(query: string) {
  const response = await notion.search({
    query: query,
    filter: {
      value: "page",
      property: "object",
    },
    sort: {
      direction: "ascending",
      timestamp: "last_edited_time",
    },
  });

  return response.results;
}
