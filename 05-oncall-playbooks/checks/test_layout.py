"""Lightweight file checks; these are not substitutes for running Docker."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ConfigChecks(unittest.TestCase):
    def test_compose_has_four_services(self):
        data = (ROOT / 'compose.yaml').read_text()
        for service in ('service:', 'prometheus:', 'grafana:', 'alertmanager:'):
            self.assertIn(service, data)

    def test_compose_binds_ports_to_loopback(self):
        data = (ROOT / 'compose.yaml').read_text()
        for port in (8080, 9090, 9093, 3000):
            self.assertIn(f'127.0.0.1:{port}:{port}', data)

    def test_no_dashboard_password_in_compose(self):
        data = (ROOT / 'compose.yaml').read_text()
        self.assertIn('GRAFANA_ADMIN_PASSWORD:?', data)
        self.assertNotIn('admin123', data)

    def test_gitignore_excludes_dot_env(self):
        self.assertIn('.env\n', (ROOT / '.gitignore').read_text())

    def test_dashboard_parses(self):
        dash = json.loads((ROOT / 'observability/grafana/dashboards/service-health.json').read_text())
        self.assertEqual(len(dash['panels']), 4)
        self.assertTrue(all(p['targets'][0]['expr'] for p in dash['panels']))

    def test_prometheus_has_all_four_alerts(self):
        text = (ROOT / 'observability/prometheus/alerts.yml').read_text()
        self.assertEqual(text.count('- alert:'), 4)
        for name in ('LabServiceDown','LabServiceNotReady','LabHighErrorRate','LabHighLatency'):
            self.assertIn(name, text)

    def test_runbook_paths_referenced_exist(self):
        text = (ROOT / 'observability/prometheus/alerts.yml').read_text()
        for file in re.findall(r"runbook: '(runbooks/[^']+)'", text):
            self.assertTrue((ROOT / file).is_file(), file)

    def test_alertmanager_no_webhook_or_email_destinations(self):
        text = (ROOT / 'observability/alertmanager/alertmanager.yml').read_text()
        self.assertNotIn('webhook_configs:', text)
        self.assertNotIn('email_configs:', text)

    def test_troubleshooting_included(self):
        self.assertTrue((ROOT / 'notes/troubleshooting.md').exists())

    def test_runtime_is_2024_family(self):
        self.assertIn('20.18.1', (ROOT / 'service/Dockerfile').read_text())
        self.assertIn('2.55.1', (ROOT / 'compose.yaml').read_text())
        self.assertIn('11.3.0', (ROOT / 'compose.yaml').read_text())

    def test_2024_study_plan_documented(self):
        self.assertIn('2024', (ROOT / 'notes/version-notes.md').read_text())


if __name__ == '__main__':
    unittest.main()
