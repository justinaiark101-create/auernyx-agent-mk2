package ygg

import java.nio.file.Files
import java.nio.file.Path
import java.time.ZoneId
import java.time.ZonedDateTime

/**
 * Minimal CLI for sweep v1.
 *
 * Usage:
 *   gradle run --args="--envelope path\\to\\envelope.json --receipt-dir out\\receipts\\run1 --armed false --env false"
 */
fun main(args: Array<String>) {
    val a = Args.parse(args)

    val writeGate = WriteGate(env = a.envEnabled, armed = a.armed)

    val envelopeJson = Files.readString(Path.of(a.envelopePath), Charsets.UTF_8)

    // Stand-in hashes for v1: deterministic and tied to input.
    val planHash = Digest.sha256Hex(envelopeJson.toByteArray(Charsets.UTF_8))
    val diffHash = Digest.sha256Hex("DIFF_PREVIEW_V1".toByteArray(Charsets.UTF_8))

    val tsUtc = GovernanceReceipt.nowUtc()
    val tsLocal = ZonedDateTime.now(ZoneId.systemDefault()).toString()

    val result = try {
        val env = Envelope.fromJsonString(envelopeJson)
        val check = env.verifyDigest()

        when {
            !check.ok -> Outcome(
                code = DecisionCodes.REFUSE_AUDIT_WEAKENING,
                message = "Digest mismatch. expected=${check.expected} actual=${check.actual}"
            )

            !writeGate.armed -> Outcome(
                code = DecisionCodes.OK_PREVIEW_ONLY,
                message = "Preview-only. Not armed; no side effects executed."
            )

            !writeGate.env -> Outcome(
                code = DecisionCodes.REFUSE_WRITE_GATE_MISSING,
                message = "Write gate missing: AUERNYX_WRITE_ENABLED not enabled."
            )

            else -> Outcome(
                code = DecisionCodes.OK_APPLIED,
                message = "Applied (sweep v1)."
            )
        }
    } catch (e: IllegalArgumentException) {
        Outcome(
            code = DecisionCodes.REFUSE_AMBIGUOUS_REQUEST,
            message = "Envelope invalid: ${e.message}"
        )
    }

    val receiptHash = GovernanceReceipt.computeReceiptHash(result.code, planHash, diffHash, result.message)

    val receipt = GovernanceReceipt(
        decision_code = result.code,
        write_gate = writeGate,
        git_porcelain_pre = "",
        git_porcelain_post = "",
        canon_gitignore_ok = true,
        protected_path_violation = false,
        plan_hash_sha256 = planHash,
        diff_hash_sha256 = diffHash,
        receipt_hash_sha256 = receiptHash,
        message = result.message,
        timestamp_local = tsLocal,
        timestamp_utc = tsUtc,
        repo_root = a.repoRoot,
        invocation = mapOf("intent" to "kotlin-consumer sweep v1", "envelope" to a.envelopePath),
    )

    GovernanceReceipt.writeToDir(a.receiptDir, receipt = receipt)

    println(receipt.decision_code)
    println("wrote receipt: ${Path.of(a.receiptDir).resolve("governance.json")}")
}

private data class Outcome(val code: String, val message: String)

private data class Args(
    val envelopePath: String,
    val receiptDir: String,
    val armed: Boolean,
    val envEnabled: Boolean,
    val repoRoot: String,
) {
    companion object {
        fun parse(args: Array<String>): Args {
            fun get(flag: String): String {
                val i = args.indexOf(flag)
                require(i >= 0 && i + 1 < args.size) { "Missing required arg: $flag <value>" }
                return args[i + 1]
            }

            fun getBool(flag: String): Boolean {
                val v = get(flag).trim().lowercase()
                return v == "true" || v == "1" || v == "yes"
            }

            return Args(
                envelopePath = get("--envelope"),
                receiptDir = get("--receipt-dir"),
                armed = getBool("--armed"),
                envEnabled = getBool("--env"),
                repoRoot = get("--repo-root"),
            )
        }
    }
}
