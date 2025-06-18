"use client";

import Head from "next/head";
import { useState, useEffect } from "react";

// Simple Tweet component
function TweetEmbed({ tweetId, className = "" }) {
  useEffect(() => {
    if (typeof window !== "undefined" && !window.twttr) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    } else if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, []);

  return (
    <div className="tweet-container">
      <blockquote className="twitter-tweet">
        <a href={`https://twitter.com/user/status/${tweetId}`}>
          Loading tweet...
        </a>
      </blockquote>
    </div>
  );
}

// Function to fetch and parse CSV from Google Sheets
async function fetchContentFromGoogleSheets() {
  try {
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/1KlDa8W1Y6ZOUt_8t2rLcy4-WwG36JikOSKFWPF3_T5M/export?format=csv&gid=0";

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return []; // No data rows

    // Get headers and clean them
    const headers = lines[0]
      .split(",")
      .map((h) => h.replace(/"/g, "").trim().toLowerCase());

    // Group content by date
    const collections = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV row (handle commas inside quotes)
      const values = parseCSVRow(line);
      if (values.length < headers.length) continue;

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : "";
      });

      const date = row.date;
      const type = row.type;
      const url = row.url;
      const id = row.id;

      if (!date || !type) continue;

      if (!collections[date]) {
        collections[date] = [];
      }

      collections[date].push({
        type: type,
        url: type === "youtube" ? url : undefined,
        id: type === "tweet" ? id : undefined,
      });
    }

    // Convert to array format and sort by date (most recent first)
    return Object.entries(collections)
      .map(([date, content]) => ({ date, content }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    throw error;
  }
}

// Helper function to parse CSV row (handles commas inside quotes)
function parseCSVRow(row) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((field) => field.replace(/"/g, ""));
}

// Fallback data in case sheets fails
const FALLBACK_COLLECTIONS = [
  {
    date: "2025-06-17",
    content: [
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=pOsFdlStD7U",
      },
      {
        type: "tweet",
        id: "1935027868108722458",
      },
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=3XXJyE2lIT8",
      },
      {
        type: "tweet",
        id: "1732824684683784516",
      },
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=JhJ9WO5nlu4",
      },
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=kQl371f4F0E",
      },
    ],
  },
];

export default function Home() {
  const [collections, setCollections] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch content from Google Sheets
  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchContentFromGoogleSheets();

        if (data.length > 0) {
          setCollections(data);
          setLastFetch(new Date());
        } else {
          // Use fallback if no data
          setCollections(FALLBACK_COLLECTIONS);
          setError("No data found in sheets, using fallback");
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(`Failed to load from sheets: ${err.message}`);
        setCollections(FALLBACK_COLLECTIONS);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();

    // Refresh every 5 minutes
    const interval = setInterval(fetchContent, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentCollection = collections[currentDayIndex];
  const hasPrevious = currentDayIndex < collections.length - 1;
  const hasNext = currentDayIndex > 0;

  const goToPrevious = () => {
    if (hasPrevious) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const renderContent = (item, index) => {
    if (item.type === "youtube" && item.url) {
      const videoId = getYouTubeId(item.url);
      if (!videoId) return null;

      return (
        <div key={`${currentCollection.date}-${index}`} className="w-full">
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Video ${index + 1}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      );
    } else if (item.type === "tweet" && item.id) {
      return (
        <div
          key={`${currentCollection.date}-${index}`}
          className="flex justify-center"
        >
          <div className="rounded-xl overflow-hidden flex-1 mx-auto">
            <TweetEmbed tweetId={item.id} />
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500 text-lg">
          Loading content from Google Sheets...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Content Collection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          .tweet-container .twitter-tweet {
            width: 100% !important;
            max-width: none !important;
            margin: 0 auto !important;
          }
          .tweet-container .twitter-tweet iframe {
            width: 100% !important;
            max-width: none !important;
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white py-8 z-10">
          <div className="flex items-center justify-center space-x-8 relative">
            {/* Status indicators */}
            {error && (
              <div className="absolute top-0 right-4 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm">
                Using fallback data
              </div>
            )}
            {lastFetch && !error && (
              <div className="absolute top-0 right-4 bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
                ✓ Synced with sheets
              </div>
            )}

            <button
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                hasPrevious
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h1 className="text-3xl font-light text-gray-700 tracking-wide min-w-0">
              {currentCollection
                ? formatDate(currentCollection.date)
                : "No content"}
            </h1>

            <button
              onClick={goToNext}
              disabled={!hasNext}
              className={`p-3 rounded-full transition-colors cursor-pointer ${
                hasNext
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          {currentCollection ? (
            <div className="space-y-24 pb-24">
              {currentCollection.content.map((item, index) =>
                renderContent(item, index)
              )}
            </div>
          ) : (
            <div className="py-32 text-center text-gray-400">
              <p className="text-lg">No content available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
