import { useEffect, useState } from "react";
import { useReadwiseFetch } from "./reader/index";
import { showToast, Toast, List } from "@raycast/api";
// import { setTimeout } from "timers/promises";
import { ArxivClient, ArticleMetadata } from "arxivjs";
import { createArticlePage, updateArticlePageReaderUrl } from "./notion/notion";
import { useDebounce } from "use-debounce";
import { ArticleItem } from "./components/articleItem";
import { ReaderRequestBody, ReaderResponse } from "./reader/types";
import { addReferencesToPage } from "./semanticScholar";

export default function Command() {
  const client = new ArxivClient();

  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<Error>();
  const [debouncedText] = useDebounce(searchText, 1000, { leading: true });
  const [articleMetadata, setArticleMetadata] = useState(null as ArticleMetadata | null);
  const [body, setBody] = useState({} as ReaderRequestBody);
  const [pageId, setPageId] = useState("");

  const readerResponse: ReaderResponse = useReadwiseFetch(body);

  useEffect(() => {
    async function updateUrl() {
      try {
        if (body && body.url !== "" && pageId !== "") {
          console.log("Updating page with URL: ", readerResponse.url);
          await updateArticlePageReaderUrl(pageId, body.url);
          // await addReferencesToPage(body);
        }
      } catch (e: any) {
        setError(e);
      }
    }

    updateUrl();
  }, [body]);

  useEffect(() => {
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
    if (!articleMetadata) return;

    const res = await createArticlePage(articleMetadata);
    setPageId(res.id);

    const readerRequestbody: ReaderRequestBody = {
      category: "pdf",
      url: articleMetadata.pdf.replace(/^http:/, "https:"), // Replace only the "http:" part of the URL with "https:"
      tags: [...articleMetadata.categoryNames],
      title: articleMetadata.title,
      summary: articleMetadata.summary,
      author: articleMetadata.authors[0],
      published_at: articleMetadata.date,
    };

    // Add the journal to tags if it is not "None"
    if (articleMetadata.journal !== "None") {
      readerRequestbody.tags.push(articleMetadata.journal);
    }

    setBody(readerRequestbody);
  };

  return (
    <List
      navigationTitle="Search Tasks"
      searchBarPlaceholder="Search your task"
      onSearchTextChange={setSearchText}
      throttle={true}
    >
      <ArticleItem articleMetadata={articleMetadata} onPush={onPush} />
    </List>
  );
}
