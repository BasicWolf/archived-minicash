from minicash.utils.testing import TestCase, WithOwnerTestMixin

from minicash.core.models import Record

from minicash.frontend.context import build_context


class ContextTestCase(WithOwnerTestMixin, TestCase):
    def setUp(self):
        super().setUp()
        WithOwnerTestMixin._setUp(self)

        self.context = build_context(
            user=self.user
        )

    def test_record_modes(self):
        self.assertIn('RECORD_MODES', self.context)

        self.assertEqual(
            ['EXPENSE', 'INCOME', 'TRANSFER'],
            list(self.context['RECORD_MODES'].keys())
        )

        self.assertEqual(
            Record.INCOME,
            self.context['RECORD_MODES']['INCOME']['value']
        )

        self.assertEqual(
            'Expense',
            self.context['RECORD_MODES']['EXPENSE']['label']
        )
