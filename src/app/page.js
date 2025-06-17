"use client";

import Head from "next/head";
import { useState } from "react";
import { VIDEO_COLLECTIONS } from "@/videos";

export default function Home() {
  const [collections] = useState(VIDEO_COLLECTIONS);
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

  return (
    <>
      <Head>
        <title>YouTube Video Collection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Navigation Header */}
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
                  : "No videos"}
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

          {/* Videos */}
          {currentCollection ? (
            <div className="space-y-24 pb-24">
              {currentCollection.videos.map((videoUrl, index) => (
                <div
                  key={`${currentCollection.date}-${index}`}
                  className="w-full"
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        videoUrl
                      )}`}
                      title={`Video ${index + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center text-gray-400">
              <p className="text-lg">No videos available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
