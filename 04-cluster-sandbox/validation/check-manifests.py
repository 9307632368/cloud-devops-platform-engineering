"""Offline sanity checks for YAML files; not a replacement for kubectl dry-run."""
from pathlib import Path
import json
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'manifests' / 'base'


def read_yaml(path):
    data = yaml.safe_load(path.read_text(encoding='utf-8'))
    if not isinstance(data, dict):
        raise AssertionError(f'Not a YAML object: {path}')
    return data


class ManifestChecks(unittest.TestCase):
    def test_all_yaml_files_parse(self):
        all_files = list((ROOT/'manifests').rglob('*.yaml')) + list((ROOT/'clusters').rglob('*.yaml'))
        self.assertGreaterEqual(len(all_files), 15)
        for path in all_files:
            with self.subTest(path=path.name):
                self.assertTrue(read_yaml(path).get('kind'))

    def test_deployment_selector_matches_pod_labels(self):
        d = read_yaml(BASE/'deployment.yaml')
        selector = d['spec']['selector']['matchLabels']
        labels = d['spec']['template']['metadata']['labels']
        self.assertTrue(all(labels.get(k) == v for k,v in selector.items()))

    def test_service_selector_matches_pod_labels(self):
        s = read_yaml(BASE/'service.yaml')
        d = read_yaml(BASE/'deployment.yaml')
        labels = d['spec']['template']['metadata']['labels']
        self.assertTrue(all(labels.get(k) == v for k,v in s['spec']['selector'].items()))

    def test_service_target_named_container_port(self):
        s = read_yaml(BASE/'service.yaml')
        d = read_yaml(BASE/'deployment.yaml')
        ports = d['spec']['template']['spec']['containers'][0]['ports']
        self.assertIn(s['spec']['ports'][0]['targetPort'], [p['name'] for p in ports])

    def test_hpa_cpu_request_present(self):
        h = read_yaml(ROOT/'manifests/addons/hpa.yaml')
        d = read_yaml(BASE/'deployment.yaml')
        self.assertEqual(h['spec']['scaleTargetRef']['name'], d['metadata']['name'])
        self.assertIn('cpu', d['spec']['template']['spec']['containers'][0]['resources']['requests'])
        self.assertLess(h['spec']['minReplicas'], h['spec']['maxReplicas'])

    def test_image_is_local_and_2024_tag(self):
        d = read_yaml(BASE/'deployment.yaml')
        c = d['spec']['template']['spec']['containers'][0]
        self.assertEqual(c['image'], 'parcel-quote-api:2024-lab')
        self.assertEqual(c['imagePullPolicy'], 'IfNotPresent')

    def test_no_pod_service_account_token(self):
        d = read_yaml(BASE/'deployment.yaml')
        self.assertIs(d['spec']['template']['spec']['automountServiceAccountToken'], False)

    def test_non_root_read_only_container(self):
        pod = read_yaml(BASE/'deployment.yaml')['spec']['template']['spec']
        sc = pod['containers'][0]['securityContext']
        self.assertTrue(pod['securityContext']['runAsNonRoot'])
        self.assertTrue(sc['readOnlyRootFilesystem'])
        self.assertFalse(sc['allowPrivilegeEscalation'])
        self.assertIn('ALL', sc['capabilities']['drop'])

    def test_probes(self):
        c = read_yaml(BASE/'deployment.yaml')['spec']['template']['spec']['containers'][0]
        self.assertEqual(c['livenessProbe']['httpGet']['path'], '/health/live')
        self.assertEqual(c['readinessProbe']['httpGet']['path'], '/health/ready')
        self.assertEqual(c['startupProbe']['httpGet']['path'], '/health/live')

    def test_pricing_config_is_valid_json(self):
        c = read_yaml(BASE/'configmap.yaml')
        rates = json.loads(c['data']['PRICING_JSON'])
        self.assertEqual(set(rates), {'local','national','remote'})

    def test_two_namespaces_distinct(self):
        local = read_yaml(ROOT/'manifests/overlays/local/namespace.yaml')
        staging = read_yaml(ROOT/'manifests/overlays/staging/namespace.yaml')
        self.assertNotEqual(local['metadata']['name'], staging['metadata']['name'])

    def test_kind_nodeport_mapping(self):
        k = read_yaml(ROOT/'clusters/kind-v131.yaml')
        worker = next(n for n in k['nodes'] if n['role'] == 'worker')
        mapping = worker['extraPortMappings'][0]
        svc = read_yaml(ROOT/'manifests/addons/kind-nodeport.yaml')
        self.assertEqual(svc['spec']['ports'][0]['nodePort'], mapping['containerPort'])
        self.assertEqual(mapping['hostPort'], 8081)

    def test_safety_on_kind_cleanup_script(self):
        ps = (ROOT/'ops/cleanup.ps1').read_text(encoding='utf-8')
        self.assertIn("$cluster = 'student-lab'", ps)
        self.assertIn('Read-Host', ps)
        self.assertIn('kind delete cluster --name $cluster', ps)


if __name__ == '__main__':
    unittest.main(verbosity=2)
