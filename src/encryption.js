// encryption.js
import CryptoJS from 'crypto-js';

const secretKey = 'JiyanTechPrivate'; // Use a strong key and keep it safe

// Function to encode to a-z, A-Z, 0-9
const base64UrlEncode = (input) => {
  // Convert to Base64
  let base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input));
  // Replace + with -, / with _, and remove padding =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Function to decode from a-z, A-Z, 0-9
const base64UrlDecode = (input) => {
  // Replace - with +, _ with /, and add padding
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (base64.length % 4) {
    base64 += '=';
  }
  return CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);
};

// Function to encrypt the ID
export const encryptId = (id) => {
  const encrypted = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return base64UrlEncode(encrypted);
};

// Function to decrypt the ID
export const decryptId = (encryptedId) => {
  const decryptedBase64 = base64UrlDecode(encryptedId);
  const bytes = CryptoJS.AES.decrypt(decryptedBase64, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};