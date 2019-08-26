import { Story } from "../../collections/Stories";

export interface StorySearchResult {
  stories: Story[];
  pageCount: number;
}
