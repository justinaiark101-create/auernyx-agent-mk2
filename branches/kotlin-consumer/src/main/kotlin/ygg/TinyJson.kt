package ygg

/**
 * Tiny, strict JSON parser for flat objects with string values only.
 * Example supported:
 * { "k":"v", "a":"b" }
 *
 * Not supported:
 * - nested objects
 * - arrays
 * - numbers/booleans/null
 *
 * Intent: keep sweep v1 dependency-free and deterministic.
 */
object TinyJson {
    fun parseFlatObject(json: String): Map<String, String> {
        val s = json.trim()
        require(s.startsWith("{") && s.endsWith("}")) { "Expected JSON object" }

        val body = s.substring(1, s.length - 1).trim()
        if (body.isEmpty()) return emptyMap()

        val pairs = splitTopLevel(body)
        val out = mutableMapOf<String, String>()

        for (pair in pairs) {
            val idx = pair.indexOf(':')
            require(idx > 0) { "Invalid JSON pair: $pair" }
            val kRaw = pair.substring(0, idx).trim()
            val vRaw = pair.substring(idx + 1).trim()
            val key = unquote(kRaw)
            val value = unquote(vRaw)
            out[key] = value
        }

        return out
    }

    private fun splitTopLevel(body: String): List<String> {
        val parts = mutableListOf<String>()
        val sb = StringBuilder()
        var inString = false
        var escape = false

        for (ch in body) {
            if (escape) {
                sb.append(ch)
                escape = false
                continue
            }
            if (ch == '\\') {
                sb.append(ch)
                if (inString) escape = true
                continue
            }
            if (ch == '"') {
                sb.append(ch)
                inString = !inString
                continue
            }
            if (ch == ',' && !inString) {
                parts.add(sb.toString().trim())
                sb.setLength(0)
                continue
            }
            sb.append(ch)
        }
        val last = sb.toString().trim()
        if (last.isNotEmpty()) parts.add(last)
        return parts
    }

    private fun unquote(token: String): String {
        val t = token.trim()
        require(t.startsWith("\"") && t.endsWith("\"")) { "Expected quoted string, got: $token" }
        val inner = t.substring(1, t.length - 1)
        return inner.replace("\\\"", "\"").replace("\\\\", "\\")
    }
}
