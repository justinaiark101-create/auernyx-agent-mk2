package ygg

import java.nio.file.Files
import java.nio.file.Path
import java.time.Instant

data class WriteGate(val env: Boolean, val armed: Boolean)

data class GovernanceReceipt(
    // Trunk contract fields (parity with yggdrasil-trunk@v1)
    val decision_code: String,
    val write_gate: WriteGate,
    val git_porcelain_pre: String,
    val git_porcelain_post: String,
    val canon_gitignore_ok: Boolean,
    val protected_path_violation: Boolean,
    val plan_hash_sha256: String,
    val diff_hash_sha256: String,
    val receipt_hash_sha256: String,
    val message: String,
    val timestamp_local: String,
    val timestamp_utc: String,
    val repo_root: String,
    val invocation: Map<String, String>,
) {
    fun toJson(): String {
        // Deterministic key order for stable hashing
        fun b(x: Boolean) = if (x) "true" else "false"
        fun esc(s: String) = s
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\r", "\\r")
            .replace("\n", "\\n")

        fun invocationJson(inv: Map<String, String>): String {
            // Sort keys for deterministic output
            val keys = inv.keys.toList().sorted()
            return buildString {
                append("{")
                for ((i, k) in keys.withIndex()) {
                    if (i > 0) append(", ")
                    append("\"").append(esc(k)).append("\": \"").append(esc(inv[k] ?: "")).append("\"")
                }
                append("}")
            }
        }

        return buildString {
            append("{\n")
            append("  \"decision_code\": \"").append(esc(decision_code)).append("\",\n")
            append("  \"write_gate\": { \"env\": ").append(b(write_gate.env))
                .append(", \"armed\": ").append(b(write_gate.armed)).append(" },\n")
            append("  \"git_porcelain_pre\": \"").append(esc(git_porcelain_pre)).append("\",\n")
            append("  \"git_porcelain_post\": \"").append(esc(git_porcelain_post)).append("\",\n")
            append("  \"canon_gitignore_ok\": ").append(b(canon_gitignore_ok)).append(",\n")
            append("  \"protected_path_violation\": ").append(b(protected_path_violation)).append(",\n")
            append("  \"plan_hash_sha256\": \"").append(esc(plan_hash_sha256)).append("\",\n")
            append("  \"diff_hash_sha256\": \"").append(esc(diff_hash_sha256)).append("\",\n")
            append("  \"receipt_hash_sha256\": \"").append(esc(receipt_hash_sha256)).append("\",\n")
            append("  \"message\": \"").append(esc(message)).append("\",\n")
            append("  \"timestamp_local\": \"").append(esc(timestamp_local)).append("\",\n")
            append("  \"timestamp_utc\": \"").append(esc(timestamp_utc)).append("\",\n")
            append("  \"repo_root\": \"").append(esc(repo_root)).append("\",\n")
            append("  \"invocation\": ").append(invocationJson(invocation)).append("\n")
            append("}\n")
        }
    }

    companion object {
        fun nowUtc(): String = Instant.now().toString()

        fun writeToDir(dir: String, filename: String = "governance.json", receipt: GovernanceReceipt) {
            require(DecisionCodes.ALL.contains(receipt.decision_code)) {
                "Non-canonical decision code: ${receipt.decision_code}"
            }
            val p = Path.of(dir)
            Files.createDirectories(p)
            val json = receipt.toJson()
            Files.writeString(p.resolve(filename), json, Charsets.UTF_8)
            Files.writeString(p.resolve(filename + ".sha256"), Digest.sha256Hex(json.toByteArray(Charsets.UTF_8)) + "\n", Charsets.UTF_8)
        }

        /**
         * Deterministic receipt-hash field (mirrors trunk pattern: hash over stable text, not self-referential).
         */
        fun computeReceiptHash(decisionCode: String, planHash: String, diffHash: String, message: String): String {
            val prefix = if (decisionCode.startsWith("OK_")) "OK" else "REFUSED"
            return Digest.sha256Hex("$prefix:$decisionCode:$planHash:$diffHash:$message".toByteArray(Charsets.UTF_8))
        }
    }
}
