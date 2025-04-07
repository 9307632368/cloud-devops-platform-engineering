from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]

def test_yaml_files_parse():
    paths=list((ROOT/'gitops').rglob('*.yaml'))
    assert len(paths)>=15
    for path in paths:
        assert isinstance(yaml.safe_load(path.read_text()),dict), path

def test_base_deployment_health_probes():
    doc=yaml.safe_load((ROOT/'gitops/base/deployment.yaml').read_text())
    assert doc['kind']=='Deployment'
    c=doc['spec']['template']['spec']['containers'][0]
    assert c['readinessProbe']['httpGet']['path']=='/readyz'
    assert c['livenessProbe']['httpGet']['path']=='/healthz'
    assert c['securityContext']['allowPrivilegeEscalation'] is False

def test_three_overlays_have_separate_namespaces():
    for env in ('dev','staging','prod'):
        file=ROOT/f'gitops/overlays/{env}/kustomization.yaml'
        doc=yaml.safe_load(file.read_text())
        assert doc['namespace']==f'parcel-{env}'
        assert doc['resources']==['../../base','namespace.yaml']

def test_argocd_manual_sync():
    for env in ('dev','staging','prod'):
        doc=yaml.safe_load((ROOT/f'gitops/argocd/{env}-application.yaml').read_text())
        assert doc['spec']['source']['path']==f'release-control/gitops/overlays/{env}'
        assert 'automated' not in doc['spec']['syncPolicy']

def test_placeholder_not_real_image():
    for env in ('dev','staging','prod'):
        doc=yaml.safe_load((ROOT/f'gitops/overlays/{env}/kustomization.yaml').read_text())
        assert doc['images'][0]['digest']=='sha256:'+'0'*64
