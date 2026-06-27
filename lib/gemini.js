import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_KEY
);

const fileManager = new GoogleAIFileManager(
  process.env.GEMINI_KEY
);

// =====================================================
// Upload PDF to Gemini
// =====================================================

async function uploadPDF(filePath) {
  const result = await fileManager.uploadFile(filePath, {
    mimeType: "application/pdf",
    displayName: "real-estate-listing",
  });

  console.log("PDF UPLOADED:", result.file.uri);

  return result.file;
}

// =====================================================
// Extract Listing
// =====================================================

export async function extractListing(data) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",

    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });

  const parts = [];

  // =====================================================
  // PDF IMPORT
  // =====================================================

  if (data.file) {
    const pdf = await uploadPDF(data.file);

    parts.push({
      fileData: {
        mimeType: "application/pdf",
        fileUri: pdf.uri,
      },
    });

    parts.push({
      text: `
You are extracting information from a real estate listing PDF.

The attached PDF is the source of truth.

Extract every property detail available.
`,
    });
  }

  // =====================================================
  // WEBSITE URL
  // =====================================================

  else if (data.sourceType === "url") {
    parts.push({
      text: `
The following text was extracted from a real estate listing website.

Website URL:

${data.url}

Listing Content:

${data.content}
`,
    });
  }

  // =====================================================
  // PASTED WEBSITE TEXT
  // =====================================================

  else if (data.sourceType === "text") {
    parts.push({
      text: `
The following text was copied from a real estate listing webpage.

Listing Content:

${data.content}
`,
    });
  }

  // =====================================================
  // EXTRACTION INSTRUCTIONS
  // =====================================================

  parts.push({
    text: `
You are an expert real estate listing parser.

Extract ALL available property information.

Do NOT stop after property type and status.

Look for every useful field.

Possible fields include:

- Address
- MLS Number
- Price
- Bedrooms
- Bathrooms
- Square Feet
- Lot Size
- Year Built
- Property Type
- Listing Status
- Garage
- Parking
- HOA
- Taxes
- Schools
- Elementary School
- Middle School
- High School
- Description
- Features
- Amenities
- Appliances
- Flooring
- Heating
- Cooling
- Fireplace
- Pool
- Basement
- Waterfront
- View
- Patio
- Balcony
- Exterior Features
- Interior Features
- Roof
- Construction
- Agent Name
- Brokerage
- Office Phone
- Listing Date
- Days on Market

Ignore:

- Navigation
- Footer
- Cookie banners
- Copyright text
- Advertisements
- Related properties

Never invent values.

Only return information that actually exists.

Property Type Selected:

${data.propertyType}

Listing Status Selected:

${data.status}

Return ONLY valid JSON.

Example:

{
  "fields": [
    {
      "name": "Address",
      "value": "123 Main St"
    },
    {
      "name": "Price",
      "value": "$450,000"
    }
  ]
}
`,
  });

  console.log("========== GEMINI REQUEST ==========");
  console.log(parts);

  let response;

  try {
    response = await model.generateContent(parts);
  } catch (error) {
    console.error("GEMINI ERROR:", error);

    if (error.message.includes("503")) {
      throw new Error(
        "Google Gemini is currently busy. Please try again in a few moments."
      );
    }

    throw error;
  }

  let text = response.response.text();

  console.log("========== GEMINI RESPONSE ==========");
  console.log(text);

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("INVALID JSON RETURNED:");
    console.log(text);

    return {
      fields: [],
    };
  }
}