package ygg

import java.security.MessageDigest

object Digest {
    fun sha256Hex(bytes: ByteArray): String {
        val md = MessageDigest.getInstance("SHA-256")
        val hash = md.digest(bytes)
        return hash.joinToString("") { "%02x".format(it) } // lowercase hex
    }
}
