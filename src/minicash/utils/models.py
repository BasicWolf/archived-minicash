from django.db import models


class MinicashModelManager(models.Manager):
    def for_owner(self, owner):
        return self.filter(owner=owner)
