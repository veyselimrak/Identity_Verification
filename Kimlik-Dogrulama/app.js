const contractAddress = "0xb0c23b1c790C73AfB49D4f46D4F7A7fEb29D1383"; 
const contractABI = [
  {
    "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "name": "userAddresses",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "","type": "address"}],
    "name": "users",
    "outputs": [
      {"internalType": "string","name": "name","type": "string"},
      {"internalType": "string","name": "ipfsHash","type": "string"},
      {"internalType": "uint8","name": "role","type": "uint8"},
      {"internalType": "bool","name": "isVerified","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "_name","type": "string"},
      {"internalType": "string","name": "_ipfsHash","type": "string"},
      {"internalType": "uint8","name": "_role","type": "uint8"}
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "getUser",
    "outputs": [
      {"internalType": "string","name": "","type": "string"},
      {"internalType": "string","name": "","type": "string"},
      {"internalType": "uint8","name": "","type": "uint8"},
      {"internalType": "bool","name": "","type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string","name": "_name","type": "string"},
      {"internalType": "string","name": "_ipfsHash","type": "string"}
    ],
    "name": "updateUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllUsers",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "getUserRole",
    "outputs": [{"internalType": "uint8","name": "","type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "_user","type": "address"},
      {"internalType": "uint8","name": "_role","type": "uint8"}
    ],
    "name": "setUserRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "_user","type": "address"}],
    "name": "verifyUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


let web3;
let contract;
let accounts;

// Pinata API Bilgileri
const PINATA_API_KEY = "3255e321a2b008646cb1";
const PINATA_API_SECRET = "632a8ad77184b0e545aae9775b56e521530d3bbdd07c26fbd7319ce936bf6c50";

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(contractABI, contractAddress);
    console.log("✅ MetaMask bağlantısı başarılı:", accounts[0]);
  } else {
    alert("❌ MetaMask yüklü değil!");
  }
});
async function fillUserDropdown() {
  const users = await contract.methods.getAllUsers().call();
  const dropdown = document.getElementById("targetUser");

  dropdown.innerHTML = '<option disabled selected>-- Kullanıcı seçin --</option>';
  users.forEach((address) => {
    const opt = document.createElement("option");
    opt.value = address;
    opt.textContent = address;
    dropdown.appendChild(opt);
  });
}
function logBroadcast(action, userAddress) {
  const timestamp = new Date().toLocaleString();
  const message = `[${timestamp}] ${action} işlemi ${userAddress} adresi için kurumlara yayınlandı. (SAÜ, İTÜ, AU, 12M...)`;
  console.log("📡 Broadcast:", message);
  alert("📡 " + message);

  // Eğer sayfada <div id="broadcastLog"> varsa, içine yaz
  const logDiv = document.getElementById("broadcastLog");
  if (logDiv) logDiv.innerText = message;
}


// ZKP Algoritmasının benzeri uygulama 
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

document.getElementById("registerBtn").onclick = async () => {
  const name = document.getElementById("nameInput").value;
  const idNumber = document.getElementById("idInput").value;

  if (!name || !idNumber) {
    alert("❗ Lütfen tüm alanları doldurun.");
    return;
  }

  try {
    // ID'yi hashle
    const idHash = await sha256(idNumber);

    // IPFS'ye kayıt
    const ipfsHash = await uploadToPinata({ name, idHash });
    console.log("✅ IPFS hash alındı:", ipfsHash);

    // Blockchain'e kayıt
    const selectedRole = parseInt(document.getElementById("roleSelect").value);
    await contract.methods.register(name, ipfsHash, selectedRole).send({
      
      from: accounts[0],
      gas: 3000000,
      gasPrice: web3.utils.toWei('20', 'gwei')
    }).on('receipt', function(receipt){
        console.log("✅ Blockchain kaydı başarılı:", receipt);
        alert(`✅ Kayıt başarılı! IPFS Hash: ${ipfsHash}`);
        logBroadcast("Kayıt", accounts[0]);
      })
      
      .on('error', function(error, receipt) {
        console.error("🚫 Blockchain kaydı başarısız:", error);
        alert("🚫 Blockchain kaydı sırasında hata oluştu: " + error.message);
      });

  } catch (err) {
    console.error("🚫 Genel hata:", err);
    alert("🚫 Kayıt sırasında hata oluştu.");
  }
};


function logBroadcast(action, userAddress) {
  const timestamp = new Date().toLocaleString();
  const message = `[${timestamp}] ${action} işlemi ${userAddress} adresi için kurumlara yayınlandı. (SAÜ, İTÜ, AU, 12M...)`;
  console.log("📡 Broadcast:", message);
  alert("📡 " + message);
}



async function uploadToPinata(data) {
  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      pinataMetadata: { name: "KimlikVerisi" },
      pinataContent: data
    }, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      }
    });

    console.log("✅ IPFS hash alındı:", res.data.IpfsHash);
    return res.data.IpfsHash;
  } catch (err) {
    console.error("🚫 IPFS yükleme hatası:", err.response ? err.response.data : err.message);
    alert("IPFS yükleme sırasında hata oluştu.");
    return null;
  }
}
if (!contract) {
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(contractABI, contractAddress);
}

