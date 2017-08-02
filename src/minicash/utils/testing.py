from http.client import responses as http_responses

from django.contrib.auth.models import Permission
from django.test import TransactionTestCase
from rest_framework import status
from rest_framework.test import APITransactionTestCase

from minicash.auth.tests.factories import UserFactory


class TestCase(TransactionTestCase):
    pass


class WithOwnerTestMixin:
    def _setUp(self):
        self.user = UserFactory(permissions=permissions_for('record'))
        if getattr(self, 'client', False):
            self.client.login(username=self.user.username,
                              password=self.user.raw_password)
        self.owner = self.user


class ModelTestCase(WithOwnerTestMixin, APITransactionTestCase):
    def setUp(self):
        super().setUp()
        WithOwnerTestMixin._setUp(self)


class RESTTestCase(WithOwnerTestMixin, APITransactionTestCase):
    def setUp(self):
        super().setUp()
        WithOwnerTestMixin._setUp(self)

    def jget(self, url, *args, **kwargs):
        return self.client.get(url, content_type='application/json', *args, **kwargs)

    def post(self, *args, **kwargs):
        return self.client.post(*args, **kwargs)

    def jpost(self, url, data=None, *args, **kwargs):
        data = data or {}
        return self.client.post(url, data=data, format='json', *args, **kwargs)

    def jpatch(self, url, data=None, *args, **kwargs):
        data = data or {}
        return self.client.patch(url, data=data, format='json', *args, **kwargs)

    def delete(self, url, *args, **kwargs):
        return self.client.delete(url, format='json', *args, **kwargs)

    def assert_success(self, response):
        return self.assert_status(response, status.HTTP_200_OK)

    def assert_created(self, response):
        return self.assert_status(response, status.HTTP_201_CREATED)

    def assert_updated(self, response):
        return self.assert_success(response)

    def assert_bad(self, response):
        return self.assert_status(response, status.HTTP_400_BAD_REQUEST)

    def assert_deleted(self, response):
        return self.assert_status(response, status.HTTP_204_NO_CONTENT)

    def assert_status(self, response, status_code):
        if response.status_code != status_code:
            msg = "Response status is {} ({}), not {} ({})".format(
                response.status_code, http_responses[response.status_code],
                status_code, http_responses[status_code]
            )
            raise self.failureException(msg)


def permissions_for(model, app=None):
    """Generate permissions based"""
    return [Permission.objects.get(codename='{}_{}'.format(p, model))
            for p in ('add', 'change', 'delete')]
