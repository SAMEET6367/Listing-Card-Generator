import { NextResponse } from "next/server";
import { extractListing } from "@/lib/gemini";
import { extractUrlText } from "@/lib/URLextractor";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // =====================================================
    // JSON FLOW (URL / TEXT)
    // =====================================================
    if (contentType.includes("application/json")) {
      const body = await req.json();

      // =====================================================
      // URL IMPORT
      // =====================================================
      if (body.sourceType === "url") {
        const url = body.url;

        if (!url) {
          return NextResponse.json(
            { error: "URL missing" },
            { status: 400 }
          );
        }

        let text;

        try {
          text = await extractUrlText(url);
        } catch (error) {
          console.error("URL EXTRACTION ERROR:", error.message);

          return NextResponse.json(
            {
              error:
                "Could not extract website content. Please upload a Listing PDF, MLS Printout, or paste the listing text.",
            },
            { status: 400 }
          );
        }

        const blockedPatterns = [
          "confirm you are a human",
          "press & hold",
          "captcha",
          "access denied",
          "verify you are human",
          "blocked",
          "bot",
        ];

        const blocked = blockedPatterns.some((word) =>
          text.toLowerCase().includes(word)
        );

        if (blocked) {
          return NextResponse.json(
            {
              error:
                "This website does not allow automated extraction. Please upload a Listing PDF, MLS Printout PDF, or paste the listing text.",
            },
            { status: 400 }
          );
        }

        if (!text || text.length < 50) {
          return NextResponse.json(
            { error: "Failed to extract page content." },
            { status: 400 }
          );
        }

        const data = {
          sourceType: "url",
          propertyType: body.propertyType || "",
          status: body.status || "",
          content: text,
          url,
        };

        console.log(
          "URL TEXT SENT TO GEMINI:",
          text.substring(0, 500)
        );

        const result = await extractListing(data);

        return NextResponse.json(result);
      }

      // =====================================================
      // WEBSITE TEXT IMPORT
      // =====================================================
      if (body.sourceType === "text") {
        const listingText = body.listingText;

        if (!listingText || listingText.trim().length < 50) {
          return NextResponse.json(
            {
              error: "Please paste the listing text.",
            },
            {
              status: 400,
            }
          );
        }

        const data = {
          sourceType: "text",
          propertyType: body.propertyType || "",
          status: body.status || "",
          content: listingText,
        };

        console.log(
          "TEXT SENT TO GEMINI:",
          listingText.substring(0, 500)
        );

        const result = await extractListing(data);

        return NextResponse.json(result);
      }

      return NextResponse.json(
        body.extractedData || {
          fields: [],
        }
      );
    }

    // =====================================================
    // PDF / MLS FLOW
    // =====================================================

    const formData = await req.formData();

    // Supports BOTH:
    // file = Listing PDF
    // mlsFile = MLS Printout

    const pdf =
      formData.get("file") ||
      formData.get("mlsFile");

    if (!pdf) {
      return NextResponse.json(
        {
          error: "No PDF uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const propertyType =
      formData.get("propertyType") || "";

    const status =
      formData.get("status") || "";

    const bytes = await pdf.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "uploads"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const filePath = path.join(
      uploadDir,
      pdf.name
    );

    fs.writeFileSync(filePath, buffer);

    const data = {
      sourceType: "pdf",
      propertyType,
      status,
      file: filePath,
    };

    console.log("PDF SENT TO GEMINI:", {
      filePath,
      propertyType,
      status,
    });

    const result = await extractListing(data);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "EXTRACT LISTING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}