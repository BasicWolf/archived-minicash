#    Copyright (C) 2017 Zaur Nasibov and contributors
#
#    This file is part of Minicash.

#    Minicash is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.

#    Foobar is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.

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

