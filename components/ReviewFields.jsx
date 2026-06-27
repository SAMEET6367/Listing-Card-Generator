"use client";

import { useEffect, useState } from "react";

export default function ReviewFields({
  extractedData,
  onContinue,
  onBack,
}) {

  const [fields, setFields] = useState([]);

  useEffect(() => {

  if (!extractedData) {
    setFields([]);
    return;
  }


  // If data is already an array
  if (Array.isArray(extractedData)) {

    setFields(
      extractedData.map(item => ({
        name: String(item.name ?? ""),
        value: String(item.value ?? "")
      }))
    );

    return;
  }


  // Gemini new response
  if (Array.isArray(extractedData.fields)) {

    setFields(
      extractedData.fields.map(item => ({
        name: String(item.name ?? ""),
        value: String(item.value ?? "")
      }))
    );

    return;
  }


  // Old Gemini format fallback

  const converted =
    Object.entries(extractedData)
      .filter(([key]) => key !== "error")
      .map(([key, value]) => ({
        name: key,
        value: Array.isArray(value)
          ? value.join(", ")
          : String(value ?? "")
      }));


  setFields(converted);


}, [extractedData]);


  function updateField(index, key, value) {

    const updated =
      [...fields];

    updated[index] = {

      ...updated[index],

      [key]: value

    };

    setFields(updated);

  }



  function addField() {

    setFields([
      ...fields,

      {
        name: "",
        value: ""
      }

    ]);

  }



  function removeField(index) {

    setFields(
      fields.filter(
        (_, i) => i !== index
      )
    );

  }



  // Derive description field and other fields for rendering
  // without mutating state or reordering the actual fields array
  const descriptionFieldEntry = fields
    .map((field, index) => ({ field, index }))
    .find(({ field }) => field.name.toLowerCase() === "description");

  const otherFieldEntries = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.name.toLowerCase() !== "description");



  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-orange-200 to-blue-200 flex items-center justify-center p-6">

      <div className="w-full max-w-7xl">

        {/* Back Button */}
  <div className="mb-6">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-400 transition"
    >
      ← Back
    </button>
  </div>

        {/* Header */}
        <div className="mb-8 text-center">

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-widest mb-5">
            Step 2 of 7
          </span>

          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Review Listing Information
          </h1>

          <p className="mt-3 text-black text-base max-w-4xl mx-auto">
            Review the information extracted by AI. Edit, remove, or add any fields before continuing.
          </p>

        </div>

        {/* Main Card */}

        <div className="bg-blue-100 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          <div className="px-8 pt-7 pb-4 border-b border-gray-200">

            <p className="text-xl font-bold uppercase tracking-widest text-black">
              AI Extracted Fields
            </p>

          </div>

          <div className="p-8">

            {
              fields.length === 0 && (

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  No AI fields extracted.
                </div>

              )
            }

            {/* Description field — always rendered first, full-width, with textarea */}
            {
              descriptionFieldEntry && (

                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">

                    <div>

                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Field Name
                      </label>

                      <input

                        value={descriptionFieldEntry.field.name}

                        onChange={(e) =>

                          updateField(
                            descriptionFieldEntry.index,
                            "name",
                            e.target.value
                          )

                        }

                        className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition"

                      />

                    </div>

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Information
                    </label>

                    <textarea

                      value={descriptionFieldEntry.field.value}

                      onChange={(e) =>

                        updateField(
                          descriptionFieldEntry.index,
                          "value",
                          e.target.value
                        )

                      }

                      rows={8}

                      style={{ resize: "vertical" }}

                      className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition"

                    />

                  </div>

                  <button

                    onClick={() => removeField(descriptionFieldEntry.index)}

                    className="mt-5 px-2 py-1 rounded-md text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"

                  >
                    Remove Field
                  </button>

                </div>

              )
            }

            {/* All other fields in a responsive 2-column grid */}
            {
              otherFieldEntries.length > 0 && (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                  {
                    otherFieldEntries.map(({ field, index }) => (

                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                      >

                        <div className="flex flex-col gap-4">

                          <div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Field Name
                            </label>

                            <input

                              value={field.name}

                              onChange={(e) =>

                                updateField(
                                  index,
                                  "name",
                                  e.target.value
                                )

                              }

                              className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition"

                            />

                          </div>

                          <div>

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Information
                            </label>

                            <input

                              value={field.value}

                              onChange={(e) =>

                                updateField(
                                  index,
                                  "value",
                                  e.target.value
                                )

                              }

                              className="w-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition"

                            />

                          </div>

                        </div>

                        <button

                          onClick={() => removeField(index)}

                         className="mt-5 px-2 py-1 rounded-md text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition"

                        >
                          Remove Field
                        </button>

                      </div>

                    ))
                  }

                </div>

              )
            }

            <button

              onClick={addField}

              className="w-full py-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition"

            >
              + Add New Field
            </button>

            <button

            onClick={() =>
              onContinue(
                fields.map(field => ({
                  name: String(field.name),
                  value: String(field.value)
                }))
              )
            }

            className="w-full mt-5 py-4 rounded-2xl text-white text-base font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"

            style={{
              background:
                "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }}

          >
            Continue →
</button>

          </div>

        </div>

      </div>

    </div>

  );

}