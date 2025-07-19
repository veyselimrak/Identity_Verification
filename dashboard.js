// Güncel contract adresi ve ABI
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
let userAccount;
let userRole = "";


// Pinata API Key ve Secret (aynı app.js ile uyumlu)
const PINATA_API_KEY = "3255e321a2b008646cb1";
const PINATA_API_SECRET = "632a8ad77184b0e545aae9775b56e521530d3bbdd07c26fbd7319ce936bf6c50";

// SHA256 hash fonksiyonu (aynı app.js ile uyumlu)
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
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
    return res.data.IpfsHash;
  } catch (err) {
    alert("IPFS yükleme hatası: " + (err.response?.data || err.message));
    return null;
  }
}

window.addEventListener('load', async () => {
  if (!window.ethereum) {
    alert("MetaMask bulunamadı!");
    return;
  }
  if (userRole === "Admin") {
    document.getElementById("roleBtn").style.display = "block";
  }


  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(contractABI, contractAddress);

  userAccount = localStorage.getItem('userAccount');
  if (!userAccount) {
    alert("Oturum bulunamadı. Lütfen giriş yapınız.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById('userAddress').innerText = userAccount;

  try {
    const [name, ipfsHash, roleIndex] = await contract.methods.getUser(userAccount).call();
    const roleMap = ["None", "Citizen", "Officer", "Admin"];
    userRole = roleMap[roleIndex];

    document.getElementById('userName').innerText = `${name || "(Bilgi yok)"} (${userRole})`;
    if (userRole === "Admin") {
      document.getElementById("roleBtn").style.display = "block";
    }
    if (userRole === "Officer") {
      document.getElementById("verifySection").style.display = "block";
      listUnverifiedUsers();
}


    if (!ipfsHash) {
      document.getElementById('authStatus').innerText = "Doğrulanmamış";
      return;
    }

    const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    const ipfsData = await response.json();

    document.getElementById('authStatus').innerText = "Doğrulandı";
    document.getElementById('nameInput').value = name;
    document.getElementById('idInput').value = "";

  } catch (err) {
    alert("Kullanıcı bilgileri alınamadı: " + err.message);
  }

  listAllUsers();
});

async function listAllUsers() {
  try {
    const users = await contract.methods.getAllUsers().call();
    const userList = document.getElementById('userList');
    userList.innerHTML = "";

    for (const addr of users) {
      const [name, ipfsHash, roleIndex, isVerified] = await contract.methods.getUser(addr).call();
      const li = document.createElement('li');
      li.className = "list-group-item d-flex justify-content-between align-items-center";

      const roleMap = ["None", "Citizen", "Officer", "Admin"];
      const role = roleMap[roleIndex];

      li.innerHTML = `${name} (${role}) - ${addr} ${isVerified ? "<span class='badge bg-success'>✔ Doğrulandı</span>" : "<span class='badge bg-warning text-dark'>Bekliyor</span>"}`;

      if (roleMap.includes(userRole) && (userRole === "Officer" || userRole === "Admin") && !isVerified) {
        const viewBtn = document.createElement("a");
        viewBtn.href = `https://ipfs.io/ipfs/${ipfsHash}`;
        viewBtn.target = "_blank";
        viewBtn.className = "btn btn-info btn-sm me-2";
        viewBtn.innerText = "🗂 İncele";

        const btn = document.createElement("button");
        btn.textContent = "✅ Onayla";
        btn.className = "btn btn-sm btn-primary ms-2";
        btn.onclick = async () => {
          try {
            await contract.methods.verifyUser(addr).send({ from: userAccount });
            alert("✅ Kullanıcı doğrulandı!");
            listAllUsers(); // Listeyi güncelle
          } catch (err) {
            alert("🚫 Doğrulama hatası: " + err.message);
          }
        };
        li.appendChild(viewBtn);
        li.appendChild(btn);

      }

      userList.appendChild(li);
    }

  } catch (err) {
    alert("Kullanıcı listesi alınamadı: " + err.message);
  }
}

document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("nameInput").value.trim();
  const idNumber = document.getElementById("idInput").value.trim();

  if (!name || !idNumber) {
    alert("Lütfen tüm alanları doldurun!");
    return;
  }

  try {
    const idHash = await sha256(idNumber);
    const ipfsHash = await uploadToPinata({ name, idHash });
    if (!ipfsHash) return;

    await contract.methods.updateUser(name, ipfsHash).send({ from: userAccount });
    alert("Bilgiler başarıyla güncellendi!");
  } catch (err) {
    alert("Güncelleme işlemi başarısız: " + err.message);
  }
});

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "index.html";
};
document.getElementById("roleBtn").onclick = () => {
  const section = document.getElementById("roleAssignSection");
  if (section) {
    section.style.display = "block";
    fillUserDropdown();
  }
};
async function listUnverifiedUsers() {
  try {
    const users = await contract.methods.getAllUsers().call();
    const list = document.getElementById('unverifiedUserList');
    list.innerHTML = "";

    for (const addr of users) {
      const [name, ipfsHash, roleIndex, isVerified] = await contract.methods.getUser(addr).call();
      console.log("Kullanıcı kontrol ediliyor:", addr, name, isVerified);
      if (!isVerified) {
        const roleMap = ["None", "Citizen", "Officer", "Admin"];
        const role = roleMap[roleIndex];

        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `${name} (${role}) - ${addr}`;

        const btn = document.createElement("button");
        btn.textContent = "✅ Onayla";
        btn.className = "btn btn-sm btn-success";
        btn.onclick = async () => {
          try {
            await contract.methods.verifyUser(addr).send({ from: userAccount });
            alert("✅ Kullanıcı doğrulandı!");
            listUnverifiedUsers(); // Listeyi güncelle
          } catch (err) {
            alert("🚫 Doğrulama hatası: " + err.message);
          }
        };

        li.appendChild(btn);
        list.appendChild(li);
      }
    }

  } catch (err) {
    alert("🚫 Listeleme hatası: " + err.message);
  }
}


