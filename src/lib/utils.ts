import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// fake fetch with delay to simulate real API calls
export const customFakeFetch = async (
  endpoint: string,
  options: RequestInit = {},
  delayMs: number = 0,
) => {
  let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/${endpoint}`;
  const delay = new Promise((resolve) => setTimeout(resolve, delayMs));
  const [response] = await Promise.all([fetch(url, options), delay]);

  if (!response.ok) throw new Error("Request Failed");

  // Check if the response is JSON
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  return isJson ? response.json() : response.text();
};
