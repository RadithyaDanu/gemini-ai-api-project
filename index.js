const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.Gemini_API);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

//endpoint generate text
app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    res.status(200).json({ output: text });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while generating text.' });
  }
});

const imageGenerativePart = (filePath, mimeType) => ({
  inlineData : {
    data : fs.readFileSync(filePath).toString('base64'),
    mimeType : mimeType
  }
});

//endpoint for read image

app.post("/generate-from-image", upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body; // Extract the prompt from the request body
    const image = imageGenerativePart(req.file.path, 'image/png');

    const result = await model.generateContent([prompt, image]);
    const response = result.response; // Get the response from the model
    const text = response.text(); // Extract the text from the response

    res.status(200).json({ output: text }); // Send the generated text as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while generating text from image.' });
  } finally {
    fs.unlinkSync(req.file.path); // Delete the uploaded file
  }
});


// ENDPOINT UNTUK MEMBACA DOKUMEN
app.post("/generate-from-document", upload.single('document'), async (req, res) => {
  try {
    // const { prompt } = req.body; // Extract the prompt from the request body
    const filePath = req.file.path;         // Get the path of the uploaded file
    const mimeType = req.file.mimetype;     // Get the MIME type of the uploaded file
    const document = imageGenerativePart(filePath, mimeType); // Prepare the document data for the model

    const result = await model.generateContent(['Analyze this document: ', document]);
    const response = result.response;       // Get the response from the model
    const text = response.text();           // Extract the text from the response

    res.status(200).json({ output: text }); // Send the generated text as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while generating text from document.' });
  } finally {
    fs.unlinkSync(req.file.path); // Delete the uploaded file
  }
});

// ENDPOINT UNTUK MEMBACA AUDIO
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  try {
    // const { prompt } = req.body; // Extract the prompt from the request body
    const filePath = req.file.path; // Get the path of the uploaded file
    const mimeType = req.file.mimetype; // Get the MIME type of the uploaded file
    const audio = imageGenerativePart(filePath, mimeType); // Prepare the document data for the model
    const result = await model.generateContent(['Analyze this audio:', audio]);
    const response = result.response;
    const text = response.text(); // Extract the text from the response
    res.status(200).json({ output: text }); // Send the generated text as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred while generating text from audio.' });
  } finally {
    fs.unlinkSync(req.file.path); // Delete the uploaded file
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
