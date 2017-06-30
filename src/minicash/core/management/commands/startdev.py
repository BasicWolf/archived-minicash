from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from minicash.core.models import Asset, Tag


class Command(BaseCommand):
    help = 'Fills database with various fixtures for development bootstrapping'

    def handle(self, *args, **options):
        if not self.is_safe_to_run():
            raise CommandError('Cannot bootstrap a non-empty database')

        self._create_users()

        users = User.objects.filter(username__in=['test'])
        for user in users:
            self._create_assets(user)
            self._create_tags(user)

    def is_safe_to_run(self):
        return User.objects.filter(username='admin').count() == 0

    def _create_users(self):
        User.objects.create_superuser('admin', 'admin@minicash.app', password='admin')
        User.objects.create_user('test', 'test@minicash.app', password='test')
        self._print_success('Created admin and test users')

    def _create_assets(self, user):
        Asset(
            name='Checking account',
            description='Main bank account',
            balance=500,
            owner=user,
        ).save()

        Asset(
            name='Wallet',
            description='My wallet',
            balance=30,
            owner=user
        ).save()

        self._print_success('Created assets for {}'.format(user.username))

    def _create_tags(self, user):
        Tag(
            name='groceries',
            description='Groceries',
            owner=user,
        ).save()

        Tag(
            name='commuting',
            description='Public transportation commuting',
            owner=user,
        ).save()

        Tag(
            name='lunch',
            description='Lunch',
            owner=user,
        ).save()

        self._print_success('Tags created for {}'.format(user.username))

    def _print_success(self, s):
        self.stdout.write(self.style.SUCCESS(s))
