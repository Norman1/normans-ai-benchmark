# Norman's AI Benchmark

My private AI benchmark.

**https://norman1.github.io/normans-ai-benchmark/**

## Running it locally

```bash
npm start
```

Then open <http://localhost:4173>.

## Layout

```
src/engine/      Game rules. Pure, deterministic, no I/O.
src/runtime/     Web Worker bot sandbox and the browser match runner.
src/ui/          Site shell, left menu, router.
benchmarks/      One folder per benchmark.
bots/            Bot submissions. One self-contained ES module each.
assets/          Map geometry.
```

See `BOT_API.md` to write a bot, `benchmarks/tabernacle/SPEC.md` for the
Tabernacle brief.
