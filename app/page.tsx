"use client";

import { useState } from "react";

import ListingSetup from "@/components/ListingSetup";
import ReviewFields from "@/components/ReviewFields";


export default function Home() {


  const [step, setStep] = useState(1);

  const [listingData, setListingData] = useState(null);



  async function handleContinue(data:any) {


    try {


      console.log(
        "SENDING TO API:",
        data
      );


      const response = await fetch(
        "/api/extract-listing",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },


          body: JSON.stringify(data),

        }
      );



      const aiResult = await response.json();



      console.log(
        "GEMINI RETURNED:",
        aiResult
      );



      // prevent empty/error response
      if(
        !aiResult ||
        aiResult.error
      ){

        alert(
          aiResult?.error ||
          "AI could not extract listing data"
        );

        return;

      }



      setListingData(aiResult);


      setStep(2);



    } catch(error) {


      console.log(
        "AI ERROR:",
        error
      );


    }


  }






  return (

    <>


      {
        step === 1 && (

          <ListingSetup

            onContinue={handleContinue}

          />

        )
      }





      {
        step === 2 && (

          <ReviewFields

            extractedData={listingData}

            onContinue={(finalData:any)=>{

              console.log(
                "FINAL REVIEW DATA:",
                finalData
              );


              // next step later:
              // image upload page

            }}

          />

        )

      }



    </>

  );

}