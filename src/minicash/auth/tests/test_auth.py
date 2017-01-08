from minicash.utils.testing import TestCase

from .factories import UserFactory


class UserFactoryTestCase(TestCase):
    def test_smoke(self):
        UserFactory()

    def test_profile(self):
        user = UserFactory()
        self.assertIsNotNone(user.profile)
