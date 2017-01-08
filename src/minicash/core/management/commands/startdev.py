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

#    You should have received a copy of the GNU General Public License

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
            saldo=500,
            owner=user,
        ).save()

        Asset(
            name='Wallet',
            description='My wallet',
            saldo=30,
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
