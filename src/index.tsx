import { useEffect, useState } from "react";
import { useReadwiseFetch } from "./readwise/index";
import { showToast, Toast, ActionPanel, Detail, List, Icon, Color, Action } from "@raycast/api";
// import { setTimeout } from "timers/promises";
import { ArxivClient, ArticleMetadata } from "arxivjs";
import { createPage } from "./notion/notion";
import { useDebounce } from "use-debounce";

export default function Command() {
  const client = new ArxivClient();

  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<Error>();
  const [debouncedText] = useDebounce(searchText, 1000, { leading: true });
  const [articleMetadata, setArticleMetadata] = useState(null as ArticleMetadata | null);
  const [body, setBody] = useState("");

  useReadwiseFetch(body);

  useEffect(() => {
    // This extension is made for copy paste, otherwise it calls the api too often.
    async function getArticle() {
      try {
        const articleMetadata: ArticleMetadata = await client.getArticle(debouncedText);
        setArticleMetadata(articleMetadata);
      } catch (e: any) {
        setError(e);
      }
    }

    getArticle();
  }, [debouncedText]);

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Something went wrong",
        message: error.message,
      });
    }
  }, [error]);

  const onPush = async () => {
    if (articleMetadata) {
      // Send to reader
      createPage(articleMetadata);

      const body = {
        category: "pdf",
        url: articleMetadata.pdf,
        tags: [...articleMetadata.categoryNames],
        title: articleMetadata.title,
        summary: articleMetadata.summary,
        author: articleMetadata.authors[0],
        published_at: articleMetadata.date,
      };

      if (articleMetadata.journal !== "None") {
        body.tags.push(articleMetadata.journal);
      }

      setBody(JSON.stringify(body));
    }
  };

  return (
    <List
      navigationTitle="Search Tasks"
      searchBarPlaceholder="Search your task"
      onSearchTextChange={setSearchText}
      throttle={true}
    >
      <List.Item
        icon="list-icon.png"
        title={articleMetadata?.title ?? "No papers yet..."}
        actions={
          <ActionPanel>
            <Action.Push
              title="Show Details"
              onPush={() => onPush()}
              target={<Detail markdown="Page created successfully!" />}
            />
          </ActionPanel>
        }
        accessories={[
          {
            text: { value: articleMetadata?.authors ? articleMetadata?.authors[0] : "", color: Color.Orange },
            icon: Icon.Person,
          },
          {
            tag: {
              value: articleMetadata?.categoryNames ? articleMetadata.categoryNames[0] : "",
              color: Color.Magenta,
            },
            icon: Icon.Stars,
          },
        ]}
      />
    </List>
  );
}
