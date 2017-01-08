from factory import Faker, post_generation
from factory.django import DjangoModelFactory
from django.contrib.auth.models import User, Permission

from minicash.utils.factories import FuzzyText


class UserFactory(DjangoModelFactory):
    username = Faker('user_name', locale='en_US')
    email = Faker('email', locale='en_US')

    class Meta(object):
        model = User

    @post_generation
    def password(self, create, extracted, **kwargs):
        if not create:
            return
        password = extracted or FuzzyText(length=10).fuzz()
        self.raw_password = password
        self.set_password(self.raw_password)
        return self.password

    @post_generation
    def permissions(self, create, extracted, **kwargs):
        if not create:
            return
        if not extracted:
            return

        for perm in extracted:
            if isinstance(perm, str):
                permission = Permission.objects.get(codename=perm)
            else:
                permission = perm
            self.user_permissions.add(permission)
