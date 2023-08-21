import { Client } from "@notionhq/client";
import { getPreferenceValues } from "@raycast/api";
import { ArticleMetadata } from "arxivjs";
import { Status } from "./config";
import { Preferences } from "../config/index";
import { splitTextAndEquations } from "./utils";
import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";

const preferences = getPreferenceValues<Preferences>();

const notion = new Client({ auth: preferences.notionApiKey });

export async function createArticleNotionPage(articleMetadata: ArticleMetadata): string {
  const { authors, categoryNames, id, journal, pdf, summary, title } = articleMetadata;

  // Get only the date
  const date = new Date(articleMetadata.date).toISOString().split("T")[0];

  const response = await notion.pages.create({
    parent: { database_id: preferences.databaseKey },
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
      Date: {
        date: { start: date },
      },
    },
    children: [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Abstract" } }],
          color: "yellow",
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: splitTextAndEquations(summary.trim()),
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              annotations: {
                bold: true,
              },
              text: {
                content: authors.join(", "),
              },
            },
          ],
        },
      },
    ],
  });

  return response.id;
}

export async function updateArticlePageReaderUrl(pageId: string, readerUrl: string) {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      "Reader Url": {
        url: readerUrl,
      },
    },
  });
}
