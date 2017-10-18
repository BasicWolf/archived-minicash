import datetime
from datetime import timezone

import factory.random
from factory import fuzzy


class FuzzyFactorySequence(fuzzy.FuzzyAttribute):
    def __init__(self, sub_factory, min_count=1, max_count=10, f_args=None, f_kwargs=None, **kwargs):  # pylint: disable=too-many-arguments
        f_args = f_args or {}
        f_kwargs = f_kwargs or {}

        sub_factory = sub_factory
        count = factory.random.randgen.randint(min_count, max_count)

        def fuzzer():
            return sub_factory.create_batch(count, **f_args, **f_kwargs)

        super().__init__(fuzzer, **kwargs)


class FuzzyDateTime(fuzzy.FuzzyDateTime):
    def __init__(self,
                 start_dt=datetime.datetime(1970, 1, 1, tzinfo=timezone.utc),
                 end_dt=datetime.datetime(datetime.MAXYEAR, 12, 31, tzinfo=timezone.utc)):
        super().__init__(start_dt, end_dt)


class FuzzyText(fuzzy.FuzzyText):
    def __init__(self, length=10, min_length=0, max_length=60):
        length = length or factory.random.randgen.randint(min_length, max_length)
        super().__init__(length=length)


class FuzzyFieldChoice(fuzzy.FuzzyChoice):
    """Fuzzy Django Model Choice field value"""

    def fuzz(self):
        pair = super().fuzz()
        return pair[0]


class FuzzyDecimal(fuzzy.FuzzyDecimal):
    def __init__(self, low=0.001, high=100000000):
        super().__init__(low, high, 3)
