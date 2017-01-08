import datetime
from datetime import timezone

from factory import fuzzy

class FuzzyFactorySequence(fuzzy.FuzzyAttribute):
    def __init__(self, sub_factory, min_count=0, max_count=10, *args, **kwargs):
        self.sub_factory = sub_factory
        self.count = fuzzy._random.randint(min_count, max_count)
        self._args = args
        self._kwargs = kwargs

    def fuzzer(self):
        return list({self.sub_factory(*self._args, **self._kwargs)})


class FuzzyDateTime(fuzzy.FuzzyDateTime):
    def __init__(self,
                 start_dt=datetime.datetime(1970, 1, 1, tzinfo=timezone.utc),
                 end_dt=datetime.datetime(datetime.MAXYEAR, 12, 31, tzinfo=timezone.utc)):
        super().__init__(start_dt, end_dt)


class FuzzyText(fuzzy.FuzzyText):
    def __init__(self, length=10, min_length=0, max_length=60):
        length = length or fuzzy._random.randint(min_length, max_length)
        super().__init__(length=length)


class FuzzyFieldChoice(fuzzy.FuzzyChoice):
    """Fuzzy Django Model Choice field value"""

    def fuzz(self):
        pair = super().fuzz()
        return pair[0]


class FuzzyDecimal(fuzzy.FuzzyDecimal):
    def __init__(self, low=0.001, high=100000000):
        super().__init__(low, high, 3)
