# Blockchain Tabanlı Kimlik Doğrulama Sistemi

Bu proje, merkezi kimlik doğrulama sistemlerinin güvenlik açıklarını ve merkeziyetçilik sorunlarını çözmek amacıyla geliştirilmiş bir blockchain tabanlı kimlik doğrulama uygulamasıdır. Ethereum blockchain altyapısını kullanarak, kullanıcıların kimlik bilgilerini merkezi olmayan ve güvenli bir biçimde yönetmelerine imkân sağlar.

## Kullanılan Teknolojiler

- **Ethereum Blockchain**: Dağıtık ve şeffaf işlem kayıtları sağlanmıştır.
- **Solidity**: Ethereum ağı üzerindeki akıllı sözleşmeler geliştirilmiştir.
- **IPFS (InterPlanetary File System)**: Kullanıcı verileri merkezi olmayan bir sistem üzerinde depolanmıştır.
- **Web3.js & MetaMask**: Kullanıcıların blockchain ile doğrudan ve güvenli etkileşimi için web arayüzü entegrasyonu sağlanmıştır.
- **SHA-256 Algoritması**: Kimlik bilgileri hashlenerek gizlilik ve güvenlik artırılmıştır.

## Proje Özellikleri

- Merkezi olmayan güvenli kimlik doğrulama
- Kullanıcı rolleri ve yetkilendirme yönetimi
- Kullanıcı dostu web arayüzü
- Akıllı sözleşmelerle otomatik doğrulama süreçleri
- Verilerin şifrelenmiş biçimde saklanması

## Kurulum ve Kullanım

**1. Bu repoyu klonlayın:**
```bash
git clone https://github.com/veyselimrak/Identity_Verification.git
```
**2. Gerekli bağımlılıkları yükleyin:**
```bash
npm install
```
**3. Akıllı sözleşmeleri derleyin ve dağıtın:**
```bash
truffle migrate --reset
```
**4. Uygulamayı çalıştırın:**
```bash
npm run dev
```
## Proje Özellikleri
Projeye katkıda bulunmak isterseniz, lütfen pull request oluşturun veya issues kısmından önerilerinizi paylaşın.

