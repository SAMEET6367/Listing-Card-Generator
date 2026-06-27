"use client";

import { useEffect, useState } from "react";


export default function ReviewFields({
  extractedData,
  onContinue
}) {


const [fields,setFields] = useState([]);




useEffect(()=>{


  if(!extractedData){
    setFields([]);
    return;
  }




  // Gemini new response:
  // {
  //   fields:[
  //     {name:"Address", value:"..."},
  //     {name:"Price", value:"..."}
  //   ]
  // }


  if(
    Array.isArray(extractedData.fields)
  ){

    setFields(
      extractedData.fields.map(item=>({

        name:
        item.name || "",


        value:
        item.value || ""

      }))
    );


    return;

  }






  // fallback for old Gemini format

  const converted =
  Object.entries(extractedData)
  .filter(
    ([key]) =>
    key !== "error"
  )
  .map(
    ([key,value])=>({

      name:key,

      value:
      Array.isArray(value)
      ? value.join(", ")
      : String(value ?? "")

    })
  );



  setFields(
    converted
  );



},[extractedData]);







function updateField(index,key,value){


 const updated =
 [...fields];


 updated[index] = {

   ...updated[index],

   [key]:value

 };


 setFields(updated);


}






function addField(){


 setFields([
   ...fields,

   {
    name:"",
    value:""
   }

 ]);


}






function removeField(index){


 setFields(
   fields.filter(
    (_,i)=>i!==index
   )
 );


}






return (

<div className="min-h-screen bg-gray-50 p-10">


<div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10">



<h1 className="text-4xl font-bold text-black mb-8">
Review Listing Information
</h1>





{
fields.length === 0 && (

<p className="text-red-600">
No AI fields extracted.
</p>

)
}





{
fields.map((field,index)=>(


<div
key={index}
className="bg-slate-50 border rounded-xl p-5 mb-5"
>



<div className="grid md:grid-cols-2 gap-5">



<div>

<label className="text-black font-bold">
Field Name
</label>


<input

value={field.name}

onChange={(e)=>

updateField(
 index,
 "name",
 e.target.value
)

}

className="w-full border p-3 rounded text-black"

/>


</div>





<div>

<label className="text-black font-bold">
Information
</label>


<input

value={field.value}

onChange={(e)=>

updateField(
 index,
 "value",
 e.target.value
)

}

className="w-full border p-3 rounded text-black"

/>


</div>



</div>






<button

onClick={()=>removeField(index)}

className="mt-3 text-red-600"

>
Remove Field
</button>



</div>


))

}






<button

onClick={addField}

className="w-full p-4 border rounded-xl text-black mt-5"

>
+ Add New Field
</button>






<button

onClick={()=>onContinue(fields)}

className="w-full mt-4 p-4 bg-slate-700 text-white rounded-xl"

>
Continue →
</button>





</div>

</div>


);

}