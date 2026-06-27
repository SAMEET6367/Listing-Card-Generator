"use client";

import { useState, useEffect } from "react";

import ListingSetup from "@/components/ListingSetup";
import AIProcessing from "@/components/AIProcessScreen";
import ReviewFields from "@/components/ReviewFields";

// ─────────────────────────────────────────────────────────────────────────────
// page.tsx — Application shell for the AI Listing Card Generator.
//
// Step ownership:
//   Step 1  →  ListingSetup       (data collection only — no fetch)
//   Step 2  →  AIProcessScreen    (visual-only while API call is in-flight)
//   Step 3  →  ReviewFields       (review & edit extracted data)
//
// This file is solely responsible for:
//   - Controlling which step is rendered
//   - Performing the POST /api/extract-listing fetch
//   - Saving the extracted listing data
//   - Persisting and restoring session via localStorage
//   - Passing errors back to ListingSetup for inline display
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {

  const [session, setSession] = useState({
    step: 1,
    listingData: null,
  });

  // Error message passed back down to ListingSetup when the API call fails.
  // Cleared on every new attempt.
  const [listingError, setListingError] = useState("");

  // ── Session persistence ───────────────────────────────────────────────────

  // Restore session after page refresh
  useEffect(() => {
    const savedSession = localStorage.getItem("listing-session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // If the persisted step is 2 (AIProcessing), revert to 1 —
        // the in-flight request is gone after a refresh so we cannot resume it.
        if (parsed.step === 2) {
          parsed.step = 1;
        }
        setSession(parsed);
      } catch (error) {
        console.log("Failed to restore session:", error);
      }
    }
  }, []);

  // Save session whenever it changes
  useEffect(() => {
    localStorage.setItem("listing-session", JSON.stringify(session));
  }, [session]);

  // ── Step 1 → Step 2 transition + API call ────────────────────────────────
  //
  // Called by ListingSetup via onContinue(formData).
  // formData contains the raw values collected from the form:
  //   { propertyType, status, listingFile, mlsFile, url, listingText }
  //
  // Flow:
  //   1. Immediately advance to step 2 so AIProcessScreen renders at once.
  //   2. Build and send the API request in the background.
  //   3a. On success → store extracted data and advance to step 3.
  //   3b. On failure → revert to step 1 and surface the error inline.

  async function handleListingSetupContinue(formData) {

    // Clear any previous error from a prior failed attempt
    setListingError("");

    // ── Immediately show AIProcessScreen ─────────────────────────────────────
    setSession((prev) => ({ ...prev, step: 2 }));

    try {
      let response;

      const { propertyType, status, listingFile, mlsFile, url, listingText } = formData;

      // ── Priority 1 — Listing PDF ──────────────────────────────────────────
      if (listingFile) {
        const fd = new FormData();
        fd.append("file", listingFile);
        fd.append("propertyType", propertyType);
        fd.append("status", status);

        response = await fetch("/api/extract-listing", {
          method: "POST",
          body: fd,
        });
      }

      // ── Priority 2 — MLS Printout PDF ─────────────────────────────────────
      else if (mlsFile) {
        const fd = new FormData();
        fd.append("mlsFile", mlsFile);
        fd.append("propertyType", propertyType);
        fd.append("status", status);

        response = await fetch("/api/extract-listing", {
          method: "POST",
          body: fd,
        });
      }

      // ── Priority 3 — Listing URL ──────────────────────────────────────────
      else if (url) {
        response = await fetch("/api/extract-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceType: "url",
            url,
            propertyType,
            status,
          }),
        });
      }

      // ── Priority 4 — Pasted webpage text ──────────────────────────────────
      else if (listingText) {
        response = await fetch("/api/extract-listing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceType: "text",
            listingText,
            propertyType,
            status,
          }),
        });
      }

      // Should never reach here — ListingSetup validates before calling us
      else {
        throw new Error("Please provide at least one import source.");
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "AI extraction failed.");
      }

      const aiResult = await response.json();

      console.log("GEMINI RETURNED:", aiResult);

      if (!aiResult || aiResult.error) {
        throw new Error(aiResult?.error || "AI could not extract listing data.");
      }

      // ── Success: advance to ReviewFields (step 3) ──────────────────────────
      setSession({
        step: 3,
        listingData: aiResult,
      });

    } catch (error) {
      console.error("AI ERROR:", error);

      // ── Failure: revert to ListingSetup (step 1) with inline error ─────────
      setListingError(
        error?.message || "Something went wrong while extracting listing data."
      );

      setSession((prev) => ({ ...prev, step: 1 }));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Step 1: Data collection ──────────────────────────────────────── */}
      {session.step === 1 && (
        <ListingSetup
          onContinue={handleListingSetupContinue}
          externalError={listingError}
        />
      )}

      {/* ── Step 2: AI processing screen (shown while fetch is in-flight) ── */}
      {session.step === 2 && (
        <AIProcessing />
      )}

      {/* ── Step 3: Review extracted fields ──────────────────────────────── */}
      {session.step === 3 && (
        <ReviewFields
          extractedData={session.listingData}

          onBack={() => {
            // Back from ReviewFields returns to ListingSetup (step 1)
            setSession((prev) => ({ ...prev, step: 1 }));
          }}

          onContinue={(finalData) => {
            console.log("FINAL REVIEW DATA:", finalData);

            // Save user edits to session
            setSession((prev) => ({
              ...prev,
              listingData: finalData,
            }));

            // next step later:
            // image upload page
          }}
        />
      )}
    </>
  );
}