import { useEffect, useState, useCallback } from "react";
import { addToReadwise } from "./reader/index";
import { showToast, Toast, List, getPreferenceValues } from "@raycast/api";
import { ArxivClient, ArticleMetadata } from "arxivjs";
import { createArticleNotionPage, updateArticlePageReaderUrl } from "./notion/createArticlePage";
import { addReferencesToNotion } from "./notion/addReferencesToPage";
import { useDebounce } from "use-debounce";
import { ArticleItem } from "./components/articleItem";
import { ReaderRequestBody } from "./reader/types";
import { fetchPapers, parsePapers } from "./semanticScholar/api";
import { DataItem } from "./semanticScholar/types";
import { Preferences } from "./config/index";
import { filterArxivUrls } from "./utils/urlExtractor";

const preferences = getPreferenceValues<Preferences>();
const READWISE_API_KEY = preferences.readerApiKey;

function createReaderRequestBody(article: ArticleMetadata): ReaderRequestBody {
  const readerRequestbody: ReaderRequestBody = {
    title: article.title,
    category: "pdf",
    url: article.pdf.replace(/^http:/, "https:"),
    tags: [...article.categoryNames],
    summary: article.summary,
    author: article.authors[0],
    published_at: article.date,
  };

  if (article.journal !== "None") {
    readerRequestbody.tags.push(article.journal);
  }

  return readerRequestbody;
}

export default function Command() {
  const client = new ArxivClient();

  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState<Error>();
  const [debouncedText] = useDebounce(searchText, 1000, { leading: true });
  const [articlesMetadata, setArticlesMetadata] = useState<ArticleMetadata[]>([]);
  const [readerRequestBodies, setReaderRequestBodies] = useState<ReaderRequestBody[]>([]);
  const [notionPageIds, setNotionPageIds] = useState<string[]>([]);

  const updateUrl = useCallback(async (body: ReaderRequestBody, pageId: string) => {
    try {
      if (body && body.url !== "" && pageId !== "") {
        if (READWISE_API_KEY && Object.keys(body).length > 0) {
          const readwiseUrl = await addToReadwise(body);
          await updateArticlePageReaderUrl(pageId, readwiseUrl.url);
        }

        const referencesResponse: DataItem[] = await fetchPapers(body.url);
        await addReferencesToNotion(pageId, parsePapers(referencesResponse));
      }
    } catch (e: any) {
      setError(e);
    }
  }, []);

  useEffect(() => {
    Promise.all(readerRequestBodies.map((body, index) => updateUrl(body, notionPageIds[index])));
  }, [readerRequestBodies, notionPageIds, updateUrl]);

  const getArticles = useCallback(async (urls: string[]) => {
    try {
      const articleMetadatas = await Promise.all(urls.map((url) => client.getArticle(url)));
      setArticlesMetadata(articleMetadatas);
    } catch (e: any) {
      setError(e);
    }
  }, []);

  useEffect(() => {
    const articleUrls = filterArxivUrls(debouncedText);
    console.log(articleUrls);
    getArticles(articleUrls);
  }, [debouncedText, getArticles]);

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Something went wrong",
        message: error.message,
      });
    }
  }, [error]);

  const handleArticlePush = async () => {
    const readerRequestBodies = articlesMetadata.map((article) => createReaderRequestBody(article));
    const pageIds = await Promise.all(articlesMetadata.map((article) => createArticleNotionPage(article)));

    setReaderRequestBodies(readerRequestBodies);
    setNotionPageIds(pageIds);
  };

  return (
    <List
      navigationTitle="Search Papers"
      searchBarPlaceholder="Search your paper"
      onSearchTextChange={setSearchText}
      throttle={true}
    >
      {articlesMetadata.map((article, index) => (
        <ArticleItem key={index} articleMetadata={article} onPush={handleArticlePush} />
      ))}
    </List>
  );
}
