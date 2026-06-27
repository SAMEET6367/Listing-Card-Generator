import { NextResponse } from "next/server";
import { extractListing } from "@/lib/gemini";
import fs from "fs";
import path from "path";


export async function POST(req) {


  try {


    const contentType =
      req.headers.get("content-type") || "";



    // Ignore second JSON calls
    if(
      contentType.includes("application/json")
    ){

      const body =
        await req.json();


      return NextResponse.json(
        body.extractedData || {
          fields:[]
        }
      );

    }





    const formData =
      await req.formData();





    const pdf =
      formData.get("file");



    if(!pdf){


      return NextResponse.json(
        {
          error:"No PDF uploaded"
        },
        {
          status:400
        }
      );

    }







    const propertyType =
      formData.get("propertyType") || "";



    const status =
      formData.get("status") || "";






    const bytes =
      await pdf.arrayBuffer();



    const buffer =
      Buffer.from(bytes);






    const uploadDir =
      path.join(
        process.cwd(),
        "uploads"
      );




    if(!fs.existsSync(uploadDir)){

      fs.mkdirSync(
        uploadDir
      );

    }





    const filePath =
      path.join(
        uploadDir,
        pdf.name
      );




    fs.writeFileSync(
      filePath,
      buffer
    );







    const data = {


      sourceType:"pdf",

      propertyType,

      status,

      file:filePath


    };





    console.log(
      "DATA SENT TO GEMINI:",
      data
    );






    const result =
      await extractListing(
        data
      );





    console.log(
      "AI RESULT:",
      result
    );






    return NextResponse.json(
      result
    );





  } catch(error){


    console.error(
      "EXTRACT LISTING ERROR:",
      error
    );



    return NextResponse.json(
      {
        error:error.message
      },
      {
        status:500
      }
    );

  }


}