from moneyed import Money

from .models import Record, Asset


def update_asset(record):
    if record.mode == Record.TRANSFER:
        assert(
            record.asset_to.saldo.currency == record.asset_from.saldo.currency,
            'Different currencies'
        )

    if record.mode in (Record.EXPENSE, Record.TRANSFER):
        asset_from = record.asset_from
        delta_money = Money(amount=record.delta, currency=asset_from.saldo.currency)
        asset_from.saldo -= delta_money
        asset_from.save()

    if record.mode in (Record.INCOME, Record.TRANSFER):
        asset_to = record.asset_to
        delta_money = Money(amount=record.delta, currency=asset_to.saldo.currency)
        asset_to.saldo += delta_money
        asset_to.save()
