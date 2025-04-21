"""Convenience script for the checks that do not need a Docker engine."""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
steps = [
    [sys.executable, '-m', 'unittest', 'discover', '-s', str(root/'checks'), '-p', 'test_*.py'],
    [sys.executable, '-m', 'unittest', 'discover', '-s', str(root/'incident-kit/tests'), '-p', 'test_*.py'],
    ['node', '--test', str(root/'service/test/server.test.js'), str(root/'drills/test/load-generator.test.js')],
]
for step in steps:
    print('+', ' '.join(step), flush=True)
    if subprocess.call(step, cwd=root) != 0:
        raise SystemExit(1)
print('Local checks passed. Docker/Prometheus/Grafana integration still needs to be tested.')
