const axios = require('axios');

const PINATA_API_KEY = '3255e321a2b008646cb1';
const PINATA_API_SECRET = '632a8ad77184b0e545aae9775b56e521530d3bbdd07c26fbd7319ce936bf6c50';

const data = {
  pinataMetadata: {
    name: "Kimlik Verisi"
  },
  pinataContent: {
    name: "veysel imrak",
    idNumber: "123456789"
  }
};

async function uploadToPinata() {
  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET
        }
      }
    );

    console.log("✅ IPFS Hash:", res.data.IpfsHash);
  } catch (err) {
    console.error("🚫 Pinata Hatası:", err.response ? err.response.data : err.message);
  }
}

uploadToPinata();
