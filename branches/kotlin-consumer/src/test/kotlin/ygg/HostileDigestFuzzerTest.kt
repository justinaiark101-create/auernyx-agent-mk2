package ygg

import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertFalse
import java.nio.file.Files

/**
 * Hostile branch: tries hard to break digest verification.
 * Passing means refusal logic holds under stress.
 */
class HostileDigestFuzzerTest {

    @Test
    fun `digest fuzzer - random payloads always mismatch with wrong digest`() {
        val tempDir = Files.createTempDirectory("ygg-digest-fuzz")
        val payload = tempDir.resolve("payload.json")

        // Keep iteration count modest for CI; this is a hammer, not a benchmark.
        repeat(250) {
            val n = Random.nextInt(1, 2048)
            val bytes = ByteArray(n)
            Random.nextBytes(bytes)
            Files.write(payload, bytes)

            val wrong = "00".repeat(32)
            val envJson = """
                {
                  "canonical_payload_json_path":"${payload.toString().replace("\\", "\\\\")}",
                  "canonical_payload_digest":"$wrong",
                  "canonical_event_id":"evt-fuzz-$it",
                  "parser_version":"v1"
                }
            """.trimIndent()

            val env = Envelope.fromJsonString(envJson)
            val check = env.verifyDigest()
            assertFalse(check.ok)
        }
    }
}
