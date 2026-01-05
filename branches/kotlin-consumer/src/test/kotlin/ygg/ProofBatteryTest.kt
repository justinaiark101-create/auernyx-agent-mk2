package ygg

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import java.nio.file.Files

class ProofBatteryTest {

    @Test
    fun `missing required field refuses`() {
        val bad = """{ "canonical_payload_digest":"abc", "canonical_event_id":"e1", "parser_version":"v1" }"""
        val ex = assertFailsWith<IllegalArgumentException> {
            Envelope.fromJsonString(bad)
        }
        // prove we fail on the exact missing field
        require(ex.message!!.contains("canonical_payload_json_path"))
    }

    @Test
    fun `digest mismatch detected`() {
        val tempDir = Files.createTempDirectory("ygg-kotlin-test")
        val payload = tempDir.resolve("payload.json")
        Files.writeString(payload, """{"hello":"world"}""", Charsets.UTF_8)

        val wrongDigest = "00".repeat(32) // definitely wrong
        val envJson = """
            {
              "canonical_payload_json_path":"${payload.toString().replace("\\", "\\\\")}",
              "canonical_payload_digest":"$wrongDigest",
              "canonical_event_id":"evt-1",
              "parser_version":"v1"
            }
        """.trimIndent()

        val env = Envelope.fromJsonString(envJson)
        val check = env.verifyDigest()
        assertEquals(false, check.ok)
    }

    @Test
    fun `receipt schema parity includes locked fields`() {
        val r = GovernanceReceipt(
            decision_code = DecisionCodes.OK_PREVIEW_ONLY,
            write_gate = WriteGate(env = false, armed = false),
            git_porcelain_pre = "",
            git_porcelain_post = "",
            canon_gitignore_ok = true,
            protected_path_violation = false,
            plan_hash_sha256 = "",
            diff_hash_sha256 = "",
            receipt_hash_sha256 = "",
            message = "",
            timestamp_local = "local",
            timestamp_utc = "utc",
            repo_root = "repo",
            invocation = mapOf("intent" to "test"),
        )

        val json = r.toJson()
        // Minimal field presence checks (contract shape)
        require(json.contains("\"decision_code\""))
        require(json.contains("\"write_gate\""))
        require(json.contains("\"git_porcelain_pre\""))
        require(json.contains("\"git_porcelain_post\""))
        require(json.contains("\"canon_gitignore_ok\""))
        require(json.contains("\"protected_path_violation\""))
        require(json.contains("\"plan_hash_sha256\""))
        require(json.contains("\"diff_hash_sha256\""))
        require(json.contains("\"receipt_hash_sha256\""))
        require(json.contains("\"timestamp_local\""))
        require(json.contains("\"timestamp_utc\""))
        require(json.contains("\"repo_root\""))
        require(json.contains("\"invocation\""))
    }
}
