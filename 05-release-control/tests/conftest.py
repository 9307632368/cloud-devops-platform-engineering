import shutil
from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))

@pytest.fixture
def workspace(tmp_path):
    shutil.copytree(ROOT / 'gitops', tmp_path / 'gitops')
    shutil.copytree(ROOT / 'release-history', tmp_path / 'release-history')
    return tmp_path
