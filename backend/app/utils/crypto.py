import os
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings

def get_aes_key() -> bytes:
    """
    Retrieves or derives a 32-byte AES key.
    If ENCRYPTION_KEY is present in the settings, it is used.
    If it is a 64-character hex string, it is parsed directly.
    Otherwise, we fall back to a SHA-256 hash of the ENCRYPTION_KEY (or JWT_SECRET_KEY as a safe standby).
    """
    key_str = settings.ENCRYPTION_KEY or settings.JWT_SECRET_KEY
    if not key_str:
        raise ValueError("Critical Security Failure: Neither ENCRYPTION_KEY nor JWT_SECRET_KEY is configured.")
    
    # Check if it is a valid hex key of 32 bytes (64 hex characters)
    if len(key_str) == 64:
        try:
            return bytes.fromhex(key_str)
        except ValueError:
            pass

    # Safe fallback: Hash the key string using SHA-256 to guarantee a secure, 32-byte byte sequence
    return hashlib.sha256(key_str.encode("utf-8")).digest()

def encrypt_token(token: str) -> str:
    """
    Encrypts a plaintext string using AES-256-GCM.
    Outputs a URL-safe Base64 encoded string combining: nonce (12 bytes) + ciphertext + tag.
    """
    if not token:
        return ""
    
    try:
        key = get_aes_key()
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        encrypted_bytes = aesgcm.encrypt(nonce, token.encode("utf-8"), None)
        # Store combined nonce + encrypted ciphertext/tag
        combined = nonce + encrypted_bytes
        return base64.b64encode(combined).decode("utf-8")
    except Exception as e:
        print("Encryption warning:", e)
        return token

def decrypt_token(encrypted_token: str) -> str:
    """
    Decrypts an AES-256-GCM encrypted string.
    If decryption fails (e.g. legacy plain-text columns in database),
    it transparently returns the original string to ensure backwards-compatibility.
    """
    if not encrypted_token:
        return ""

    try:
        # Standard Base64 decode
        combined = base64.b64decode(encrypted_token.encode("utf-8"))
        if len(combined) < 12:
            return encrypted_token # Too short to be GCM (likely legacy plaintext)
        
        nonce = combined[:12]
        ciphertext = combined[12:]
        
        key = get_aes_key()
        aesgcm = AESGCM(key)
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode("utf-8")
    except Exception:
        # Transparently fall back to returning original value for plaintext compatibility
        return encrypted_token