document.getElementById("loginBtn").onclick = async () => {
  const enteredIdNumber = document.getElementById("idInput").value.trim();
  const enteredName = document.getElementById("nameInput").value.trim();

 if (!enteredIdNumber || !enteredName) {
  alert("Lütfen ad ve kimlik numarası alanlarını doldurun.");
  return;
  }
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI, contractAddress);
  }

  console.log("🎯 Giriş başlatılıyor...");
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    // Kullanıcının rolünü çek
    const roleIndex = await contract.methods.getUserRole(account).call();
    const roleMap = ["None", "Citizen", "Officer", "Admin"];
    const userRole = roleMap[roleIndex];
    console.log("🎭 Kullanıcının Rolü:", userRole);
    
// Eğer rol atanmamışsa giriş yapmasın
    if (userRole === "None") {
      alert("⛔ Yetkiniz yok. Sisteme giriş için rol atanmalı.");
      return;
    }
    const user = await contract.methods.getUser(account).call();
    console.log("🧠 getUser sonucu:", user);

    if (userRole === "Admin") {
      const section = document.getElementById("roleAssignSection");
      if (section) {
        section.style.display = "block";
      }
      fillUserDropdown(); // kullanıcı listesini doldur
    } else if (userRole === "Officer") {
      window.location.href = "officer.html";  // ✅ Memur paneline yönlendir
    } else {
      window.location.href = "dashboard.html";
    }

    const name = user[0];
    const ipfsHash = user[1];
    if (!ipfsHash) {
      alert("⛔ IPFS Hash bulunamadı!");
      return;
    }
   

    console.log("🌐 Blockchain'den gelen kullanıcı bilgisi:", name, ipfsHash);
    console.log("Blockchain'den gelen kullanıcı bilgisi:", name, ipfsHash);

    if (name.trim() === "" && ipfsHash.trim() === "") {
      alert("🚫 Giriş başarısız! Kullanıcı bulunamadı veya kayıt edilmemiş.");
      return;
    }

    // IPFS verisini çek
    const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    const ipfsData = await response.json();
    console.log("IPFS'den gelen veri:", ipfsData);

    const enteredIdNumber = document.getElementById("idInput").value;
    const enteredName = document.getElementById("nameInput").value;

    // Hash karşılaştırması (ZKP benzeri)
    const enteredIdHash = await sha256(enteredIdNumber);

    if (
      ipfsData.idHash === enteredIdHash &&
      ipfsData.name.trim().toLowerCase().includes(enteredName.trim().toLowerCase())
    )
 {
      alert(`✅ Giriş Başarılı! Hoşgeldin ${name}`);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", name);
      localStorage.setItem("userAccount", accounts[0]);
     if (userRole === "Admin") {
      const section = document.getElementById("roleAssignSection");
      if (section) {
        section.style.display = "block";
      }
      fillUserDropdown();
    }
 else {
    // Sadece vatandaş veya memur yönlendirilir
        window.location.href = "dashboard.html";
  }
} else {
  alert("🚫 Giriş başarısız! Bilgiler uyuşmuyor.");
}

  } catch (error) {
    console.error("Login sırasında hata:", error);
    alert("🚫 Giriş sırasında hata oluştu!");
  }
};

// Kayıtlı kullanıcıları listeleme butonuna basınca çalışacak
document.getElementById("listBtn").onclick = async () => {
  try {
    const users = await contract.methods.getAllUsers().call();
    console.log("📋 Kayıtlı Kullanıcılar:");
    users.forEach((userAddress, index) => {
      console.log(`${index + 1}. Kullanıcı Adresi: ${userAddress}`);
    });

    if (users.length === 0) {
      alert("🚫 Hiç kullanıcı kaydı bulunamadı.");
    } else {
      alert(`✅ Toplam ${users.length} kullanıcı bulundu!`);
    }
  } catch (error) {
    console.error("🚫 Kullanıcı listesi çekilirken hata oluştu:", error);
    alert("🚫 Kullanıcı listesi çekilemedi!");
  }
};

document.getElementById("updateBtn").onclick = async () => {
  const name = document.getElementById("nameInput").value;
  const idNumber = document.getElementById("idInput").value;

  if (!name || !idNumber) {
    alert("❗ Lütfen tüm alanları doldurun.");
    return;
  }

  try {
    const idHash = await sha256(idNumber);
    const ipfsHash = await uploadToPinata({ name, idHash });
    console.log("✅ Yeni IPFS hash alındı:", ipfsHash);

    await contract.methods.updateUser(name, ipfsHash).send({
      from: accounts[0],
      gas: 3000000,
      gasPrice: web3.utils.toWei('20', 'gwei')
    });
    logBroadcast("Bilgi Güncelleme", accounts[0]);


    alert("✅ Bilgiler güncellendi!");
  } catch (error) {
    console.error("🚫 Güncelleme hatası:", error);
    alert("🚫 Güncelleme sırasında hata oluştu.");
  }
};
window.addEventListener("load", () => {
  const applyBtn = document.getElementById("applyRoleBtn");
  if (applyBtn) {
    applyBtn.onclick = async () => {
      const address = document.getElementById("targetUser").value;
      const newRole = parseInt(document.getElementById("targetRole").value);

      if (!web3.utils.isAddress(address)) {
        alert("⛔ Geçersiz adres!");
        return;
      }

      try {
        await contract.methods.setUserRole(address, newRole).send({
          from: accounts[0],
        });
        alert("✅ Rol atama başarılı!");
      } catch (err) {
        console.error("🚫 Rol atama hatası:", err);
        alert("🚫 Rol atama başarısız!");
      }
    };
  }
});




