import { SearchedStory } from "./Story";

export interface StorySearchResult {
  stories: SearchedStory[];
  pageCount: number;
}
