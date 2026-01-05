package ygg

import java.nio.file.Files
import java.nio.file.Path

/**
 * Minimal canonical envelope fields required for sweep v1:
 * - canonical_payload_json_path: where canonical bytes live (portable)
 * - canonical_payload_digest: expected sha256 of those bytes
 * - canonical_event_id: stable event identifier
 * - parser_version: version string
 *
 * This is intentionally strict and intentionally boring.
 */
data class Envelope(
    val canonicalPayloadJsonPath: String,
    val canonicalPayloadDigest: String,
    val canonicalEventId: String,
    val parserVersion: String
) {
    fun loadCanonicalBytes(): ByteArray {
        val p = Path.of(canonicalPayloadJsonPath)
        return Files.readAllBytes(p)
    }

    fun verifyDigest(): DigestCheck {
        val bytes = loadCanonicalBytes()
        val actual = Digest.sha256Hex(bytes)
        val ok = actual.equals(canonicalPayloadDigest, ignoreCase = true)
        return DigestCheck(ok = ok, expected = canonicalPayloadDigest, actual = actual)
    }

    data class DigestCheck(val ok: Boolean, val expected: String, val actual: String)

    companion object {
        fun fromJsonString(json: String): Envelope {
            val m = TinyJson.parseFlatObject(json)

            fun req(key: String): String =
                m[key] ?: throw IllegalArgumentException("Missing required envelope field: $key")

            return Envelope(
                canonicalPayloadJsonPath = req("canonical_payload_json_path"),
                canonicalPayloadDigest = req("canonical_payload_digest"),
                canonicalEventId = req("canonical_event_id"),
                parserVersion = req("parser_version")
            )
        }

        fun fromJsonFile(path: String): Envelope {
            val bytes = Files.readAllBytes(Path.of(path))
            return fromJsonString(String(bytes, Charsets.UTF_8))
        }
    }
}
