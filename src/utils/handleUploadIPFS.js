const axios = require("axios");
const FormData = require("form-data");

const uploadToPinata = async (fileBuffer, fileName) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const form = new FormData();
  form.append("file", fileBuffer, {
    filename: fileName,
    contentType: "image/png", // o el tipo MIME adecuado
  });

  const metadata = JSON.stringify({ name: fileName });
  const options = JSON.stringify({ cidVersion: 0 });

  form.append("pinataMetadata", metadata);
  form.append("pinataOptions", options);

  try {
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET,
      },
      maxBodyLength: Infinity, // para archivos grandes
    });

    return response.data;
  } catch (error) {
    console.error("Error al subir el archivo a Pinata:", error.response?.data || error.message);
    throw new Error("Fallo en la subida a Pinata");
  }
};

module.exports = uploadToPinata;
