from pathlib import Path
import json

import pytest
import yaml

import release

D1 = 'sha256:' + 'a' * 64
D2 = 'sha256:' + 'b' * 64


def events(root):
    return json.loads((root / 'release-history/ledger.json').read_text())['events']


def promote(root, env, version='v1.2.0', digest=D1, action='promote'):
    e = events(root)
    release.validate_release(version, digest)
    if action == 'promote':
        release.permitted(e, env, version, digest, approve_prod=True)
    release.save_release(root, env, version, digest, action, e)


def test_version_and_digest_validation():
    release.validate_release('v1.2.3', D1)
    release.validate_release('v1.2.3-rc1', D1)

@pytest.mark.parametrize('v', ['1.2.3','v01.2.3','v1.2','v1.2.3+build','v2.2.0\n'])
def test_invalid_versions(v):
    with pytest.raises(release.ReleaseError):
        release.validate_release(v, D1)

@pytest.mark.parametrize('d', ['sha256:invalid', 'sha256:'+'0'*64, 'sha256:'+'A'*64, 'sha1:'+'a'*64])
def test_invalid_digest(d):
    with pytest.raises(release.ReleaseError):
        release.validate_release('v1.2.3', d)


def test_initial_status_empty(workspace):
    assert events(workspace) == []
    assert release.current(events(workspace), 'dev') is None


def test_dev_promotion_changes_yaml_and_ledger(workspace):
    promote(workspace,'dev')
    image = yaml.safe_load((workspace/'gitops/overlays/dev/kustomization.yaml').read_text())
    patch = yaml.safe_load((workspace/'gitops/overlays/dev/release-patch.yaml').read_text())
    assert image['images'][0]['digest'] == D1
    assert patch['spec']['template']['metadata']['annotations']['release-lab/version'] == 'v1.2.0'
    assert patch['spec']['template']['spec']['containers'][0]['env'][0]['value'] == 'v1.2.0'
    assert events(workspace)[0]['environment'] == 'dev'


def test_dev_promotion_doesnt_modify_staging(workspace):
    original = (workspace/'gitops/overlays/staging/kustomization.yaml').read_text()
    promote(workspace, 'dev')
    assert (workspace/'gitops/overlays/staging/kustomization.yaml').read_text() == original


def test_staging_needs_dev(workspace):
    with pytest.raises(release.ReleaseError, match='dev first'):
        release.permitted(events(workspace), 'staging', 'v1.2.0', D1, False)


def test_prod_needs_approval(workspace):
    with pytest.raises(release.ReleaseError, match='approve-prod'):
        release.permitted(events(workspace), 'prod', 'v1.2.0', D1, False)


def test_prod_needs_staging(workspace):
    promote(workspace,'dev')
    with pytest.raises(release.ReleaseError, match='staging first'):
        release.permitted(events(workspace), 'prod', 'v1.2.0', D1, True)


def test_immutable_digest_gate(workspace):
    promote(workspace,'dev')
    with pytest.raises(release.ReleaseError,match='same version and digest'):
        release.permitted(events(workspace), 'staging', 'v1.2.0', D2, False)


def test_full_promotion_order(workspace):
    promote(workspace,'dev')
    promote(workspace,'staging')
    promote(workspace,'prod')
    assert [e['environment'] for e in events(workspace)] == ['dev','staging','prod']


def test_duplicate_same_version_rejected(workspace):
    promote(workspace,'dev')
    with pytest.raises(release.ReleaseError,match='already points'):
        promote(workspace,'dev')
    assert len(events(workspace)) == 1


def test_rollback_to_previous_recorded_release(workspace):
    promote(workspace,'dev')
    promote(workspace,'dev','v1.3.0',D2)
    release.save_release(workspace,'dev','v1.2.0',D1,'rollback',events(workspace))
    assert release.current(events(workspace),'dev')['action'] == 'rollback'
    assert release.current(events(workspace),'dev')['digest'] == D1


def test_plan_does_not_write_files(workspace):
    before=(workspace/'gitops/overlays/dev/kustomization.yaml').read_bytes()
    assert 'UNPUBLISHED' in release.plan(events(workspace),'dev','v1.2.0',D1,False)
    assert (workspace/'gitops/overlays/dev/kustomization.yaml').read_bytes()==before


def test_bad_overlay_is_rejected(workspace):
    filename=workspace/'gitops/overlays/dev/kustomization.yaml'
    doc=yaml.safe_load(filename.read_text())
    doc['images'][0]['name']='unexpected'
    filename.write_text(yaml.safe_dump(doc))
    with pytest.raises(release.ReleaseError, match='unexpected image'):
        promote(workspace,'dev')


def test_bad_patch_is_rejected(workspace):
    filename=workspace/'gitops/overlays/dev/release-patch.yaml'
    doc=yaml.safe_load(filename.read_text())
    doc['metadata']['name']='wrong'
    filename.write_text(yaml.safe_dump(doc))
    with pytest.raises(release.ReleaseError, match='Unexpected release patch'):
        promote(workspace,'dev')


def test_cli_status(workspace,capsys):
    assert release.main(['--root',str(workspace),'status']) == 0
    assert 'UNPUBLISHED' in capsys.readouterr().out


def test_cli_promote_and_history(workspace,capsys):
    assert release.main(['--root',str(workspace),'promote','dev','--version','v1.2.0','--digest',D1]) == 0
    assert release.main(['--root',str(workspace),'history','--environment','dev']) == 0
    assert 'promote' in capsys.readouterr().out


def test_cli_block_invalid_stage(workspace,capsys):
    assert release.main(['--root',str(workspace),'promote','staging','--version','v1.2.0','--digest',D1]) == 2
    assert 'dev first' in capsys.readouterr().err


def test_cli_reject_unknown_rollback_version(workspace,capsys):
    promote(workspace,'dev')
    assert release.main(['--root',str(workspace),'rollback','dev','--to','v2.0.0']) == 2
    assert 'not previously recorded' in capsys.readouterr().err


def test_cli_rollback_prod_requires_flag(workspace,capsys):
    assert release.main(['--root',str(workspace),'rollback','prod','--to','v1.2.0']) == 2
    assert '--approve-prod' in capsys.readouterr().err


def test_cli_rollback_works(workspace):
    promote(workspace,'dev')
    promote(workspace,'dev','v1.3.0',D2)
    assert release.main(['--root',str(workspace),'rollback','dev','--to','v1.2.0']) == 0
    assert release.current(events(workspace),'dev')['digest'] == D1
