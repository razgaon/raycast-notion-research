import { FIELDS, LIMIT } from "./config";

export async function fetchPapers(paperId: string) {
  try {
    const url = `https://api.semanticscholar.org/graph/v1/paper/${paperId}/references`;
    const params = {
      fields: FIELDS.join(","),
      offset: "0",
      limit: `${LIMIT}`,
    };

    const queryString = new URLSearchParams(params).toString();
    const fullUrl = `${url}?${queryString}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const data = await response.json();
    // Handle the data here
    console.log(data);
  } catch (error) {
    // Handle any errors here
    console.error("An error occurred:", error);
  }
}
