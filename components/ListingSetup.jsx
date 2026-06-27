"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ListingSetup — Step 1 of 7 in the AI Listing Card Generator flow.
// Presents four simultaneous import methods; the highest-priority one wins
// when the user clicks Continue.
// Priority: Listing PDF → MLS Printout PDF → URL → Listing Text
//
// REFACTORED: This component is now purely a data-collection component.
// It does NOT call fetch() or perform any API requests.
// It calls onContinue(data) with the raw collected values and lets the
// parent (page.tsx) handle the API call and navigation.
// ─────────────────────────────────────────────────────────────────────────────
export default function ListingSetup({ onContinue, externalError }) {
  // ── Import method states ──────────────────────────────────────────────────
  const [url, setUrl] = useState("");
  const [listingFile, setListingFile] = useState(null);   // Listing PDF
  const [mlsFile, setMlsFile] = useState(null);           // MLS Printout PDF
  const [listingText, setListingText] = useState("");      // Pasted webpage text

  // ── Property meta states ──────────────────────────────────────────────────
  const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState("");

  // ── Options ───────────────────────────────────────────────────────────────
  const propertyTypes = ["Single Family", "Vacant Land", "Condo", "Commercial"];
  const statuses = ["For Sale", "For Rent", "Sold", "Vacant"];

  // ── Validation: at least one import method must have data ─────────────────
  const hasImportData =
    listingFile || mlsFile || url.trim() || listingText.trim();

  const canContinue = propertyType && status && hasImportData;

  // ── Submission ─────────────────────────────────────────────────────────────
  // No fetch() here. Simply collect the raw form data and hand it to the
  // parent via onContinue(). The parent is responsible for the API call.
  function handleContinue() {
    if (!canContinue) return;

    onContinue({
      propertyType,
      status,
      listingFile,   // File object or null
      mlsFile,       // File object or null
      url: url.trim(),
      listingText: listingText.trim(),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-orange-200 to-blue-200 flex items-center justify-center p-6">
      <div className="w-full max-w-350">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-5">
            Step 1 of 7
          </span>

          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Listing Flyer & Card Generator
          </h1>

          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Import a listing using any of the methods below. AI will automatically extract the property information.
          </p>
        </div>

        {/* ── MAIN CARD ──────────────────────────────────────────────────── */}
        <div className="bg-blue-100 rounded-3xl shadow-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">

          {/* ── SECTION LABEL ─────────────────────────────────────────────── */}
          <div className="px-8 pt-7 pb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Import Method — choose one or more
            </p>
          </div>

          {/* ── 1. LISTING WEBSITE URL ────────────────────────────────────── */}
          <ImportCard>
            <SectionHeading emoji="🌐" label="Listing Website URL" />

            {/* Warning box */}
            <div className="mt-3 mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm leading-relaxed">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>
                Most real estate websites do not allow automated data extraction.
                If URL import fails, use one of the options below.
              </span>
            </div>

            <input
              type="url"
              placeholder="https://www..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition"
            />
          </ImportCard>

          {/* ── 2. LISTING PDF ────────────────────────────────────────────── */}
          <ImportCard>
            <SectionHeading emoji="📄" label="Listing PDF" />
            <p className="mt-1 mb-4 text-sm text-gray-500">
              Upload a listing PDF downloaded from the listing website.
            </p>

            <FileInput
              id="listing-pdf"
              file={listingFile}
              onChange={(f) => setListingFile(f)}
            />
          </ImportCard>

          {/* ── 3. MLS PRINTOUT PDF ───────────────────────────────────────── */}
          <ImportCard>
            <SectionHeading emoji="📑" label="MLS Printout PDF" />
            <p className="mt-1 mb-4 text-sm text-gray-500">
              Upload the MLS printout exported from your MLS system.
            </p>

            <FileInput
              id="mls-pdf"
              file={mlsFile}
              onChange={(f) => setMlsFile(f)}
            />
          </ImportCard>

          {/* ── 4. LISTING WEBSITE TEXT ───────────────────────────────────── */}
          <ImportCard large>
            <SectionHeading emoji="📝" label="Listing Website Text" />
            <p className="mt-1 mb-4 text-sm text-gray-500 leading-relaxed">
              If the website blocks automatic extraction, copy the entire webpage{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Ctrl+A</kbd>{" "}
              then{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono">Ctrl+C</kbd>{" "}
              and paste it below.
            </p>

            <textarea
              rows={10}
              placeholder="Paste the full text of the listing page here..."
              value={listingText}
              onChange={(e) => setListingText(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition resize-none"
            />
          </ImportCard>

          {/* ── PROPERTY TYPE ─────────────────────────────────────────────── */}
          <div className="px-8 py-7">
            <SectionHeading label="Property Type" />
            <p className="mt-1 mb-5 text-sm text-gray-500">
              Select the type that best describes this listing.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {propertyTypes.map((type) => {
                const active = propertyType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    className={`rounded-xl border-2 px-3 py-4 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                      active
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                        : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── LISTING STATUS ────────────────────────────────────────────── */}
          <div className="px-8 py-7">
            <SectionHeading label="Listing Status" />
            <p className="mt-1 mb-5 text-sm text-gray-500">
              What is the current status of this listing?
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statuses.map((item) => {
                const active = status === item;
                return (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={`rounded-xl border-2 px-3 py-4 text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-300 ${
                      active
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                        : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── FOOTER: ERROR + BUTTON ─────────────────────────────────────── */}
          <div className="px-8 py-7">
            {/* External error passed down from page.tsx after a failed API call */}
            {externalError && (
              <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <span className="mt-0.5 shrink-0">❌</span>
                <span>{externalError}</span>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full relative py-4 rounded-2xl text-white text-base font-bold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300"
              style={{
                background: canContinue
                  ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  : "#94a3b8",
              }}
            >
              Continue →
            </button>

            {/* Validation hint */}
            {!canContinue && (
              <p className="mt-3 text-center text-xs text-gray-400">
                {!hasImportData
                  ? "Provide at least one import source to continue."
                  : !propertyType
                  ? "Select a property type to continue."
                  : "Select a listing status to continue."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (kept in the same file per requirements)
// ─────────────────────────────────────────────────────────────────────────────

/** Wrapper card for each import method section */
function ImportCard({ children, large }) {
  return (
    <div className={`px-8 ${large ? "py-8" : "py-6"}`}>
      {children}
    </div>
  );
}

/** Section heading with optional emoji */
function SectionHeading({ emoji, label }) {
  return (
    <h2 className="text-base font-bold text-gray-800">
      {emoji && <span className="mr-2">{emoji}</span>}
      {label}
    </h2>
  );
}

/** Styled file upload input with filename preview */
function FileInput({ id, file, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 w-full border-2 border-dashed border-gray-200 hover:border-blue-300 bg-gray-50 hover:bg-blue-50 rounded-xl px-4 py-3.5 cursor-pointer transition group"
    >
      <span className="text-2xl">📂</span>
      <div className="flex-1 min-w-0">
        {file ? (
          <span className="text-sm font-medium text-blue-700 truncate block">
            {file.name}
          </span>
        ) : (
          <span className="text-sm text-gray-400 group-hover:text-blue-500 transition">
            Click to select a PDF file
          </span>
        )}
      </div>
      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange(null);
            // Reset the input so the same file can be re-selected
            const input = document.getElementById(id);
            if (input) input.value = "";
          }}
          className="shrink-0 text-gray-400 hover:text-red-500 text-lg transition"
          aria-label="Remove file"
        >
          ×
        </button>
      )}
      <input
        id={id}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}