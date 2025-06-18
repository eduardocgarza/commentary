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

// Updated collections with mixed content
const CONTENT_COLLECTIONS = [
  {
    date: "2025-06-17",
    content: [
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=pOsFdlStD7U",
      },
      {
        type: "tweet",
        id: "1935027868108722458", // Your NiohBerg tweet
      },
      {
        type: "youtube",
        url: "https://www.youtube.com/watch?v=3XXJyE2lIT8",
      },
      {
        type: "tweet",
        id: "1732824684683784516", // SpaceX tweet
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
  const [collections] = useState(CONTENT_COLLECTIONS);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const getYouTubeId = (url) => {
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
    if (item.type === "youtube") {
      return (
        <div key={`${currentCollection.date}-${index}`} className="w-full">
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(item.url)}`}
              title={`Video ${index + 1}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      );
    } else if (item.type === "tweet") {
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
            <div className="flex items-center justify-center space-x-8">
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

          {/* Content */}
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
