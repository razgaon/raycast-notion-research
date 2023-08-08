import { ReaderResponse } from "../reader/types";
import { fetchPapers } from "./api";

export function addReferencesToPage(paperData: ReaderResponse) {
  // Fetch papers
  // Check that they don't exist already on notion page
  // Add papers to Notion page as a list of links for starters
  console.log(fetchPapers(paperData.url));
}
