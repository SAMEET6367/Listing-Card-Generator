"use client";

import { useState } from "react";

export default function ListingSetup({ onContinue }) {
  const [sourceType, setSourceType] = useState("pdf");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const propertyTypes = [
    "Single Family",
    "Vacant Land",
    "Condo",
    "Commercial",
  ];

  const statuses = [
    "For Sale",
    "For Rent",
    "Sold",
    "Vacant",
  ];


  async function handleContinue() {

    setLoading(true);
    setError("");

    try {

      const formData = new FormData();

      formData.append("sourceType", sourceType);
      formData.append("propertyType", propertyType);
      formData.append("status", status);


      if (sourceType === "pdf") {
        formData.append("file", file);
      } 
      else {
        formData.append("url", url);
      }


      // AI CALL
      const response = await fetch("/api/extract-listing", {
        method: "POST",
        body: formData,
      });


      if (!response.ok) {
        throw new Error("AI extraction failed");
      }


      const aiData = await response.json();


      console.log("AI RESULT:", aiData);



      if (onContinue) {
        onContinue({
          sourceType,
          propertyType,
          status,
          extractedData: aiData,
        });
      }


    } catch (err) {

      console.log(err);
      setError("Something went wrong while extracting listing data.");

    } finally {

      setLoading(false);

    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">


        <div className="mb-10 text-center">

          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-black text-sm font-bold mb-4">
            Step 1 of 7
          </div>


          <h1 className="text-4xl font-extrabold text-black">
            AI Listing Card Generator
          </h1>


          <p className="text-black mt-3">
            Upload listing data and AI will extract property details.
          </p>

        </div>



        <div className="mb-8">

          <h2 className="text-xl font-bold text-black mb-4">
            Listing Source
          </h2>



          <div className="grid grid-cols-2 gap-4">


            <button
              onClick={() => setSourceType("pdf")}
              className={`p-4 rounded-xl border font-semibold ${
                sourceType === "pdf"
                ? "bg-slate-500 text-black"
                : "bg-white text-black"
              }`}
            >
              📄 Upload PDF
            </button>



            <button
              onClick={() => setSourceType("url")}
              className={`p-4 rounded-xl border font-semibold ${
                sourceType === "url"
                ? "bg-slate-500 text-black"
                : "bg-white text-black"
              }`}
            >
              🔗 Listing URL
            </button>


          </div>




          <div className="mt-4">


            {
              sourceType === "pdf" ?

              <input
                type="file"
                accept=".pdf"
                onChange={(e)=>setFile(e.target.files[0])}
                className="w-full border p-3 rounded-xl text-black"
              />

              :

              <input
                type="text"
                placeholder="Paste listing URL"
                value={url || ""}
                onChange={(e)=>setUrl(e.target.value)}
                className="w-full border p-3 rounded-xl text-black"
              />

            }


          </div>

        </div>





        <div className="mb-8">

          <h2 className="text-xl font-bold text-black mb-4">
            Property Type
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {
              propertyTypes.map(type=>(

                <button
                  key={type}
                  onClick={()=>setPropertyType(type)}
                  className={`p-4 rounded-xl border font-semibold ${
                    propertyType===type
                    ?"bg-blue-300 text-black"
                    :"bg-white text-black"
                  }`}
                >
                  {type}
                </button>

              ))
            }

          </div>

        </div>





        <div className="mb-10">

          <h2 className="text-xl font-bold text-black mb-4">
            Listing Status
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {
            statuses.map(item=>(

              <button
                key={item}
                onClick={()=>setStatus(item)}
                className={`p-4 rounded-xl border font-semibold ${
                  status===item
                  ?"bg-green-300 text-black"
                  :"bg-white text-black"
                }`}
              >
                {item}
              </button>

            ))
          }


          </div>

        </div>




        {
          error &&
          <p className="text-red-600 mb-4">
            {error}
          </p>
        }




        <button

          onClick={handleContinue}

          disabled={
            loading ||
            !propertyType ||
            !status ||
            (sourceType==="pdf" && !file) ||
            (sourceType==="url" && !url)
          }


          className="w-full bg-slate-700 text-black py-4 rounded-xl text-lg font-bold hover:bg-slate-500 disabled:opacity-40"

        >

          {
            loading 
            ? "Extracting with AI..."
            : "Continue →"
          }


        </button>


      </div>

    </div>
  );
}