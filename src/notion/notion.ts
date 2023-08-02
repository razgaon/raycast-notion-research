import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";
import { ArticleMetadata } from "arxivjs";
import { Status } from "./config";
import { Preferences } from "../config/index";

const preferences = getPreferenceValues<Preferences>();

const notion = new Client({ auth: preferences.notionApiKey });

export async function createPage(articleMetadata: ArticleMetadata) {
  const { authors, categoryNames, id, journal, pdf, summary, title } = articleMetadata;
  console.log([...categoryNames.map((x) => ({ name: x }))]);
  const response = await notion.pages.create({
    parent: { database_id: "5b11757fc71f44b9ab2326f211280730" },
    icon: {
      emoji: "📄",
    },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Tags: {
        multi_select: [],
      },
      Category: {
        multi_select: [...categoryNames.map((x) => ({ name: x }))],
      },
      Authors: {
        multi_select: [...authors.map((x) => ({ name: x }))],
      },
      Status: {
        status: {
          name: Status.NotRead,
        },
      },
      URL: {
        url: pdf,
      },
    },
    children: [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Abstract" } }],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: summary,
              },
            },
          ],
        },
      },
    ],
  });
  console.log(response);
}
