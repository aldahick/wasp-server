export interface Story {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  url: string;
  isFavorite: boolean;
  body: string;
  seriesId: number | undefined;
}

export type SearchedStory = Pick<Story, "id" | "categoryId" | "title" | "description" | "url">;
export type SingleStory = Pick<Story, "id" | "title" | "url" | "isFavorite" | "body">;
