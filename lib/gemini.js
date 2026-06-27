import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";


const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_KEY
);


const fileManager =
new GoogleAIFileManager(
  process.env.GEMINI_KEY
);




async function uploadPDF(filePath){


  const result =
  await fileManager.uploadFile(
    filePath,
    {
      mimeType:"application/pdf",
      displayName:"real-estate-listing"
    }
  );


  console.log(
    "PDF UPLOADED:",
    result.file.uri
  );


  return result.file;

}






export async function extractListing(data){


const model =
genAI.getGenerativeModel({

 model:"gemini-2.5-flash",

 generationConfig:{
   responseMimeType:"application/json",
   temperature:0
 }

});




let parts=[];




if(data.file){


 const pdf =
 await uploadPDF(data.file);



 parts.push({

  fileData:{

   mimeType:"application/pdf",

   fileUri:pdf.uri

  }

 });



}






parts.push({

text:`

Read the attached PDF document.

You are extracting data from the PDF.

The PDF is the only source.

Extract all property listing information.

DO NOT only return property type and status.

Find every field available:

Address
MLS
Price
Bedrooms
Bathrooms
Sqft
Lot Size
Year Built
Garage
Parking
HOA
Taxes
Schools
Features
Description
Amenities
Agent information


Rules:

- Never guess.
- Never use examples.
- Only extract from PDF.
- Return many fields.


Return JSON:

{
 "fields":[

 {
  "name":"",
  "value":""
 }

 ]

}


Property type:
${data.propertyType}

Status:
${data.status}

`

});






const response =
await model.generateContent(
 parts
);



let text =
response.response.text();



text =
text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



return JSON.parse(text);


}