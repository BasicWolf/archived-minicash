import os
import unittest

import pip
import pkg_resources


class TestRequirements(unittest.TestCase):
    def test_requirements(self):  # pylint: disable=no-self-use
        """Recursively confirm that requirements are available."""
        requirements_path = os.environ.get('REQUIREMENTS_PATH', None)
        if not requirements_path:
            return

        requirements = list(pip.req.parse_requirements(str(requirements_path), session=pip.download.PipSession()))
        requirements = [str(r.req) for r in requirements]
        pkg_resources.require(requirements)
