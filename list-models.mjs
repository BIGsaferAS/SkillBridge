import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI("AIzaSyCxX-O7carhFH3ECaFEt_6Smm1Ci4xuVTA");

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCxX-O7carhFH3ECaFEt_6Smm1Ci4xuVTA`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    console.log(data.models?.map(m => m.name).join("\n"));
  } catch(e) {
    console.error(e);
  }
}
run();
