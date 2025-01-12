"""Small source-only checks. They do not connect to AWS or deploy resources."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(relative):
    return (ROOT / relative).read_text(encoding="utf-8")


class BlueprintChecks(unittest.TestCase):
    def test_modules_present(self):
        for name in ("network", "web-server", "artifact-bucket"):
            for file in ("main.tf", "variables.tf", "outputs.tf", "README.md"):
                with self.subTest(name=name, file=file):
                    self.assertTrue((ROOT / "building-blocks" / name / file).is_file())

    def test_stack_present(self):
        for name in ("main.tf", "outputs.tf", "variables.tf", "providers.tf", "versions.tf", "terraform.tfvars.example"):
            with self.subTest(name=name):
                self.assertTrue((ROOT / "playground" / "dev" / name).exists())

    def test_2024_pins(self):
        text = read("playground/dev/versions.tf")
        self.assertIn('required_version = "= 1.9.8"', text)
        self.assertIn('version = "= 5.70.0"', text)

    def test_no_terraform_state_in_zip(self):
        for path in ROOT.rglob("*"):
            self.assertNotIn(".terraform", path.parts)
            self.assertNotEqual(path.name, "terraform.tfstate")
            self.assertNotEqual(path.suffix, ".tfplan")

    def test_ssh_is_not_opened(self):
        text = read("building-blocks/web-server/main.tf")
        self.assertNotRegex(text, r"from_port\s*=\s*22")
        self.assertIn('http_tokens   = "required"', text)
        self.assertIn("encrypted   = true", text)

    def test_bucket_is_private(self):
        text = read("building-blocks/artifact-bucket/main.tf")
        for item in ("block_public_acls       = true", "block_public_policy     = true",
                     "ignore_public_acls      = true", "restrict_public_buckets = true",
                     'sse_algorithm = "AES256"', 'status = "Enabled"', "force_destroy = false"):
            with self.subTest(item=item):
                self.assertIn(item, text)

    def test_no_unnecessary_nat_gateway(self):
        self.assertNotIn('resource "aws_nat_gateway"', read("building-blocks/network/main.tf"))

    def test_public_and_private_subnets(self):
        text = read("building-blocks/network/main.tf")
        self.assertIn('resource "aws_subnet" "public"', text)
        self.assertIn('resource "aws_subnet" "private"', text)
        self.assertIn('resource "aws_route_table_association" "private"', text)

    def test_stack_uses_all_modules(self):
        text = read("playground/dev/main.tf")
        for n in ("network", "web", "artifacts"):
            self.assertIn(f'module "{n}"', text)

    def test_not_secret_credentials_in_provider(self):
        text = read("playground/dev/providers.tf")
        self.assertNotIn("access_key", text)
        self.assertNotIn("secret_key", text)

    def test_gitignore_state(self):
        text = read(".gitignore")
        self.assertIn("**/*.tfstate", text)
        self.assertIn("**/terraform.tfvars", text)

    def test_user_data_nginx(self):
        text = read("building-blocks/web-server/bootstrap.sh.tftpl")
        self.assertIn("dnf install -y nginx", text)
        self.assertIn("systemctl enable --now nginx", text)


if __name__ == "__main__":
    unittest.main()
