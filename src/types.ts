export interface FeedSource {
  name: string;
  url: string;
  category: string;
}

export interface IngestedItem {
  title: string;
  url: string;
  domain: string;
  publisher: string;
  publishedAt: Date;
  tags: string[];
  snippet?: string;
  fullText?: string;
  accessible: boolean;
}

export interface StoryCandidate {
  key: string;
  items: IngestedItem[];
  topic: string;
  score: number;
}

export interface DraftThread {
  title: string;
  tweets: string[];
  sourceUrls: string[];
  confidence: number;
}
