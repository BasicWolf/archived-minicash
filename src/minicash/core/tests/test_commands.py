from django.core.management.base import CommandError

from minicash.utils.testing import TestCase
from minicash.core.management.commands.startdev import Command as StartDevCommand



class StartDevTest(TestCase):
    def test_smoke(self):
        pass

    def test_does_not_run_twice(self):
        cmd = StartDevCommand()
        cmd.handle()
        self.assertRaises(CommandError, cmd.handle)

