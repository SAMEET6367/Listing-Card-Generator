"use client";

import { useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// AIProcessScreen — Step 2 of 7 in the AI Listing Card Generator flow.
//
// PURELY VISUAL. This component does NOT call any API.
// It is displayed by page.tsx while the API request is in-flight.
// When page.tsx finishes the request (success or failure), it will
// unmount this component automatically by advancing or reverting the step.
//
// No user interaction is required or possible on this screen.
// ─────────────────────────────────────────────────────────────────────────────

const steps = [
  "Reading your listing...",
  "Understanding the property...",
  "Extracting pricing information...",
  "Finding bedrooms & bathrooms...",
  "Detecting amenities...",
  "Organizing listing details...",
  "Preparing everything for review..."
];

export default function AIProcessing() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState("");

  // Advance through the visual step list every ~2.2 s.
  // The list is purely cosmetic — actual completion is driven by page.tsx.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  // Animate the trailing dots on the subtitle
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-orange-200 to-blue-200 flex items-center justify-center p-6">

      <div className="w-full max-w-2xl">

        <div className="bg-white rounded-3xl shadow-2xl p-12">

          <div className="flex justify-center">

            <div className="h-28 w-28 rounded-full bg-blue-100 flex items-center justify-center text-6xl animate-pulse">
              🤖
            </div>

          </div>

          <h1 className="mt-8 text-center text-4xl font-extrabold text-gray-900">
            AI Listing Assistant
          </h1>

          <p className="mt-4 text-center text-lg text-gray-500">
            Analyzing your property{dots}
          </p>

          <div className="mt-10 space-y-5">

            {steps.map((step, index) => {

              let icon = "○";
              let color = "text-gray-400";

              if (index < currentStep) {
                icon = "✓";
                color = "text-green-600";
              }

              if (index === currentStep) {
                icon = "⏳";
                color = "text-blue-600";
              }

              return (
                <div
                  key={step}
                  className={`flex items-center gap-4 text-lg ${color}`}
                >
                  <span className="text-2xl w-8">{icon}</span>

                  <span>{step}</span>
                </div>
              );
            })}

          </div>

          <div className="mt-12">

            <div className="h-3 rounded-full bg-gray-200 overflow-hidden">

              <div
                className="h-full bg-blue-600 transition-all duration-700"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />

            </div>

          </div>

          <div className="mt-8 bg-blue-50 rounded-2xl p-5 border border-blue-100">

            <p className="font-semibold text-blue-800">
              💡 What the AI is doing
            </p>

            <p className="mt-2 text-sm text-blue-700 leading-relaxed">
              We're reading your listing, extracting important property
              information, organizing it into structured fields, and preparing
              everything for your review. This usually takes between
              <strong> 10–30 seconds</strong>.
            </p>

          </div>

          <p className="mt-6 text-center text-sm text-gray-400">
            Please don't close this window while processing.
          </p>

        </div>

      </div>

    </div>
  );
}