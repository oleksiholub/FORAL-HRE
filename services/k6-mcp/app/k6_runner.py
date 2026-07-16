from __future__ import annotations

import asyncio
import re
import uuid
from dataclasses import dataclass
from pathlib import Path

DURATION_RE = re.compile(r"^d+(ms|s|m)$")


@dataclass(frozen=True)
class K6RunResult:
    ok: bool
    exit_code: int
    stdout: str
    stderr: str
    script_path: str
    duration: str
    vus: int
    mode: str


def _validate_duration(duration: str) -> None:
    if not DURATION_RE.match(duration):
        raise ValueError("duration must match ^\\d+(ms|s|m)$, e.g. 10s, 1m, 500ms")


def _validate_vus(vus: int, max_vus: int) -> None:
    if vus < 1 or vus > max_vus:
        raise ValueError(f"vus must be in 1..{max_vus}")


def _duration_to_seconds(duration: str) -> float:
    if duration.endswith("ms"):
        return int(duration[:-2]) / 1000.0
    if duration.endswith("s"):
        return float(duration[:-1])
    if duration.endswith("m"):
        return float(duration[:-1]) * 60.0
    raise ValueError(f"unsupported duration: {duration}")


async def run_k6(
    *,
    k6_bin: str,
    work_dir: str,
    script_source: str,
    duration: str,
    vus: int,
    max_duration_seconds: int,
    max_vus: int,
    validate_only: bool = False,
) -> K6RunResult:
    if not script_source or not script_source.strip():
        raise ValueError("script_source must be non-empty")

    _validate_duration(duration)
    _validate_vus(vus, max_vus)

    seconds = _duration_to_seconds(duration)
    if seconds > max_duration_seconds:
        raise ValueError(
            f"duration {duration} exceeds service cap {max_duration_seconds}s; use Cloud Run Job for longer tests"
        )

    root = Path(work_dir)
    root.mkdir(parents=True, exist_ok=True)
    script_path = root / f"script-{uuid.uuid4().hex}.js"
    script_path.write_text(script_source, encoding="utf-8")

    if validate_only:
        cmd = [k6_bin, "inspect", str(script_path)]
        mode = "validate"
        timeout = 30.0
    else:
        cmd = [
            k6_bin,
            "run",
            "--quiet",
            "--duration",
            duration,
            "--vus",
            str(vus),
            str(script_path),
        ]
        mode = "run"
        timeout = min(seconds + 30.0, max_duration_seconds + 30.0)

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout_b, stderr_b = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.communicate()
            return K6RunResult(
                ok=False,
                exit_code=-1,
                stdout="",
                stderr=f"k6 process timed out after {timeout}s",
                script_path=str(script_path),
                duration=duration,
                vus=vus,
                mode=mode,
            )

        stdout = (stdout_b or b"").decode("utf-8", errors="replace")
        stderr = (stderr_b or b"").decode("utf-8", errors="replace")
        code = proc.returncode if proc.returncode is not None else -1
        return K6RunResult(
            ok=code == 0,
            exit_code=code,
            stdout=stdout[-20000:],
            stderr=stderr[-20000:],
            script_path=str(script_path),
            duration=duration,
            vus=vus,
            mode=mode,
        )
    finally:
        try:
            script_path.unlink(missing_ok=True)
        except OSError:
            pass


DEFAULT_SMOKE_SCRIPT = """
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '5s',
};

export default function () {
  const res = http.get('https://test.k6.io');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
""".strip()
