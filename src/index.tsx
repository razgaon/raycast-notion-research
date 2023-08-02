import { useEffect, useState } from "react";
import { showToast, Toast, ActionPanel, Detail, List, Icon, Color, Action, closeMainWindow } from "@raycast/api";
import { setTimeout } from "timers/promises";
import { ArxivClient, ArticleMetadata } from "arxivjs";
import { createPage } from "./notion/notion";
import { useDebounce } from "use-debounce";

export default function Command() {
  const client = new ArxivClient();

  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<Error>();
  const [debouncedText] = useDebounce(searchText, 800, { leading: true });
  const [articleMetadata, setArticleMetadata] = useState(null as ArticleMetadata | null);

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
      await setTimeout(500);
      closeMainWindow();
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
            <Action.Push title="Show Details" onPush={onPush} target={<Detail markdown="Created successfully!" />} />
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
