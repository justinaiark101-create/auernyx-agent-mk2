package ygg

/**
 * Locked outcome codes (TRUNK LAW)
 * Do not add new codes without a tagged contract bump.
 */
object DecisionCodes {
    // Decisions
    const val OK_PREVIEW_ONLY = "OK_PREVIEW_ONLY"
    const val OK_APPLIED = "OK_APPLIED"

    // Refusals
    const val REFUSE_WRITE_GATE_MISSING = "REFUSE_WRITE_GATE_MISSING"
    const val REFUSE_PROTECTED_PATH = "REFUSE_PROTECTED_PATH"
    const val REFUSE_CANON_NOT_IGNORED = "REFUSE_CANON_NOT_IGNORED"
    const val REFUSE_AUDIT_WEAKENING = "REFUSE_AUDIT_WEAKENING"
    const val REFUSE_AMBIGUOUS_REQUEST = "REFUSE_AMBIGUOUS_REQUEST"

    val ALL: Set<String> = setOf(
        OK_PREVIEW_ONLY,
        OK_APPLIED,
        REFUSE_WRITE_GATE_MISSING,
        REFUSE_PROTECTED_PATH,
        REFUSE_CANON_NOT_IGNORED,
        REFUSE_AUDIT_WEAKENING,
        REFUSE_AMBIGUOUS_REQUEST
    )
}
