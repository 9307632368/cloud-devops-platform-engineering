import importlib.util
import tempfile
import unittest
from pathlib import Path

source = Path(__file__).resolve().parents[1] / 'triage.py'
spec = importlib.util.spec_from_file_location('triage', source)
triage = importlib.util.module_from_spec(spec)
spec.loader.exec_module(triage)


class TriageTests(unittest.TestCase):
    def test_good_rows(self):
        records, warnings = triage.parse_lines('{"status":200,"duration_ms":12}\n{"status":503,"duration_ms":90}')
        self.assertEqual(len(records), 2)
        self.assertFalse(warnings)

    def test_blank_rows_ignored(self):
        records, warnings = triage.parse_lines(' \n\n{"status":200,"duration_ms":0}\n')
        self.assertEqual(len(records), 1)
        self.assertFalse(warnings)

    def test_invalid_json_skipped(self):
        records, warnings = triage.parse_lines('hello\n{"status":200,"duration_ms":8}')
        self.assertEqual(len(records), 1)
        self.assertEqual(len(warnings), 1)

    def test_boolean_status_is_not_integer(self):
        records, warnings = triage.parse_lines('{"status":true,"duration_ms":8}')
        self.assertFalse(records)
        self.assertEqual(len(warnings), 1)

    def test_negative_duration_skipped(self):
        records, warnings = triage.parse_lines('{"status":200,"duration_ms":-5}')
        self.assertFalse(records)
        self.assertEqual(len(warnings), 1)

    def test_missing_duration_skipped(self):
        records, warnings = triage.parse_lines('{"status":200}')
        self.assertFalse(records)
        self.assertEqual(len(warnings), 1)

    def test_invalid_status_range(self):
        for status in [99, 600]:
            rows, problems = triage.parse_lines(f'{{"status":{status},"duration_ms":3}}')
            self.assertFalse(rows)
            self.assertTrue(problems)

    def test_summarize_counts(self):
        stats = triage.summarize([{'status':200,'duration_ms':10,'route':'quote'}, {'status':503,'duration_ms':60,'route':'quote'}])
        self.assertEqual(stats['count'], 2)
        self.assertEqual(stats['server_errors'], 1)
        self.assertEqual(stats['error_rate_pct'], 50)
        self.assertEqual(stats['p95_ms'], 60)
        self.assertEqual(stats['statuses'], {'200':1,'503':1})

    def test_empty_summarize(self):
        self.assertIsNone(triage.summarize([])['p95_ms'])

    def test_missing_route_becomes_unknown(self):
        self.assertEqual(triage.summarize([{'status':200,'duration_ms':0}])['routes'], {'unknown':1})

    def test_report_has_actions_and_caveat(self):
        report = triage.build_report(triage.summarize([{'status':503,'duration_ms':500}]), [], 'x.jsonl')
        self.assertIn('needs investigation', report)
        self.assertIn('not** proof of a real outage', report)

    def test_sample_file_is_valid(self):
        sample = source.parent / 'sample-service-logs.jsonl'
        rows, warnings = triage.parse_lines(sample.read_text())
        self.assertEqual(len(rows), 8)
        self.assertEqual(warnings, [])


if __name__ == '__main__':
    unittest.main()
