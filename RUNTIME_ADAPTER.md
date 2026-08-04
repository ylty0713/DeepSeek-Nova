# Runtime adapter

The public repository contains the DeepSeek Nova desktop interface and local orchestration layer only. It intentionally does not include or modify any proprietary third-party agent runtime.

For development, set `DEEPSEEK_NOVA_RUNTIME_ADAPTER` to an adapter module, or set `DEEPSEEK_NOVA_RUNTIME_COMMAND` for the included forwarding adapter. The configured runtime must be software that you own or are licensed to use and redistribute.

The desktop process currently expects a command-line adapter that accepts the arguments emitted by `desktop/main.mjs` and writes newline-delimited JSON events to standard output. Event categories used by the UI include assistant text, progress, approvals, token usage, completion and errors.

Do not copy a proprietary runtime into this repository or its release artifacts unless its copyright owner has granted the necessary redistribution rights.
